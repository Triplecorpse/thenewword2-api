import {IReadOnlyEntity} from '../interfaces/IReadOnlyEntity';
import {queryDatabase} from '../services/db';
import {ILanguage} from '../interfaces/ILanguage';
import {ILanguageDto} from '../interfaces/dto/IWordMetadataDto';
import {CustomError} from "./CustomError";

export class Language implements ILanguage, IReadOnlyEntity<ILanguage, ILanguageDto> {
    dbid: number;
    iso2: string;
    englishName: string;
    nativeName: string;
    rtl: boolean = false;

    constructor(idOrIso2?: number | string) {
        if (typeof idOrIso2 === 'number') {
            this.dbid = idOrIso2 || 0;
        } else if (typeof idOrIso2 === 'string') {
            this.iso2 = idOrIso2 || '';
        }
    }

    async loadFromDb(idOrIso2?: number | string) {
        try {
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
        } catch (error) {
            throw new CustomError('GENERIC_DB_ERROR', error)
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

    static fromDto(languageDto: ILanguageDto): Language {
        const language = new Language();

        language.dbid = languageDto.id;
        language.rtl = languageDto.rtl;
        language.iso2 = languageDto.iso2;
        language.englishName = languageDto.english_name;
        language.nativeName = languageDto.native_name;

        return language;
    }

    static async fromDb(id: number): Promise<Language> {
        try {
            const result = await queryDatabase('SELECT * from tnw2.languages WHERE id=$1', [id]);
            const language = new Language();

            language.dbid = result[0].id;
            language.rtl = result[0].rtl;
            language.iso2 = result[0].iso2;
            language.englishName = result[0].english_name;
            language.nativeName = result[0].native_name;

            return language;
        } catch (error) {
            throw new CustomError('GENERIC_DB_ERROR', error)
        }
    }

    private static mapDbToObj(db: any[]): Language[] {
        return db.map(resultItem => {
            const language = new Language();

            language.dbid = resultItem.id;
            language.rtl = resultItem.rtl;
            language.iso2 = resultItem.iso2;
            language.englishName = resultItem.english_name;
            language.nativeName = resultItem.native_name;

            return language;
        });
    }
}
