import {Pool, PoolClient} from 'pg';
import * as dotenv from 'dotenv';
import {CustomError} from '../models/CustomError';

dotenv.config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT)
});

export async function connectToDatabase(): Promise<PoolClient> {
    try {
        return await pool.connect();
    } catch (error) {
        throw new CustomError('GENERIC_DB_ERROR', error);
    }
}

export async function queryDatabase<T = any, K = any>(query: string, params?: K[]): Promise<T[]> {
    try {
        console.log(query, ',', params);
        return pool.query(query, params).then(({rows}) => rows);
    } catch (error) {
        throw new CustomError('QUERY_ERROR', {query, params, error});
    }
}
