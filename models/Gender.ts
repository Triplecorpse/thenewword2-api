import {IReadOnlyEntity} from "../interfaces/IReadOnlyEntity";
import {IGenderDb} from "../interfaces/db/IGenderDb";
import {queryDatabase} from "../services/db";

export class Gender implements IReadOnlyEntity<string> {
    dbid: number = 0;
    body: string = '';

    constructor(data?: IGenderDb) {
        this.dbid = data?.id || 0;
        this.body = data?.title || '';
    }

    async loadFromDb(id: number) {
        const query = 'SELECT id, title FROM tnw2.genders WHERE id = $1';
        const result: IGenderDb[] = await queryDatabase(query, [id]);

        if (result?.length) {
            this.dbid = result[0].id;
            this.body = result[0].title;
        }
    }
}
