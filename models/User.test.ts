import {User} from './User';
import * as db from '../services/db';

jest.mock('../services/db');

describe('User class', () => {
    let user = new User();

    beforeEach(() => {
        user = new User();
    });

    describe('LoadFromDb method', () => {
        let spy = jest.spyOn(db, 'queryDatabase');

        beforeEach(() => {
            user = new User();
            spy = jest.spyOn(db, 'queryDatabase');
            spy.mockRestore();
        });

        it('Should query users table if login and password are set', () => {
            spy = spy.mockResolvedValueOnce([]);
            user.loadFromDB('login', 'password');

            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining('FROM tnw2.users'),
                expect.arrayContaining(['login'])
            );
        });

        it('Should throw USER_NOT_FOUND error if no user was found', async () => {
            spy = spy.mockResolvedValueOnce([]);
            await user.loadFromDB('login', 'password')
                .catch(error => {
                    expect(error.type).toBe('USER_NOT_FOUND')
                });
            expect(user.login).not.toBeDefined();
        });

        it('Should throw PASSWORD_CHECK_FAILED error if a user was found but password doesn\'t match', async () => {
            spy = spy.mockResolvedValueOnce([{login: 'login', password: 'does_not_match'}]);
            await user.loadFromDB('login', 'password')
                .catch(error => {
                    expect(error.type).toBe('PASSWORD_CHECK_FAILED');
                });
            expect(user.login).not.toBeDefined();
        });

        it('Should create valid user object if user was found and password is \'restore\' and password in the DB is \'to_restore\'', async () => {
            spy = spy.mockResolvedValueOnce([{login: 'login', password: 'to_restore'}]);
            await user.loadFromDB('login', 'restore')
            expect(user.login).toBeDefined();
        });

        it('Should complete user object if login and password are matching', async () => {
            spy = spy.mockResolvedValueOnce([{login: 'login', password: '$2b$10$C4s7pd.jCcraeli.eSbZiOtuLkFnL8EANztqmKi4J2HTrdBMwM9LC'}]);
            await user.loadFromDB('login', 'password')
                .catch(error => {
                    expect(error.type).not.toBeDefined();
                });
            expect(user.login).toBe('login');
        });
    });
});