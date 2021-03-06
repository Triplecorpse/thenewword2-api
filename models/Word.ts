import {IWordDto} from '../interfaces/dto/IWordDto';
import {queryDatabase} from '../services/db';
import {User} from './User';
import {SpeechPart} from './SpeechPart';
import {Gender} from './Gender';
import {Language} from './Language';
import {ICRUDEntity} from '../interfaces/ICRUDEntity';
import {IWordFilterData} from '../interfaces/IWordFilterData';
import {genders, speechParts, languages} from '../const/constData';
import {CustomError} from './CustomError';

export interface IFilterFormValue {
    wordset: number[];
    language: number;
    threshold: number;
    limit: number;
}

export class Word implements ICRUDEntity<IWordDto> {
    dbid?: number;
    word?: string;
    translations?: string[];
    transcription?: string;
    speechPart?: SpeechPart;
    gender?: Gender;
    forms?: string[];
    originalLanguage?: Language;
    translatedLanguage?: Language;
    remarks?: string;
    stressLetterIndex?: number;
    userCreated?: User;

    constructor(word?: IWordDto, user?: User) {
        this.replaceWith(word, user);
    }

    async save(): Promise<void> {
        try {
            let query;
            let relationUserQuery;
            const params = [
                this.word,
                this.translations,
                this.speechPart?.dbid,
                this.gender?.dbid,
                this.forms,
                this.originalLanguage?.dbid,
                this.translatedLanguage?.dbid,
                this.remarks as string,
                this.userCreated?.dbid,
                this.stressLetterIndex
            ];

            if (this.dbid) {
                query = 'UPDATE tnw2.words SET word=$1, translations=$2, speech_part_id=$3, gender_id=$4, forms=$5, original_language_id=$6, translated_language_id=$7, remarks=$8, user_created_id=$9, stress_letter_index=$10, last_modified_at=(NOW() AT TIME ZONE \'utc\') WHERE id=$11 RETURNING id';
                params.push(this.dbid);
            } else {
                query = 'INSERT INTO tnw2.words (word, translations, speech_part_id, gender_id, forms, original_language_id, translated_language_id, remarks, user_created_id, stress_letter_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id';
                relationUserQuery = 'INSERT INTO tnw2.relation_words_users (user_id, word_id) VALUES ($1, $2)';
            }

            const result = await queryDatabase(query, params);

            this.dbid = result[0].id;

            if (relationUserQuery) {
                await queryDatabase(relationUserQuery, [this.userCreated?.dbid, this.dbid]);
            }

            await queryDatabase(query, params);
        } catch (error) {
            throw new CustomError('SAVE_FAILED', error);
        }
    }

    async saveToWordSet(wordsetId: number): Promise<void> {
        try {
            await queryDatabase('INSERT INTO tnw2.relation_words_word_sets (word_set_id, word_id) VALUES ($1, $2)', [wordsetId, this.dbid]);
        } catch (error) {
            throw new CustomError('GENERIC_DB_ERROR', error);
        }
    }

    async removeFromWordSet(wordsetId: number): Promise<void> {
        try {
            await queryDatabase('DELETE FROM tnw2.relation_words_word_sets WHERE word_set_id=$1 AND word_id=$2', [wordsetId, this.dbid]);
        } catch (error) {
            throw new CustomError('GENERIC_DB_ERROR', error);
        }
    }

    async loadFromDB(id: number, filterData?: IWordFilterData, user?: User): Promise<void> {
        const queryPart = this.createFilterDataSubquery(filterData);
        const query = 'SELECT id, word, translations, forms, remarks, stress_letter_index, speech_part, gender, original_language, translated_language FROM tnw2.words WHERE id = $1' + queryPart.queryPart;
        const dbResult = await queryDatabase(query, [id, ...queryPart.params]);

        if (dbResult?.length) {
            const loadedWord = dbResult[0];
            this.dbid = loadedWord.id;
            this.speechPart = speechParts.find(sp => sp.dbid === loadedWord.speech_part);
            this.gender = genders.find(g => g.dbid === loadedWord.gender);
            this.originalLanguage = languages.find(l => l.dbid === loadedWord.original_language);
            this.translatedLanguage = languages.find(l => l.dbid === loadedWord.translated_language);
            this.word = loadedWord.word;
            this.translations = loadedWord.translations;
            this.forms = loadedWord.forms;
            this.remarks = loadedWord.remarks;
            this.stressLetterIndex = loadedWord.stress_letter_index;
            this.userCreated = user;
        }
    }

