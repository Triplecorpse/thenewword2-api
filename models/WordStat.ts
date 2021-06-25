import {ICRUDEntity} from "../interfaces/ICRUDEntity";
import {queryDatabase} from "../services/db";
import {CustomError} from "./CustomError";
import {User} from "./User";
import {Word} from "./Word";

export class WordStat implements ICRUDEntity {
    dbid: number;
    user: User;
    word: Word;
    right = 0;
    wrong = 0;
    skipped = 0;

    convertToDto(): any {
        return undefined;
    }

    async loadFromDB(wordId: number, userId: number): Promise<void> {
        try {
            const result = await queryDatabase('SELECT * FROM tnw2.word_statistics WHERE user_id=$1 AND word_id=$2', [userId, wordId]);

            this.word = await Word.fromDb(wordId);
            this.user = await User.fromDb(userId);

            if (!result[0]) {
                return;
            }

            this.dbid = result[0].id;
            this.wrong = result[0].times_wrong;
            this.right = result[0].times_right;
            this.skipped = result[0].times_skipped;
        } catch (error) {
            throw new CustomError('WORD_STATISTIC_ERROR', error)
        }
    }

    remove(): Promise<void> {
        return Promise.resolve(undefined);
    }

    replaceWith(entity: any): void {
    }

    async save(): Promise<void> {
        try {
            let result;
            if (this.dbid) {
                result = await queryDatabase('UPDATE tnw2.word_statistics SET times_right=$1, times_wrong=$2, times_skipped=$3 WHERE id=$4 RETURNING id', [this.right, this.wrong, this. skipped, this.dbid]);
            } else {
                result = await queryDatabase('INSERT INTO tnw2.word_statistics (user_id, word_id, times_wrong, times_right, times_skipped) VALUES ($1, $2, $3, $4, $5) RETURNING id', [this.user.dbid, this.word.dbid, this.wrong, this.right, this. skipped]);
            }

            this.dbid = result[0].id;
        } catch (error) {
            throw new CustomError('WORD_STATISTIC_ERROR', error);
        }
    }

    static async fromDb(id: number): Promise<WordStat> {
        try {
            const result = await queryDatabase('SELECT * FROM tnw2.word_statistics WHERE id=$1', [id]);
            const wordStat = new WordStat();

            wordStat.dbid = result[0].id;
            wordStat.user = await User.fromDb(result[0].user_id);
            wordStat.word = await Word.fromDb(result[0].word_id);
            wordStat.wrong = result[0].times_wrong;
            wordStat.right = result[0].times_right;
            wordStat.skipped = result[0].times_skipped;

            return wordStat;
        } catch (error) {
            throw new CustomError('WORD_STATISTIC_ERROR', error)
        }
    }
}