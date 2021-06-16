import {ICRUDEntity} from "../interfaces/ICRUDEntity";
import {Word} from "./Word";
import {IWordSetDto} from "../interfaces/dto/IWordSetDto";
import {User} from "./User";
import {CustomError} from "./CustomError";
import {Language} from "./Language";
import {queryDatabase} from "../services/db";
import {languages} from "../const/constData";

export class Wordset implements ICRUDEntity<IWordSetDto> {
    dbid: number = 0;
    name: string = '';
    originalLanguage: Language;
    translatedLanguage: Language;
    words: Word[] = [];
    user: User;

    constructor(wordSetDto?: IWordSetDto) {
        if (wordSetDto) {
            this.replaceWith(wordSetDto);
        }
    }

    convertToDto(): IWordSetDto {
        return {
            id: this.dbid,
            words: [],
            name: this.name,
            original_language_id: this.originalLanguage.dbid,
            translated_language_id: this.translatedLanguage.dbid
        };
    }

    async loadFromDB(id: number): Promise<void> {
        const query = 'SELECT id, title, original_language_id, translated_language_id, user_created_id FROM tnw2.word_sets WHERE id=$1';
        const queryWordSetsWords = 'SELECT word_set_id, word_id FROM tnw2.relation_words_word_sets WHERE word_set_id=$1';
        const queryWordSetsUsers = 'SELECT word_set_id, user_id FROM tnw2.relation_users_word_sets WHERE word_set_id=$1';

        return Promise.resolve(undefined);
    }

    async remove(): Promise<void> {
        return Promise.resolve(undefined);
    }

    replaceWith(entity: IWordSetDto): void {
        this.dbid = entity.id;
        this.name = entity.name;
        this.originalLanguage = languages.find(l => l.dbid === entity.original_language_id) as Language;
        this.translatedLanguage = languages.find(l => l.dbid === entity.translated_language_id) as Language;
        // this.words = entity.words.map(wordDto => new Word(wordDto));
    }

    async save(): Promise<void> {
        if (!this.user) {
            throw new CustomError('SAVE_FAILED');
        }

        let query;
        let userRelationQuery;
        let wordRelationQuery;

        if (this.dbid) {
            query = 'UPDATE tnw2.word_sets SET title=$1, original_language_id=$2, translated_language_id=$3 last_modified_at=(NOW() AT TIME ZONE \'utc\') WHERE id=$12 RETURNING *';
        } else {
            query = 'INSERT INTO tnw2.word_sets (title, original_language_id, translated_language_id, user_created_id) VALUES ($1, $2, $3, $4) RETURNING *';
            userRelationQuery = 'INSERT INTO tnw2.relation_users_word_sets (user_id, word_set_id) VALUES ($1, $2)';
        }

        try {
            const wordsetResult = await queryDatabase(query, [this.name, this.originalLanguage.dbid, this.translatedLanguage.dbid, this.user.dbid]);

            this.dbid = wordsetResult[0].id;

            if (userRelationQuery) {
                await queryDatabase(userRelationQuery, [this.user.dbid, this.dbid]);
            }


            // const wordIdsAssignedResult = await queryDatabase('SELECT word_id from tnw2.relation_words_word_sets where word_set_id=$1', [this.dbid]);
            // const wordIdsAssigned = wordIdsAssignedResult.map(({word_id}) => word_id);
            // const actualWordIds = this.words.map(({dbid}) => dbid);
            // const wordIdsToAdd = actualWordIds.filter(id => !wordIdsAssigned.includes(id));
            // const wordIdsToRemove = wordIdsAssigned.filter(id => !actualWordIds.includes(id));
            // const insertValues = wordIdsToAdd.map(id => `(${id}, ${this.dbid})`);
            // const removeWhere = `word_id IN (${wordIdsToRemove.join(',')})`;
            //
            // await (`INSERT INTO tnw2.relation_words_word_sets (word_id, word_set_id) VALUES ${insertValues.join(',')}`);
            // await (`DELETE FROM tnw2.relation_words_word_sets WHERE ${removeWhere}`);
        } catch (error) {
            console.log(error, this.originalLanguage);
            throw new CustomError('SAVE_FAILED', error);
        }
    }

    static async factoryLoad(userAssignedId: number): Promise<Wordset[]> {
        const queryWordSetsUsers = 'SELECT word_set_id FROM tnw2.relation_users_word_sets WHERE user_id=$1';

        return [new Wordset()];
    }
}
