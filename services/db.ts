import {Pool} from 'pg';
import * as dotenv from 'dotenv';
import {CustomError} from "../models/CustomError";

dotenv.config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT)
});

export async function connectToDatabase() {
    return await pool.connect();
}

export async function queryDatabase<T = any, K = any>(query: string, params?: K[]): Promise<T[]> {
    try {
        return pool.query(query, params).then(({rows}) => rows);
    } catch (error) {
        throw new CustomError('QUERY_ERROR', {query, params, error});
    }
}
