import {IWordDto} from "../interfaces/dto/IWordDto";
import {queryDatabase} from "../services/db";
import {User} from "./User";
import {SpeechPart} from "./SpeechPart";
import {Gender} from "./Gender";
import {Language} from "./Language";
import {ICRUDEntity} from "../interfaces/ICRUDEntity";
import {IWordDb} from "../interfaces/db/IWordDb";
import {IWordFilterData} from "../interfaces/IWordFilterData";
import {genders, speechParts, languages} from "../const/constData";

export class Word implements ICRUDEntity<IWordDto, IWordDb>{
    dbid?: number;
    word?: string;
    translations?: string;
    speechPart?: SpeechPart;
    gender?: Gender;
    forms?: string;
    originalLanguage?: Language;
    translatedLanguage?: Language;
    remarks?: string;
    stressLetterIndex?: number;
    userCreated?: User;

    constructor(word?: IWordDto, user?: User) {
        this.replaceWith(word, user);
    }

    async save(): Promise<void> {
        const query = 'INSERT INTO tnw2.words (word, translations, speech_part_id, gender_id, forms, original_language_id, translated_language_id, remarks, user_created_id, stress_letter_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';

        return queryDatabase(query, [
            this.word as string,
            this.translations?.split(','),
            this.speechPart?.dbid,
            this.gender?.dbid,
            this.forms?.split(','),
            this.originalLanguage?.dbid,
            this.translatedLanguage?.dbid,
            this.remarks as string,
            this.userCreated?.dbid,
            this.stressLetterIndex as number
        ]).then();
    }

    async loadFromDB(id: number, filterData?: IWordFilterData): Promise<void> {
        const queryPart = this.createFilterDataSubquery(filterData);
        const query = 'SELECT id, word, translations, forms, remarks, stress_letter_index, tnw2.speech_parts.title, tnw2.genders.title FROM tnw2.words LEFT JOIN tnw2.speech_parts ON tnw2.words.speech_part_id=tnw2.speech_parts.id LEFT JOIN tnw2.genders ON tnw2.words.gender_id=tnw2.genders.id WHERE id = $1' + queryPart;
        const dbResult = await queryDatabase(query, [id, ...queryPart.params]);

        if (dbResult?.length) {
            console.log(dbResult[0]);
            // this.dbid = dbResult[0].id;
            // this.userCreated = dbResult[0].uid;
            // this.dbid = dbResult[0].id;
            // this.dbid = dbResult[0].id;
            // this.dbid = dbResult[0].id;
            // this.dbid = dbResult[0].id;
            // this.dbid = dbResult[0].id;
            // this.dbid = dbResult[0].id;
        }
    }

    private createFilterDataSubquery(filterData?: IWordFilterData): {queryPart: string; params: any[]} {
        if (!filterData) {
            return {queryPart: '', params: []};
        }

        const keyArray = Object.keys(filterData).map((key, index) => `${key} = $${index + 2}`);
        const params = Object.values(filterData);

        return {
            queryPart: ' ' + keyArray.join(', AND '),
            params
        }
    }

    convertToDto(): IWordDto {
        return <IWordDto>{
            user_created_id: this.userCreated?.dbid,
            stress_letter_index: this.stressLetterIndex,
            remarks: this.remarks,
            forms: this.forms,
            translations: this.translations,
            word: this.word,
            gender_id: this.gender?.dbid,
            id: this.dbid,
            original_language_id: this.originalLanguage?.dbid,
            translated_language_id: this.translatedLanguage?.dbid,
            speech_part_id: this.speechPart?.dbid
        };
    }

    replaceWith(entity?: IWordDto, user?: User): void {
        this.word = entity?.word;
        this.translations = entity?.translations;
        this.speechPart = speechParts.find(({dbid}) => entity?.speech_part_id.toString() === dbid.toString());
        this.gender = genders.find(({dbid}) => entity?.gender_id.toString() === dbid.toString());
        this.forms = entity?.forms;
        this.originalLanguage = languages.find(({dbid}) => entity?.original_language_id.toString() === dbid.toString());
        this.translatedLanguage = languages.find(({dbid}) => entity?.translated_language_id.toString() === dbid.toString());
        this.remarks = entity?.remarks;
        this.stressLetterIndex = entity?.stress_letter_index;
        this.userCreated = user;
    }
}