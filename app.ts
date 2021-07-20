import * as express from 'express';
import * as dotenv from 'dotenv';
import {userRouter} from './routes/user';
import * as bodyParser from 'body-parser';
import {NextFunction, Request, Response} from 'express';
import {connectToDatabase, queryDatabase} from './services/db';
import {jwtDecodeAndVerifyUser} from './services/jwt';
import {wordRouter} from './routes/word';
import {User} from './models/User';
import {genders, keyMappers, languages, speechParts} from './const/constData';
import {Gender} from './models/Gender';
import {SpeechPart} from './models/SpeechPart';
import {Language} from './models/Language';
import {wordsetRouter} from './routes/wordset';
import {KeyMapper} from "./models/KeyMapper";

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
    .then(() => Promise.all([
        queryDatabase('SELECT id FROM tnw2.genders'),
        queryDatabase('SELECT id FROM tnw2.speech_parts'),
        queryDatabase('SELECT id FROM tnw2.languages')
    ]))
    .then(result => {
        genders.push(...result[0].map(gender => new Gender(gender.id)));
        speechParts.push(...result[1].map(speechPart => new SpeechPart(speechPart.id)));
        languages.push(...result[2].map(language => new Language(language.id)));
    })
    .then(() => [...genders, ...speechParts, ...languages])
    .then(result => Promise.all(result.map(entity => entity.loadFromDb())))
    .then(async () => {
        (await KeyMapper.loadShared()).forEach(km => {
            keyMappers.push(km);
        });
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
    const authorization = req.header('Authorization');

    if (authorization) {
        const result = await jwtDecodeAndVerifyUser(authorization.split(' ')[1], req.hostname, req.ip, req.get('user-agent') as string);

        if (result instanceof User) {
            req.user = result;
        }
    }

    next();
});
app.use('/user', userRouter);
app.use('/word', wordRouter);
app.use('/wordset', wordsetRouter);
