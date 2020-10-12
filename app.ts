import * as express from 'express';
import * as dotenv from 'dotenv';
import {Client} from 'pg';
import * as fs from "fs";
import * as util from "util";
import {userRouter} from "./routes/user";
import * as bodyParser from "body-parser";
import {NextFunction, Request, Response} from "express";

dotenv.config();

const app = express();
const client = new Client(
    {
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: Number(process.env.PGPORT)
    }
);

declare global {
    namespace Express {
        export interface Request {
            isDevMode?: boolean
        }
    }
}

client.connect()
    .then(() => util.promisify(fs.readFile)('sql_scripts/init_tables.sql', 'UTF8'))
    .then(r => client.query(r))
    .catch(error => {throw error})
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('listening on port', process.env.PORT);
        });
    })

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
