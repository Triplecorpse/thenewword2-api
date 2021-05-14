import * as express from 'express';
import {Request, Response} from 'express';
import {queryDatabase} from '../services/db';
import {Word} from '../models/Word';
import {genders, languages, speechParts} from '../const/constData';
import {User} from "../models/User";
import {jwtDecode, jwtSign} from "../services/jwt";
import {IWordDto} from "../interfaces/dto/IWordDto";

export const wordRouter = express.Router();

wordRouter.get('/metadata', (req: Request, res: Response) => {
    res.json({
        speechParts: speechParts.map(sp => ({id: sp.dbid, title: sp.body})),
        genders: genders.map(g => ({id: g.dbid, title: g.body})),
        languages: languages.map(l => ({id: l.dbid, title: l.body.englishName}))
    });
});

wordRouter.post('/add', async (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    if (req.body.id) {
        res.status(400).json({type: 'ID_IN_EDIT'});
        throw new Error('ID_IN_EDIT');
    }

    const word = new Word(req.body, req.user);

    await word.save()
        .catch(error => {
            const err: any = {...error};
            if (!error.type) {
                err.desc = error.message;
                err.type = 'GENERIC';
            }
            res.status(500).json({err});
            throw error;
        });

    res.status(201).json({success: true});
});

wordRouter.get('/get', async (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    const query = 'SELECT id FROM tnw2.words WHERE user_created_id = $1';
    const wordIds: { id: number }[] = await queryDatabase<{ id: number }>(query, [req.user?.dbid])
        .catch(error => {
            const err: any = {...error};
            if (!error.type) {
                err.desc = error.message;
                err.type = 'GENERIC';
            }
            res.status(500).json({err});
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
        res.status(400).json({type: 'ID_REQUIRED'});
        throw new Error('ID_NOT_EXISTS');
    }

    const word = new Word();
    await word.loadFromDB(req.body.id, {}, req.user)
        .catch(error => {
            const err: any = {...error};
            if (!error.type) {
                err.desc = error.message;
                err.type = 'GENERIC';
            }
            res.status(500).json({err});
            throw error;
        });
    word.replaceWith(req.body);
    await word.save()
        .catch(error => {
            const err: any = {...error};
            if (!error.type) {
                err.desc = error.message;
                err.type = 'GENERIC';
            }
            res.status(500).json({err});
            throw error;
        });

    res.status(200).json({success: true});
});

wordRouter.delete('/remove', async (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    if (!req.query.id) {
        res.status(400).json({type: 'ID_NOT_EXISTS'});
        throw new Error('ID_NOT_EXISTS');
    }

    const word = new Word();
    await word.loadFromDB(req.body.id, {}, req.user)
        .catch(error => {
            const err: any = {...error};
            if (!error.type) {
                err.desc = error.message;
                err.type = 'GENERIC';
            }
            res.status(500).json({err});
            throw error;
        });
    await word.remove()
        .catch(error => {
            const err: any = {...error};
            if (!error.type) {
                err.desc = error.message;
                err.type = 'GENERIC';
            }
            res.status(500).json({err});
            throw error;
        });

    res.sendStatus(200);
});

wordRouter.get('/exercise', async (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    const query = 'SELECT id FROM tnw2.words WHERE user_created_id = $1 ORDER BY random() LIMIT 10';
    const words = await getWordsByQuery(query, [req.user?.dbid], req.user as User)
        .catch(error => {
            const err: any = {...error};
            if (!error.type) {
                err.desc = error.message;
                err.type = 'GENERIC';
            }
            res.status(500).json({err});
            throw error;
        });
    const wordsDto = words.map(word => word.convertToDto());
    const encoded = await jwtSign(JSON.stringify(wordsDto))
        .catch(error => {
            const err: any = {...error};
            if (!error.type) {
                err.desc = error.message;
                err.type = 'JWT_ERROR';
            }
            res.status(500).json({err});
            throw error;
        });
    const wordsToSend = wordsDto
        .map(word => {
            delete word?.word;

            return word;
        });

    res.json({words: wordsToSend, encoded});
});

wordRouter.post('/exercise', async (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    if (!req.body.encoded) {
        res.status(400).json({type: 'ENCODED_REQUIRED'});
    }

    const decoded: IWordDto[] = await jwtDecode(req.body.encoded)
        .catch(error => {
            const err: any = {...error};
            if (!error.type) {
                err.desc = error.message;
                err.type = 'JWT_ERROR';
            }
            res.status(500).json({err});
            throw error;
        });

    const wordFromUser: IWordDto = req.body.word;
    const wordFromVault: IWordDto = decoded.find(word => word.id === wordFromUser.id) as IWordDto;
    const isRight = wordsEqual(wordFromUser, wordFromVault);

    res.json({you: wordFromUser, vault: wordFromVault, right: isRight});
});

async function getWordsByQuery(query: string, params: any[], user: User): Promise<Word[]> {
    const wordIds: { id: number }[] = await queryDatabase<{ id: number }>(query, params)
        .catch(error => Promise.reject(error));

    const words = wordIds.map(() => new Word(undefined, user));
    const words$ = wordIds.map(({id}, index) => words[index].loadFromDB(id));

    await Promise.all(words$);

    return words;
}

function wordsEqual(word1: IWordDto, word2: IWordDto): boolean {
    return word1.word === word2.word;
}