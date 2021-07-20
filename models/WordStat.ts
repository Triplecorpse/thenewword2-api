import {queryDatabase} from "../services/db";
import {CustomError} from "./CustomError";
import {User} from "./User";
import {Word} from "./Word";
import {TWordStatStatus} from "../types/wordStatStatus";

export interface IWordStatDto {
    id: number;
    word_id: number;
    user_id: number;
    status: TWordStatStatus;
    timestamp_created: string;
}

export class WordStat {
    id: number;
    userId: number;
    wordId: number;
    status: TWordStatStatus
    timestamp: Date;

    constructor(dto?: IWordStatDto) {
        if (dto) {
            this.id = dto.id;
            this.userId = dto.user_id;
            this.wordId = dto.word_id;
            this.status = dto.status;
            this.timestamp = new Date(dto.timestamp_created)
        }
    }

    convertToDto(): IWordStatDto {
        return {
            id: this.id,
            timestamp_created: this.timestamp.toISOString(),
            status: this.status,
            word_id: this.wordId,
            user_id: this.userId
        }
    }

    async save(): Promise<void> {
        try {
            let result;

            if (this.id && this.status === 'skipped') {
                result = await queryDatabase('UPDATE tnw2.word_statistics SET status=$1, created_at=(NOW() AT TIME ZONE \'utc\') WHERE id=$2 RETURNING id', [this.status, this.id]);
            } else if (!this.id) {
                result = await queryDatabase('INSERT INTO tnw2.word_statistics (user_id, word_id, status) VALUES ($1, $2, $3) RETURNING id', [this.userId, this.wordId, this.status]);
            } else {
                throw new CustomError('WORD_STATISTIC_SAVE_ERROR', {message: 'Cannon update: status should be skipped'})
            }

            this.id = result[0].id;
        } catch (error) {
            throw new CustomError('WORD_STATISTIC_SAVE_ERROR', error);
        }
    }

    static async fromDb(id: number): Promise<WordStat> {
        try {
            const result = await queryDatabase('SELECT * FROM tnw2.word_statistics WHERE id=$1', [id]);
            return new WordStat({
                id: result[0].id,
                user_id: result[0].user_id,
                word_id: result[0].word_id,
                status: result[0].status,
                timestamp_created: result[0].created_at
            });
        } catch (error) {
            throw new CustomError('WORD_STATISTIC_LOAD_ERROR', error)
        }
    }

    static async byUserAndWord(user_id: number, word_id: number): Promise<WordStat[]> {
        try {
            const result = await queryDatabase('SELECT * FROM tnw2.word_statistics WHERE user_id=$1 AND word_id=$2', [user_id, word_id]);
            return  result.map(resultItem => new WordStat({
                id: resultItem.id,
                timestamp_created: resultItem.created_at,
                status: resultItem.status,
                word_id: resultItem.wordId,
                user_id: resultItem.user_id
            }));
        } catch (error) {
            throw new CustomError('WORD_STATISTIC_LOAD_ERROR', error)
        }
    }
}