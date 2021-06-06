import {Word} from './Word';
import * as db from '../services/db';

jest.mock('../services/db');

describe('Word class', () => {
    let spy = jest.spyOn(db, 'queryDatabase');
    let word = new Word();

    beforeEach(() => {
        word = new Word();
        spy = jest.spyOn(db, 'queryDatabase');
        spy.mockRestore();
    });

    describe('LoadFromDb method', () => {
        it('Should query a database if id is provided', async () => {
            await word.loadFromDB(1);
            expect(spy).toBeCalledWith(expect.stringContaining('FROM tnw2.words'), expect.arrayContaining([1]));
        });

        it('Should fill word\'s fields if they are coming from DB', async () => {
            spy.mockRestore();
            spy.mockResolvedValueOnce([{id: 1, word: 'word'}]);
            await word.loadFromDB(1);
            expect(word).toHaveProperty('word', 'word');
        });

        it('Should add WHERE clause if any filterData is provided', () => {
            word.loadFromDB(1, {translations: 'atata'});
            expect(spy).toBeCalledWith(expect.stringContaining('translations = $'), expect.arrayContaining(['atata']));
        });
    });

    describe('Save method', () => {
    });

    describe('Remove method', () => {

    });

    describe('ReplaceWith method', () => {

    });

    describe('ConvertToDto method', () => {

    });
});