import * as express from 'express';
import * as dotenv from 'dotenv';
import {Client} from 'pg';
import * as fs from "fs";
import * as util from "util";
import {userRouter} from "./routes/user";
import * as bodyParser from "body-parser";

dotenv.config();

const app = express();
const router = express.Router();
const client = new Client(
    {
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: Number(process.env.PGPORT)
    }
);

app.use(bodyParser.json())

client.connect()
    .then(() => util.promisify(fs.readFile)('sql_scripts/init_tables.sql', 'UTF8'))
    .then(r => client.query(r))
    .catch(error => {throw error})
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('listening on port', process.env.PORT);
        });
    })

router.use('/user', userRouter);
