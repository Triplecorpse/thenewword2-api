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
    const speechPartExists = await pool.query(`SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'tnw2' AND table_name = 'speech_parts')`);

    if (!(speechPartExists?.rows[0]?.exists)) {
        const initStatic = await util.promisify(fs.readFile)('sql_scripts/init_static.sql', 'UTF8');

        await pool.query(initStatic);
    }

    return pool.query(initQuery);
}

export async function queryDatabase(query: string) {
    return pool.query(query);
}
