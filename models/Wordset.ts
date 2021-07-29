import {ICRUDEntity} from "../interfaces/ICRUDEntity";
import {IWordSetDto} from "../interfaces/dto/IWordSetDto";
import {User} from "./User";
import {CustomError} from "./CustomError";
import {Language} from "./Language";
import {queryDatabase} from "../services/db";
import {languages} from "../const/constData";

export interface IWordSetFilterData {
    user_created_login?: string;
    foreign_language_id?: number;
    native_language_id?: number[];
    name?: string;
}

export class Wordset implements ICRUDEntity<IWordSetDto> {
    dbid: number = 0;
    name: string = '';
    originalLanguage: Language;
    translatedLanguage: Language;
    user: User;
    wordsCount?: number;

    constructor(wordSetDto?: IWordSetDto) {
        if (wordSetDto) {
            this.replaceWith(wordSetDto);
        }
    }

    convertToDto(): IWordSetDto {
        return {
            id: this.dbid,
            name: this.name,
            foreign_language_id: this.originalLanguage.dbid,
            native_language_id: this.translatedLanguage.dbid,
            words_count: this.wordsCount,
            user_created_id: this.user.dbid
        };
    }

    async loadFromDB(id: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    async remove(): Promise<void> {
        return Promise.resolve(undefined);
    }

    replaceWith(entity: IWordSetDto): void {
        this.dbid = entity.id;
        this.name = entity.name;
        this.originalLanguage = languages.find(l => l.dbid === entity.foreign_language_id) as Language;
        this.translatedLanguage = languages.find(l => l.dbid === entity.native_language_id) as Language;
        this.wordsCount = entity.words_count;
    }

    async save(): Promise<void> {
        try {
            if (!this.user) {
                throw new CustomError('SAVE_FAILED');
            }

            let query;
            let userRelationQuery;

            if (this.dbid) {
                query = 'UPDATE tnw2.word_sets SET title=$1, foreign_language_id=$2, native_language_id=$3 last_modified_at=(NOW() AT TIME ZONE \'utc\') WHERE id=$5 RETURNING *';
            } else {
                query = 'INSERT INTO tnw2.word_sets (title, foreign_language_id, native_language_id, user_created_id) VALUES ($1, $2, $3, $4) RETURNING *';
                userRelationQuery = 'INSERT INTO tnw2.relation_users_word_sets (user_id, word_set_id) VALUES ($1, $2)';
            }

            const wordsetResult = await queryDatabase(query, [this.name, this.originalLanguage.dbid, this.translatedLanguage.dbid, this.user.dbid]);

            this.dbid = wordsetResult[0].id;

            if (userRelationQuery) {
                await queryDatabase(userRelationQuery, [this.user.dbid, this.dbid]);
            }
        } catch (error) {
            throw new CustomError('SAVE_FAILED', error);
        }
    }

    async isUserSubscribed(userId: number): Promise<boolean> {
        try {
            const result = await queryDatabase('SELECT count(*) FROM tnw2.relation_users_word_sets WHERE user_id=$1 AND word_set_id=$2', [userId, this.dbid]);

            return result[0]?.count > 0;
        } catch (error) {
            throw new CustomError('WORDSET_USER_SUBSCRIBED_ERROR', error);
        }
    }

    static async fromDb(id: number): Promise<Wordset> {
        try {
            const result = await queryDatabase('SELECT * FROM tnw2.word_sets WHERE id=$1', [id]);
            const foundWordSet = result[0];
            const wordset = new Wordset();
            const user = await User.fromDb(foundWordSet.user_created_id);
            const originalLanguage = await Language.fromDb(foundWordSet.foreign_language_id);
            const translatedLanguage = await Language.fromDb(foundWordSet.native_language_id);

            wordset.dbid = foundWordSet.id;
            wordset.name = foundWordSet.title;
            wordset.user = user;
            wordset.originalLanguage = originalLanguage;
            wordset.translatedLanguage = translatedLanguage;

            const wordCount = await queryDatabase('SELECT count(*) FROM tnw2.relation_words_word_sets WHERE word_set_id=$1', [wordset.dbid]);

            wordset.wordsCount = +wordCount[0].count;

            return wordset;
        } catch (error) {
            throw new CustomError('GET_WORDSETS_ERROR', error);
        }

    }

    static async patchName(name: string, wordSetId: number): Promise<Wordset> {
        const result = await queryDatabase('UPDATE tnw2.word_sets SET title=$1, last_modified_at=(NOW() AT TIME ZONE \'utc\') WHERE id=$2 RETURNING id', [name, wordSetId]);

        return Wordset.fromDb(result[0].id);
    }

    static async factoryLoadForUser(userId: number): Promise<Wordset[]> {
        try {
            const queryResult = await queryDatabase('SELECT id FROM tnw2.relation_users_word_sets LEFT JOIN tnw2.word_sets ON tnw2.relation_users_word_sets.word_set_id=tnw2.word_sets.id WHERE tnw2.relation_users_word_sets.user_id=$1', [userId]);
            const result = queryResult.map(({id}) => Wordset.fromDb(id));

            return Promise.all(result);
        } catch (error) {
            throw new CustomError('GET_WORDSETS_ERROR', error)
        }
    }

    static async factoryLoad(filter: IWordSetFilterData): Promise<Wordset[]> {
        try {
            let queryResult;
            let queryPart = '';
            let queryPartParams = [];
            const userIdResult = await queryDatabase('SELECT id FROM tnw2.users WHERE login=$1', [filter.user_created_login]);
            const userId = userIdResult[0]?.id;
            let lastIndexUsed = userId ? 1 : 0;

            if (filter.name) {
                lastIndexUsed++;
                queryPart += ` AND tnw2.word_sets.title=$${lastIndexUsed}`;
                queryPartParams.push(filter.name);
            }

            if (filter.foreign_language_id) {
                lastIndexUsed++;
                queryPart += ` AND tnw2.word_sets.foreign_language_id=$${lastIndexUsed}`;
                queryPartParams.push(+filter.foreign_language_id);
            }

            if (filter.native_language_id) {
                const sqlList: string[] = [];
                filter.native_language_id.forEach(id => {
                    lastIndexUsed++;
                    sqlList.push(`$${lastIndexUsed}`);
                    queryPartParams.push(+id);
                })
                queryPart += ` AND tnw2.word_sets.native_language_id IN (${sqlList.join(', ')})`;
            }

            if (userId) {
                queryResult = await queryDatabase(`SELECT tnw2.word_sets.id FROM tnw2.relation_users_word_sets LEFT JOIN tnw2.word_sets ON tnw2.relation_users_word_sets.word_set_id=tnw2.word_sets.id WHERE tnw2.relation_users_word_sets.user_id=$1${queryPart}`, [userId, ...queryPartParams]);
            } else {
                queryResult = await queryDatabase(`SELECT tnw2.word_sets.id FROM tnw2.relation_users_word_sets LEFT JOIN tnw2.word_sets ON tnw2.relation_users_word_sets.word_set_id=tnw2.word_sets.id WHERE 0=0${queryPart}`, queryPartParams);
            }

            const result = queryResult.map(({id}) => Wordset.fromDb(id));

            return Promise.all(result);
        } catch (error) {
            throw new CustomError('GET_WORDSETS_ERROR', error)
        }
    }

    static async subscribe(wordSetId: number, userId: number) {
        const query = 'INSERT INTO tnw2.relation_users_word_sets (word_set_id, user_id) VALUES ($1, $2)';

        return queryDatabase(query, [wordSetId, userId]).then();
    }

    static async unsubscribe(wordsetId: number, userId: number) {
        const query = 'DELETE FROM tnw2.relation_users_word_sets WHERE user_id=$1 AND word_set_id=$2';

        return queryDatabase(query, [userId, wordsetId]).then();
    }
}
