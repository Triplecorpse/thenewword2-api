import * as pg from 'pg';
import {connectToDatabase} from './db';
import * as util from 'util';
import * as fs from 'fs';
import {query} from "express";

jest.mock('pg');

describe('Db module', () => {
    describe('Db connectToDatabase method', () => {
        it('should call connect method in pg', async () => {
            const spy = jest.spyOn(pg.Pool.prototype, 'connect');
            await connectToDatabase();
            expect(spy).toHaveBeenCalled();
        });

        it('should execute initial tables creation', async () => {
            const spy = jest.spyOn(pg.Pool.prototype, 'query');
            const initQuery = await util.promisify(fs.readFile)('sql_scripts/init_tables.sql', 'UTF8');
            await connectToDatabase();
            expect(spy).toBeCalledWith(initQuery);
        });

        it('should fill speech parts and genders if speech_parts table is empty', async () => {
            const spy = jest.spyOn(pg.Pool.prototype, 'query').mockImplementation(() => Promise.resolve({rows: []}));
            const initStatic = await util.promisify(fs.readFile)('sql_scripts/init_static.sql', 'UTF8');
            await connectToDatabase();
            expect(spy).toBeCalledWith(initStatic);
        });

        it('should not fill speech parts and genders if speech_parts table is not empty', async () => {
            const spy = jest.spyOn(pg.Pool.prototype, 'query')
                .mockImplementation(() => Promise.resolve({rows: [{exists: true}]}));
            const initStatic = await util.promisify(fs.readFile)('sql_scripts/init_static.sql', 'UTF8');
            await connectToDatabase();
            expect(spy).not.toBeCalledWith(initStatic);
        });

        it('should fill languages if speech_parts table is empty', async () => {
            const spy = jest.spyOn(pg.Pool.prototype, 'query').mockImplementation(() => Promise.resolve({rows: []}));
            await connectToDatabase();
            expect(spy).toBeCalledWith(expect.stringContaining('INSERT INTO tnw2.languages'));
        });

        it('should not fill languages if speech_parts table is not empty', async () => {
            const spy = jest.spyOn(pg.Pool.prototype, 'query')
                .mockImplementation(() => Promise.resolve({rows: [{exists: true}]}));
            await connectToDatabase();
            expect(spy).not.toBeCalledWith(expect.stringContaining('INSERT INTO tnw2.languages'));
        });
    });
});
