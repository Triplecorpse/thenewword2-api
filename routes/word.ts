import * as express from "express";
import {Request, Response} from "express";
import {queryDatabase} from "../services/db";
import {Word} from "../models/Word";

export const wordRouter = express.Router();

wordRouter.get('/metadata', (req: Request, res: Response) => {
    const speechParts$ = queryDatabase('SELECT title FROM tnw2.speech_parts');
    const genders$ = queryDatabase('SELECT title FROM tnw2.genders');
    const languages$ = queryDatabase('SELECT code2, english_name FROM tnw2.languages');

    Promise.all([speechParts$, genders$, languages$])
        .then(([speechParts, genders, languages]) => {
            res.json({speechParts: speechParts, genders: genders, languages: languages});
        })
});

wordRouter.post('/add', async (req: Request, res: Response) => {
    if (!req.isUserVerified) {
        res.sendStatus(401);
    }

    const word = new Word(req.body);

    console.log(word);
});