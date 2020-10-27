import * as express from "express";
import {Request, Response} from "express";
import {queryDatabase} from "../services/db";
import {Word} from "../models/Word";
import {genders, languages, speechParts} from "../const/constData";

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

    const word = new Word(req.body, req.user);
    console.log(word);

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

    const query = 'SELECT word, translations, forms, remarks, stress_letter_index, tnw2.speech_parts.title, tnw2.genders.title FROM tnw2.words LEFT JOIN tnw2.speech_parts ON tnw2.words.speech_part_id=tnw2.speech_parts.id LEFT JOIN tnw2.genders ON tnw2.words.gender_id=tnw2.genders.id WHERE user_created_id = $1';
    const dbresult = await queryDatabase(query, [req.user?.dbid])
        .catch(() => {
            res.sendStatus(500);
        });

    res.send(dbresult);

    console.log(dbresult);
});
