import {IReadOnlyEntity} from "../interfaces/IReadOnlyEntity";
import {ILanguageDb} from "../interfaces/db/ILanguageDb";
import {queryDatabase} from "../services/db";

export class Language implements IReadOnlyEntity<{ code2: string; englishName: string; nativeName: string; }> {
    dbid: number = 0;
    body = {
        code2: '',
        englishName: '',
        nativeName: ''
    }

    constructor(data?: ILanguageDb) {
        this.dbid = data?.id || 0;
        this.body = {
            code2: data?.code2 || '',
            englishName: data?.english_name || '',
            nativeName: data?.native_name || ''
        }
    }

    async loadFromDb(idOrIso2: number | string) {
        let query = 'SELECT id, code2, english_name, native_name FROM tnw2.languages WHERE ';

        if (typeof idOrIso2 === 'number') {
            query += 'id = $1';
        } else {
            query += 'code2 = $1';
        }

        const result: ILanguageDb[] = await queryDatabase(query, [idOrIso2]);

        if (result?.length) {
            this.dbid = result[0].id;
            this.body = {
                code2: result[0].code2,
                englishName: result[0].english_name,
                nativeName: result[0].native_name
            }
        }
    }
}
