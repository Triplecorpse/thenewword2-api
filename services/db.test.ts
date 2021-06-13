import * as pg from 'pg';
import {connectToDatabase, queryDatabase} from './db';

jest.mock('pg');

describe('Db module', () => {
    describe('ConnectToDatabase method', () => {
        it('should call connect method in pg', async () => {
            const spy = jest.spyOn(pg.Pool.prototype, 'connect');
            await connectToDatabase();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('queryDb method', () => {
        it('Should query pool if appropriate params are passing', async () => {
            const spy = jest.spyOn(pg.Pool.prototype, 'query');
            spy.mockImplementation(() => Promise.resolve([]));
            await queryDatabase('INSERT INTO whatever', [1]);
            expect(spy).toHaveBeenCalledWith('INSERT INTO whatever', [1]);
        });
    });
});