    private createFilterDataSubquery(filterData?: IWordFilterData): { queryPart: string; params: any[] } {
        if (!filterData) {
            return {queryPart: '', params: []};
        }

        const keyArray = Object.keys(filterData).map((key, index) => `${key} = $${index + 2}`);
        const params = Object.values(filterData);

        return {
            queryPart: ' ' + keyArray.join(', AND '),
            params
        }
    }

    convertToDto(): IWordDto {
        return {
            user_created_id: this.userCreated?.dbid,
            stress_letter_index: this.stressLetterIndex,
            remarks: this.remarks,
            forms: this.forms,
            translations: this.translations,
            word: this.word,
            gender_id: this.gender?.dbid,
            id: this.dbid,
            original_language_id: this.originalLanguage?.dbid,
            translated_language_id: this.translatedLanguage?.dbid,
            speech_part_id: this.speechPart?.dbid
        } as IWordDto;
    }

    replaceWith(entity?: IWordDto, user?: User): void {
        this.word = entity?.word;
        this.translations = entity?.translations;
        this.speechPart = speechParts.find(({dbid}) => entity?.speech_part_id?.toString() === dbid.toString());
        this.gender = genders.find(({dbid}) => entity?.gender_id?.toString() === dbid.toString());
        this.forms = entity?.forms;
        this.originalLanguage = languages.find(({dbid}) => entity?.original_language_id.toString() === dbid.toString());
        this.translatedLanguage = languages.find(({dbid}) => entity?.translated_language_id.toString() === dbid.toString());
        this.remarks = entity?.remarks;
        this.stressLetterIndex = entity?.stress_letter_index;
        this.userCreated = user ? user : this.userCreated;
    }

    async remove(): Promise<void> {
        if (!this.dbid) {
            throw {type: 'NO_ID_PROVIDED'};
        }

        const query = 'DELETE FROM tnw2.words WHERE id=$1';

        return queryDatabase(query, [this.dbid]).then();
    }

    static async subscribeToWordSet(wordId: number, wordSetId: number): Promise<void> {
        await queryDatabase('INSERT INTO tnw2.relation_words_word_sets SET word_set_id=$1, word_id = $2', [wordSetId, wordId]);
    }

    static async unsubscribeFromWordSet(wordId: number, wordSetId: number): Promise<void> {
        await queryDatabase('DELETE FROM tnw2.relation_words_word_sets WHERE word_set_id=$1 AND word_id = $2', [wordSetId, wordId]);
    }

    static async fromDb(id: number): Promise<Word> {
        try {
            const result = await queryDatabase('SELECT * from tnw2.words WHERE id=$1', [id]);
            const foundResult = result[0];
            const word = new Word();

            word.dbid = foundResult.id;
            word.word = foundResult.word;
            word.remarks = foundResult.remarks;
            word.forms = foundResult.forms;
            word.translations = foundResult.translations;
            word.originalLanguage = await Language.fromDb(foundResult.original_language_id);
            word.translatedLanguage = await Language.fromDb(foundResult.translated_language_id);
            word.userCreated = await User.fromDb(foundResult.user_created_id);
            word.transcription = foundResult.transcription;
            word.stressLetterIndex = foundResult.stress_letter_index;

            if (foundResult.speech_part_id) {
                word.speechPart = await SpeechPart.fromDb(foundResult.speech_part_id);
            }

            if (foundResult.gender_id) {
                word.gender = await Gender.fromDb(foundResult.gender_id);
            }

            return word;
        } catch (error) {
            throw new CustomError('GET_WORDS_ERROR', error);
        }
    }

    static async searchByWordSetId(wordSetId: number): Promise<Word[]> {
        try {
            const result = await queryDatabase('SELECT word_id AS id FROM tnw2.relation_words_word_sets WHERE word_set_id=$1', [wordSetId]);
            const words$ = result.map(({id}) => Word.fromDb(id));

            return Promise.all(words$);
        } catch (error) {
            throw new CustomError('GET_WORDS_ERROR', error);
        }
    }

