import * as pg from 'pg';
import {connectToDatabase} from './db';
import * as util from 'util';
import * as fs from 'fs';

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

        describe('speech_parts table is empty', () => {
            let spy = jest.spyOn(pg.Pool.prototype, 'query');

            beforeEach(() => {
                spy.mockClear();
                spy = spy.mockImplementation(() => Promise.resolve({rows: []}));
            });

            afterEach(() => {
                jest.clearAllMocks();
            })

            it('should fill speech parts and genders tables', async () => {
                const initStatic = await util.promisify(fs.readFile)('sql_scripts/init_static.sql', 'UTF8');
                await connectToDatabase();
                expect(spy).toBeCalledWith(initStatic);
            });

            it('should fill languages table', async () => {
                const spy = jest.spyOn(pg.Pool.prototype, 'query')
                    .mockImplementation(() => Promise.resolve({rows: []}));
                await connectToDatabase();
                expect(spy).toBeCalledWith(expect.stringContaining('INSERT INTO tnw2.languages'));
            });
        });

        describe('speech_parts table is NOT empty', () => {
            let spy = jest.spyOn(pg.Pool.prototype, 'query');

            beforeEach(() => {
                spy.mockClear();
                spy = spy.mockImplementation(() => Promise.resolve({rows: [{exists: true}]}));
            });

            it('should NOT fill speech parts and genders tables', async () => {
                const initStatic = await util.promisify(fs.readFile)('sql_scripts/init_static.sql', 'UTF8');
                await connectToDatabase();
                expect(spy).not.toBeCalledWith(initStatic);
            });

            it('should NOT fill languages table', async () => {
                await connectToDatabase();
                expect(spy).not.toBeCalledWith(expect.stringContaining('INSERT INTO tnw2.languages'));
            });
        });
    });
});
