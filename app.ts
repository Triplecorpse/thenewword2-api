import * as express from 'express';
import * as dotenv from 'dotenv';
import {userRouter} from "./routes/user";
import * as bodyParser from "body-parser";
import {NextFunction, Request, Response} from "express";
import {connectToDatabase} from "./services/db";

dotenv.config();

const app = express();

declare global {
    namespace Express {
        export interface Request {
            isDevMode?: boolean
        }
    }
}

connectToDatabase()
    .catch(error => {throw error})
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('listening on port', process.env.PORT);
        });
    });

app.use(bodyParser.urlencoded({extended: true}));
app.use((req: Request, res: Response, next: NextFunction) => {
    if (process.env.MODE === 'development') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        req.isDevMode = true;
    }

    next();
});
app.use('/user', userRouter);
