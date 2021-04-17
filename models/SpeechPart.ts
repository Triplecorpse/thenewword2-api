import {IReadOnlyEntity} from "../interfaces/IReadOnlyEntity";
import {queryDatabase} from "../services/db";
import {ISpeechPartDb} from "../interfaces/db/ISpeechPartDb";

export class SpeechPart implements IReadOnlyEntity<string> {
    dbid: number = 0;
    body: string = '';

    constructor(data?: ISpeechPartDb) {
        this.dbid = data?.id || 0;
        this.body = data?.title || '';
    }

    async loadFromDb(id: number) {
        const query = 'SELECT id, title FROM tnw2.speech_parts WHERE id = $1';
        const result: ISpeechPartDb[] = await queryDatabase(query, [id]);

        if (result?.length) {
            this.dbid = result[0].id;
            this.body = result[0].title;
        }
    }
}
