import {Word} from './Word';
import * as db from '../services/db';
import {IWordDto} from "../interfaces/dto/IWordDto";

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
        it('Should query db for create if id is not assigned', async () => {
            spy.mockResolvedValueOnce([{id: 1, word: 'word'}]);
            await word.save();
            expect(spy).toBeCalledWith(expect.stringContaining('INSERT INTO tnw2.words'), expect.arrayContaining([]));
        });

        it('Should query db for update if id is assigned', async () => {
            spy.mockResolvedValueOnce([{id: 1, word: 'word'}]);
            word.dbid = 1;
            await word.save();
            expect(spy).toBeCalledWith(expect.stringContaining('UPDATE tnw2.words'), expect.arrayContaining([1]));
        });
    });

    describe('Remove method', () => {
        it('Should remove word from db if id is defined', async () => {
            word.dbid = 1;
            spy.mockResolvedValueOnce([]);
            await word.remove();
            expect(spy).toBeCalledWith(expect.stringContaining('DELETE FROM tnw2.words'), expect.arrayContaining([1]));
        });

        it('Should reject if id is not provided', async () => {
            spy.mockResolvedValueOnce([]);
            spy.mockRestore();
            delete word.dbid;
            await word.remove()
                .catch(error => {
                    expect(error.type).toBe('NO_ID_PROVIDED')
                });
        });
    });

    describe('ReplaceWith method', () => {
        const wordDto: IWordDto = {
            word: 'word',
            translations: [],
            speech_part_id: 1,
            gender_id: 1,
            forms: [],
            original_language_id: 1,
            translated_language_id: 2,
            remarks: 'string',
            stress_letter_index: 1
        };
        word.replaceWith(wordDto)

        expect(word.word).toBe('word')
        expect(word.remarks).toBe('string')
    });

    describe('ConvertToDto method', () => {

    });
});