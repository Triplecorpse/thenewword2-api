import * as express from "express";
import {Request, Response} from "express";
import {queryDatabase} from "../services/db";
import {languages} from "countries-list";

export const wordRouter = express.Router();

wordRouter.get('/metadata', (req: Request, res: Response) => {
    const speechParts$ = queryDatabase('SELECT title FROM tnw2.speech_parts');
    const genders$ = queryDatabase('SELECT title FROM tnw2.genders');
    const languages$ = queryDatabase('SELECT code2, english_name FROM tnw2.languages');

    Promise.all([speechParts$, genders$, languages$])
        .then(([speechParts, genders, languages]) => {
            res.json({speechParts: speechParts.rows, genders: genders.rows, languages: languages.rows});
        })
});
