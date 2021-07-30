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
        console.log('QUERY ::::', query, ',', params);
        return pool.query(query, params).then(({rows}) => rows);
    } catch (error) {
        throw new CustomError('DB_QUERY_ERROR', {query, params, error});
    }
}

export class Transaction {
    client$: Promise<PoolClient>;
    wasBegan: boolean;

    constructor() {
        const pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: Number(process.env.PGPORT)
        });

        this.client$ = pool.connect();
    }

    BEGIN() {
        return this.client$.then(client => {
            this.wasBegan = true;
            return client.query('BEGIN');
        });
    }

    COMMIT() {
        return this.client$.then(client => client.query('COMMIT'));
    }

    ROLLBACK() {
        return this.client$.then(client => client.query('ROLLBACK'));
    }

    async QUERY_LINE<T = any, K = any>(query: string, params?: K[]): Promise<any> {
        try {
            console.log('TRANSACTION ::::', query, ',', params);
            return this.client$.then(client => client.query(query, params)).then(({rows}) => rows);
        } catch (error) {
            throw new CustomError('DB_TRANSACTION_QUERY_ERROR', {query, params, error});
        }
    }
}
