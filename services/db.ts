import {Pool, PoolClient} from 'pg';
import * as dotenv from 'dotenv';
import {CustomError} from '../models/CustomError';

dotenv.config();

let client: PoolClient;
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT)
});

export async function connectToDatabase(): Promise<PoolClient> {
    try {
        client = await pool.connect();

        return client;
    } catch (error) {
        throw new CustomError('DB_CONNECTION_ERROR', error);
    }
}

export async function queryDatabase<T = any, K = any>(query: string, params?: K[]): Promise<T[]> {
    try {
        console.log('QUERY', query, ',', params);
        return pool.query(query, params).then(({rows}) => rows);
    } catch (error) {
        throw new CustomError('DB_QUERY_ERROR', {query, params, error});
    }
}

export class Transaction {
    get BEGIN() {
        return client.query('BEGIN');
    }

    get COMMIT() {
        return client.query('COMMIT');
    }

    get ROLLBACK() {
        return client.query('ROLLBACK');
    }

    async QUERY_LINE<T = any, K = any>(query: string, params?: K[]): Promise<any> {
        try {
            console.log('TRANSACTION', query, ',', params);
            return client.query(query, params);
        } catch (error) {
            throw new CustomError('DB_TRANSACTION_QUERY_ERROR', {query, params, error});
        }
    }
}
