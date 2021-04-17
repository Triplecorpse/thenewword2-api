import * as express from "express";
import {Request, Response} from "express";
import {queryDatabase} from "../services/db";
import {Word} from "../models/Word";
import {genders, languages, speechParts} from "../const/constData";
import {IWordDb} from "../interfaces/db/IWordDb";

export const wordRouter = express.Router();

wordRouter.get('/metadata', (req: Request, res: Response) => {
    res.json({
        speechParts: speechParts.map(sp => ({id: sp.dbid, title: sp.body})),
        genders: genders.map(sp => ({id: sp.dbid, title: sp.body})),
        languages: languages.map(l => ({id: l.dbid, title: l.body.englishName}))
    });
});

wordRouter.post('/add', async (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    if (req.body.id) {
        res.send(400);
        throw new Error('ID_IN_EDIT');
    }

    const word = new Word(req.body, req.user);

    await word.save()
        .catch(error => {
            console.error(error);
            res.sendStatus(500);
        });

    res.sendStatus(201);
});

wordRouter.post('/get', async (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    const query = 'SELECT id FROM tnw2.words WHERE user_created_id = $1';
    const wordIds: { id: number }[] = await queryDatabase<{ id: number }>(query, [req.user?.dbid])
        .catch(error => {
            res.sendStatus(500);
            throw error;
        });
    const words = wordIds.map(() => new Word(undefined, req.user));
    const words$ = wordIds.map(({id}, index) => words[index].loadFromDB(id));

    await Promise.all(words$);

    res.send(words.map(word => word.convertToDto()));
});

wordRouter.put('/edit', async (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    if (!req.body.id) {
        res.send(400);
        throw new Error('ID_NOT_EXISTS');
    }

    const word = new Word();
    await word.loadFromDB(req.body.id, {}, req.user)
        .catch(error => {
            res.send(500);
            throw error;
        });
    word.replaceWith(req.body);
    await word.save()
        .catch(error => {
            res.send(500);
            throw error;
        });

    res.sendStatus(200);
});

wordRouter.post('/remove', async (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    if (!req.body.id) {
        res.send(400);
        throw new Error('ID_NOT_EXISTS');
    }

    const word = new Word();
    await word.loadFromDB(req.body.id, {}, req.user)
        .catch(error => {
            res.send(500);
            throw error;
        });
    await word.remove()
        .catch(error => {
            res.send(500);
            throw error;
        });

    res.sendStatus(200);
});
