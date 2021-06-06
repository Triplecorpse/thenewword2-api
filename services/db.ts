import {Pool} from 'pg';
import * as util from 'util';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import {languages} from 'countries-list';

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
        await pool.query(createQueryForLanguages());
    }

    return pool.query(initQuery);
}

export async function queryDatabase<T = any, K = any>(query: string, params?: K[]): Promise<T[]> {
    return pool.query(query, params).then(({rows}) => rows);
}

function createQueryForLanguages(): string {
    let result = '';

    Object.keys(languages).forEach((code2, index) => {
        const languageObj: any = (languages as any)[code2];

        result += `('${code2}', '${languageObj.name.replace('\'', '\'\'')}', '${languageObj.native.replace('\'', '\'\'')}')`;

        if (index < Object.keys(languages).length - 1) {
            result += ',';
        }
    });

    return `INSERT INTO tnw2.languages (code2, english_name, native_name) VALUES ${result};`;
}
