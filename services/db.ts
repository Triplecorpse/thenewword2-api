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

export async function queryDatabase<T = any, K = any>(query: string, params: K[] = []): Promise<T[]> {
    try {
        let maxIndex = (query.match(/[$]\d+/g) || [])
            .map(value => +value.substring(1))
            .reduce((prev, next) => (prev > next) ? prev : next, 0);
        const preparedParams: K[] = [];
        let preparedQuery = query;

        params.forEach((param, index) => {
            if (Array.isArray(param)) {
                if (!param.length) {
                    throw new CustomError('DB_QUERY_ERROR', 'Array parameters could not be empty');
                }

                const preparedParam = param.map((paramItem) => {
                    let preparedParamItem;

                    switch (typeof paramItem) {
                        case 'string':
                            preparedParamItem = `'${paramItem}'`;
                            break;
                        default:
                            preparedParamItem = paramItem;
                    }

                    return preparedParamItem;
                });
                const queryStringArray = [];

                for (let i = maxIndex; i < maxIndex + preparedParam.length; i++) {
                    queryStringArray.push(`$${i + 1}`);
                }

                queryStringArray.unshift(`$${index + 1}`);
                queryStringArray.pop();

                maxIndex += preparedParam.length;

                const paramString = queryStringArray.join(', ');

                preparedParam.forEach(paramItem => {
                    preparedParams.push(paramItem as K);
                });

                preparedParams[index] = preparedParam.shift();
                preparedQuery = preparedQuery.replace(`$${index + 1}`, `(${paramString})`);
            } else {
                preparedParams.push(param);
            }
        });

        console.debug('');
        console.debug('ORIGINAL_QUERY :::: ', query, ' :::: ', params);
        console.debug('PREPARED_QUERY :::: ', preparedQuery, ' :::: ', preparedParams);
        console.debug('');

        return pool.query(preparedQuery, preparedParams).then(({rows}) => rows);
    } catch (error) {
        throw new CustomError('DB_QUERY_ERROR', {query, params, error});
    }
}

export class Transaction {
    client$: Promise<PoolClient>;
    wasBegan: boolean;

    constructor() {
        const transactionPool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: Number(process.env.PGPORT)
        });

        this.client$ = transactionPool.connect();
    }

    BEGIN() {
        return this.client$.then(transactionalClient => {
            this.wasBegan = true;
            return transactionalClient.query('BEGIN');
        });
    }

    COMMIT() {
        return this.client$.then(transactionalClient => transactionalClient.query('COMMIT'));
    }

    ROLLBACK() {
        return this.client$.then(transactionalClient => transactionalClient.query('ROLLBACK'));
    }

    async QUERY_LINE<T = any, K = any>(query: string, params?: K[]): Promise<any> {
        try {
            console.debug('TRANSACTION ::::', query, ',', params);

            return this.client$.then(transactionalClient => transactionalClient.query(query, params)).then(({rows}) => rows);
        } catch (error) {
            throw new CustomError('DB_TRANSACTION_QUERY_ERROR', {query, params, error});
        }
    }
}
