import * as express from 'express';
import * as dotenv from 'dotenv';
import {Client} from 'pg';
import {createTableQ} from "./!migration/user";

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

client.connect()
    .then(() => client.query(createTableQ))
    .then((r) => {
        console.log(r);
    })

app.listen(process.env.PORT, () => {
    console.log('listening on port', process.env.PORT);
});