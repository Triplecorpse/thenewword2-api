import {Wordset} from "./Wordset";
import {Language} from "./Language";
import * as db from "../services/db";
import {User} from "./User";

jest.mock('../const/constData')

describe('Wordset class', () => {
    let spy = jest.spyOn(db, 'queryDatabase').mockResolvedValueOnce([{id: 1}]);
    let wordset = new Wordset();

    beforeEach(() => {
        wordset = new Wordset({
            id: 1,
            native_language_id: 2,
            words_count: 20,
            foreign_language_id: 3,
            name: 'sample'
        });
        wordset.translatedLanguage = new Language();
        wordset.originalLanguage = new Language();
        wordset.user = new User();
        spy = jest.spyOn(db, 'queryDatabase').mockResolvedValueOnce([{id: 1}]);
    });

    describe('constructor', () => {
        it('Should create an object from DTO interface', () => {
            const wordset = new Wordset({
                id: 1,
                native_language_id: 2,
                words_count: 20,
                foreign_language_id: 3,
                name: 'sample'
            });

            expect(wordset).toMatchObject({
                dbid: 1,
                name: 'sample',
                wordsCount: 20
            });
        });

        it('Should create an empty object and not throw any exception if no data is passed', () => {
            expect(() => {
                new Wordset()
            }).not.toThrowError();
        });
    });

    describe('convertToDto', () => {
        it('Should correcntly convert a wordset to DTO', () => {
            const dto = wordset.convertToDto();
            expect(dto).toMatchObject({
                id: 1,
                words_count: 20,
                name: 'sample'
            });
        })
    });

    describe('loadFromDB', () => {

    });

    describe('remove', () => {
    });

    describe('replaceWith', () => {
        wordset.replaceWith({
            id: 12,
            name: 'name',
            words_count: 10,
            foreign_language_id: 1,
            native_language_id: 1
        });

        expect(wordset).toMatchObject({
            dbid: 12,
            name: 'name',
            wordsCount: 10
        });
    });

    describe('save', () => {
        it('Should create a new entity in the DB in id is not specified', async () => {
            wordset.dbid = 0;
            await wordset.save();
            expect(spy).toBeCalledWith(expect.stringContaining('INSERT INTO tnw2.word_sets'), expect.arrayContaining([]));
        });

        it('Should update an existing entity in the DB in id is specified', async () => {
            await wordset.save();
            expect(spy).toBeCalledWith(expect.stringContaining('UPDATE tnw2.word_sets'), expect.arrayContaining([]));
        });
    });
});