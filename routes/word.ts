import * as express from "express";
import {Request, Response} from "express";
import {queryDatabase} from "../services/db";

export const wordRouter = express.Router();

wordRouter.get('/metadata', (req: Request, res: Response) => {
    const speechParts$ = queryDatabase('SELECT title FROM tnw2.speech_parts');
    const genders$ = queryDatabase('SELECT title FROM tnw2.genders');

    Promise.all([speechParts$, genders$])
        .then(([speechParts, genders]) => {
            res.json({speechParts: speechParts.rows, genders: genders.rows});
        })
});
