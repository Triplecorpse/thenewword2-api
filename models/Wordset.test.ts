import {Wordset} from "./Wordset";

jest.mock('../const/constData')

describe('Wordset class', () => {
    describe('constructor', () => {
        it('Should create an object from DTO interface', () => {
            const wordset = new Wordset({
                id: 1,
                translated_language_id: 2,
                words_count: 20,
                original_language_id: 3,
                name: 'sample'
            });

            console.log(wordset);

            expect(wordset).toMatchObject({
                dbid: 1,
                name: 'sample',
                wordsCount: 20
            });
        });

        it('Should create an empty object and not throw any exception if no data is passed', () => {
            expect(() => {new Wordset()}).not.toThrowError();
        });
    });

    describe('convertToDto', () => {});

    describe('loadFromDB', () => {});

    describe('remove', () => {});

    describe('replaceWith', () => {});

    describe('save', () => {});
});