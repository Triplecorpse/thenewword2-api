import {User} from './User';
import * as db from '../services/db';

jest.mock('../services/db');

describe('User class', () => {
    let spy = jest.spyOn(db, 'queryDatabase');
    let user = new User();

    beforeEach(() => {
        user = new User();
        spy = jest.spyOn(db, 'queryDatabase');
        spy.mockRestore();
    });

    describe('LoadFromDb method', () => {
        it('Should create valid user object if login and password are matching', async () => {
            spy = spy.mockResolvedValueOnce([{
                login: 'login',
                password: '$2b$10$C4s7pd.jCcraeli.eSbZiOtuLkFnL8EANztqmKi4J2HTrdBMwM9LC'
            }]);
            await user.loadFromDB('login', 'password')
                .catch(error => {
                    expect(error).not.toBeDefined();
                });
            expect(user.login).toBe('login');
        });

        it('Should throw USER_NOT_FOUND error if no user was found', async () => {
            spy = spy.mockResolvedValueOnce([]);
            await user.loadFromDB('login', 'password')
                .catch(error => {
                    expect(error.name).toBe('USER_NOT_FOUND')
                });
        });

        it('Should throw PASSWORD_CHECK_FAILED error if a user was found but password doesn\'t match', async () => {
            spy = spy.mockResolvedValueOnce([{
                login: 'login',
                password: '$2b$10$C4s7pd.jCcraeli.eSbZiOtuLkFnL8EANztqmKi4J2HTrdBMwM9LC'
            }]);
            await user.loadFromDB('login', 'not_correct')
                .catch(error => {
                    expect(error.name).toBe('PASSWORD_CHECK_FAILED');
                });
        });

        it('Should create valid user object if user was found and password is \'restore\' and password in the DB is \'to_restore\'', async () => {
            spy = spy.mockResolvedValueOnce([{login: 'login', password: 'to_restore'}]);
            await user.loadFromDB('login', 'restore')
            expect(user.login).toBe('login');
        });
    });

    describe('Save method', () => {
        it('Should create a new instance of user in the db if id is NOT provided', async () => {
            user.password = 'password';
            spy.mockResolvedValueOnce([{id: 1}]);
            await user.save();
            expect(spy).toBeCalledWith(expect.stringContaining('INSERT INTO tnw2.users'), expect.arrayContaining([]));
        });

        it('Should fill learning language relation table if there is such information in user object', async () => {
            user.password = 'password';
            user.learningLanguages = [{dbid: 1}] as any;
            spy.mockResolvedValueOnce([{id: 1}]);
            await user.save();
            expect(spy).toBeCalledWith(
                expect.stringContaining('INSERT INTO tnw2.relation_users_learning_language'),
                expect.arrayContaining([1])
            );
        });

        it('Should update an instance of user in the db if id is provided', async () => {
            user.dbid = 1;
            user.password = 'password';
            await user.save();
            expect(spy).toBeCalledWith(expect.stringContaining('UPDATE tnw2.users'), expect.arrayContaining([]));
        });

        it('Should produce an error NO_PASSWORD_PROVIDED if there is no passwordHash', async () => {
            user.dbid = 1;
            user.save()
                .catch(error => {
                    expect(error.name).toBe('NO_PASSWORD_PROVIDED');
                })
        });
    });

    describe('Remove method', () => {
        it('Should remove an instance of user in the db if id is provided', async () => {
            spy.mockResolvedValueOnce([]);
            user.dbid = 1;
            await user.remove();
            expect(spy).toBeCalledWith(expect.stringContaining('DELETE FROM tnw2.users'), expect.arrayContaining([1]));
        });

        it('Should produce an error NO_ID_PROVIDED if id is NOT provided', async () => {
            spy.mockResolvedValueOnce([]);
            user.dbid = undefined;
            await user.remove()
                .catch(error => {
                    expect(error.name).toBe('NO_ID_PROVIDED');
                });
        });
    });

    describe('ReplaceWith method', () => {
        it('Should replace user\'s fields with new ones', () => {
            user.replaceWith({
                id: 1,
                login: 'login2',
                password: 'password',
                learning_languages: [2, 3, 4],
                native_languages: [1],
                email: 'email@domain.com',
                new_password: 'new_password',
                map_cyrillic: false
            });

            expect(user.login).toBe('login2');
        });
    });

    describe('ConvertToDto method', () => {
        it('Should convert user object to Dto', () => {
            user.login = 'login3';
            user.password = 'password3';
            user.dbid = 1;
            user.learningLanguages = [{dbid: 1}] as any;

            expect(user.convertToDto()).toHaveProperty('login', 'login3');
            expect(user.convertToDto()).toHaveProperty('password', 'password3');
            expect(user.convertToDto()).toHaveProperty('learning_languages', [1]);
        });
    });
});
