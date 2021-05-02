import * as express from 'express';
import * as dotenv from 'dotenv';
import {userRouter} from "./routes/user";
import * as bodyParser from "body-parser";
import {NextFunction, Request, Response} from "express";
import {connectToDatabase, queryDatabase} from "./services/db";
import {jwtVerify} from "./services/jwt";
import {wordRouter} from "./routes/word";
import {User} from "./models/User";
import {ILanguageDb} from "./interfaces/db/ILanguageDb";
import {ISpeechPartDb} from "./interfaces/db/ISpeechPartDb";
import {IGenderDb} from "./interfaces/db/IGenderDb";
import {genders, languages, speechParts} from "./const/constData";
import {Gender} from "./models/Gender";
import {SpeechPart} from "./models/SpeechPart";
import {Language} from "./models/Language";

dotenv.config();

const app = express();

declare global {
    namespace Express {
        export interface Request {
            isDevMode?: boolean;
            user?: User;
        }
    }
}

connectToDatabase()
    .catch(error => {
        console.error(error);
        throw error
    })
    .then(() => Promise.all([
        queryDatabase<IGenderDb>('SELECT id, title FROM tnw2.genders'),
        queryDatabase<ISpeechPartDb>('SELECT id, title FROM tnw2.speech_parts'),
        queryDatabase<ILanguageDb>('SELECT id, code2, english_name, native_name FROM tnw2.languages')
    ]))
    .then(result => {
        genders.push(...result[0].map(gender => new Gender(gender)));
        speechParts.push(...result[1].map(speechPart => new SpeechPart(speechPart)));
        languages.push(...result[2].map(language => new Language(language)));
    })
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('listening on port', process.env.PORT);
        });
    });

app.use(bodyParser.json());
app.use((req: Request, res: Response, next: NextFunction) => {
    if (process.env.MODE === 'DEVELOPMENT') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        req.isDevMode = true;
    }

    next();
});
app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.token) {
        req.user = await jwtVerify(req.query.token as string, req) as User;
    }
    next();
});
app.use('/user', userRouter);
app.use('/word', wordRouter);