    static async searchByUserId(userId: number): Promise<Word[]> {
        try {
            const result = await queryDatabase('SELECT word_id AS id FROM tnw2.relation_words_users WHERE user_id=$1', [userId]);
            const words$ = result.map(({id}) => Word.fromDb(id));

            return Promise.all(words$);
        } catch (error) {
            throw new CustomError('GET_WORDS_ERROR', error);
        }
    }

    static async subscribe(wordId: number, userId: number) {
        const query = 'INSERT INTO tnw2.relation_words_users (word_id, user_id) SET ($1, $2)';

        return queryDatabase(query, [wordId, userId]).then();
    }

    static async unsubscribe(wordId: number, userId: number) {
        const query = 'DELETE FROM tnw2.relation_words_users WHERE word_id=$1 AND user_id=$2';

        return queryDatabase(query, [wordId, userId]).then();
    }

    static async getWordsToExercise(filter: IFilterFormValue, userId: number): Promise<Word[]> {
        try {
            let filterByWordsetResult: any[] = [];
            let filterByLanguageResult: any[] = [];
            let overAllResult = [];

            if (filter.wordset.length) {
                let $n: string[] = [];

                filter.wordset.forEach((ws_id, index) => {
                    $n.push(`$${index + 1}`);
                })

                const queryPart = `(${$n.join(',')})`;

                filterByWordsetResult = await queryDatabase(`SELECT word_id from tnw2.relation_words_word_sets WHERE word_set_id IN ${queryPart} ORDER BY random() LIMIT $${filter.wordset.length + 1}`, [...filter.wordset, filter.limit]);
                filterByWordsetResult = filterByWordsetResult.map(({word_id}) => word_id);

                return Promise.all(filterByWordsetResult.map(id => Word.fromDb(id)));
            }

            filterByLanguageResult = await queryDatabase('SELECT tnw2.relation_words_users.word_id FROM tnw2.relation_words_users LEFT JOIN tnw2.words ON tnw2.relation_words_users.word_id=tnw2.words.id WHERE tnw2.words.original_language_id=$1 AND tnw2.relation_words_users.user_id=$2 ORDER BY random() LIMIT $3', [filter.language, userId, filter.limit]);
            filterByLanguageResult = filterByLanguageResult.map(({word_id}) => word_id);

            overAllResult = [...new Set([...filterByWordsetResult, ...filterByLanguageResult])];

            return Promise.all(overAllResult.map(id => Word.fromDb(id)));
        } catch (error) {
            throw new CustomError('GET_WORDS_ERROR', error);
        }
    }

    async setStatistic(userId: number, stat: 'right' | 'wrong' | 'skipped', isReplacingId?: number) {
        try {
            const existingStatResult = await queryDatabase('SELECT * FROM tnw2.word_statistics WHERE user_id=$1 AND word_id=$2', [userId, this.dbid]);
            const existingStat = existingStatResult[0];

            if (existingStat) {
                let queryPart = '';

                if (stat === 'right') {
                    queryPart = 'times_right=times_right+1';
                } else if (stat === 'wrong') {
                    queryPart = 'times_wrong=times_wrong+1';
                } else if (stat === 'skipped') {
                    queryPart = 'times_skipped=times_skipped+1';
                } else {
                    throw new CustomError('WORD_STATISTIC_ERROR', {message: 'stat should be 1 of 3 states: right, wrong or skipped'})
                }

                await queryDatabase(`UPDATE tnw2.word_statistics SET ${queryPart} WHERE user_id=$1 AND word_id=$2 RETURNING *`, [userId, this.dbid]);
            } else {
                let queryPart = '';

                if (stat === 'right') {
                    queryPart = 'times_right';
                } else if (stat === 'wrong') {
                    queryPart = 'times_wrong';
                } else if (stat === 'skipped') {
                    queryPart = 'times_skipped';
                } else {
                    throw new CustomError('WORD_STATISTIC_ERROR', {message: 'stat should be 1 of 3 states: right, wrong or skipped'})
                }

                await queryDatabase(`INSERT INTO tnw2.word_statistics (user_id, word_id, ${queryPart}) VALUES ($1, $2, $3) RETURNING *`, [userId, this.dbid, 1]);
            }
        } catch (error) {
            throw new CustomError('WORD_STATISTIC_ERROR', error);
        }
    }
}
