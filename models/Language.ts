import {IReadOnlyEntity} from '../interfaces/IReadOnlyEntity';
import {queryDatabase} from '../services/db';
import {ILanguage} from '../interfaces/ILanguage';
import {ILanguageDto} from '../interfaces/dto/IWordMetadataDto';

export class Language implements ILanguage, IReadOnlyEntity<ILanguage, ILanguageDto> {
    dbid: number = 0;
    iso2: string = '';
    englishName: string = '';
    nativeName: string = '';
    rtl: boolean = false;

    constructor(idOrIso2?: number | string) {
        if (typeof idOrIso2 === 'number') {
            this.dbid = idOrIso2 || 0;
        } else if (typeof idOrIso2 === 'string') {
            this.iso2 = idOrIso2 || '';
        }
    }

    async loadFromDb(idOrIso2?: number | string) {
        let query = 'SELECT id, iso2, english_name, native_name, rtl FROM tnw2.languages WHERE ';
        let param: number | string = '';

        if (typeof idOrIso2 === 'number' || this.dbid) {
            query += 'id = $1';
            param = idOrIso2 || this.dbid;
        } else if (typeof idOrIso2 === 'string' || this.iso2) {
            query += 'iso2 = $1';
            param = idOrIso2 || this.iso2;
        }

        const result = await queryDatabase(query, [param]);

        if (result?.length) {
            this.dbid = result[0].id;
            this.iso2 = result[0].iso2;
            this.englishName = result[0].english_name;
            this.nativeName = result[0].native_name;
            this.rtl = result[0].rtl;
        }
    }

    convertToDto(): ILanguageDto {
        return {
            id: this.dbid,
            rtl: this.rtl,
            iso2: this.iso2,
            english_name: this.englishName,
            native_name: this.nativeName
        };
    }
}
