import {Pool} from "pg";
import * as util from "util";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT)
});

export async function connectToDatabase() {
    await pool.connect();
    const initQuery = await util.promisify(fs.readFile)('sql_scripts/init_tables.sql', 'UTF8');

    return pool.query(initQuery);
}

export async function queryDatabase(query: string) {
    return pool.query(query);
}
