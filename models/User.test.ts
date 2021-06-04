import {User} from './User';
import * as db from '../services/db';

jest.mock('../services/db');

describe('User class', () => {
    let user = new User();

    beforeEach(() => {
        user = new User();
    });

    describe('LoadFromDb method', () => {
        it('Should query users table if login and password are set', () => {
            const spy = jest.spyOn(db, 'queryDatabase')
                .mockImplementation(() => Promise.resolve([]));
            user.loadFromDB('login', 'password');

            expect(spy).toHaveBeenCalledWith(expect.stringContaining('FROM tnw2.users'), expect.arrayContaining(['login']));
        });

        it('Should throw an error if no user was found', async () => {
            const spy = jest.spyOn(db, 'queryDatabase');
            spy.mockClear();
            spy.mockImplementation(() => Promise.resolve([]));
            const result = await user.loadFromDB('login', 'password')
                .catch(error => {
                    expect(error.type).toBe('USER_NOT_FOUND')
                });
            expect(result).not.toBeDefined();
        });
    });
});