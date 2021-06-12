import {IReadOnlyEntity} from '../interfaces/IReadOnlyEntity';
import {queryDatabase} from '../services/db';
import {ISpeechPartDto} from '../interfaces/dto/IWordMetadataDto';
import {ISpeechPart} from '../interfaces/ISpeechPart';

export class SpeechPart implements ISpeechPart, IReadOnlyEntity<ISpeechPart, ISpeechPartDto> {
    dbid: number = 0;
    englishName: string = '';

    constructor(id?: number) {
        this.dbid = id || 0;
    }

    async loadFromDb(id?: number) {
        const query = 'SELECT id, title FROM tnw2.speech_parts WHERE id = $1';
        const result = await queryDatabase(query, [id || this.dbid]);

        if (result?.length) {
            this.dbid = result[0].id;
            this.englishName = result[0].title;
        }
    }

    convertToDto(): ISpeechPartDto {
        return {
            name: this.englishName,
            id: this.dbid
        }
    }
}
