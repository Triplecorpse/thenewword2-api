import {IReadOnlyEntity} from '../interfaces/IReadOnlyEntity';
import {queryDatabase} from '../services/db';
import {IGenderDto} from '../interfaces/dto/IWordMetadataDto';
import {IGender} from '../interfaces/IGender';

export class Gender implements IGender, IReadOnlyEntity<IGender, IGenderDto> {
    dbid: number = 0;
    englishName: string = '';

    constructor(id?: number) {
        this.dbid = id || 0;
    }

    async loadFromDb(id?: number) {
        const query = 'SELECT id, title FROM tnw2.genders WHERE id = $1';
        const result = await queryDatabase(query, [id || this.dbid]);

        if (result?.length) {
            this.dbid = result[0].id;
            this.englishName = result[0].title;
        }
    }

    convertToDto(): IGenderDto {
        return {
            id: this.dbid,
            name: this.englishName
        }
    }
}
