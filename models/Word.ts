import {IWordDto} from '../interfaces/dto/IWordDto';
import {queryDatabase} from '../services/db';
import {User} from './User';
import {SpeechPart} from './SpeechPart';
import {Gender} from './Gender';
import {Language} from './Language';
import {ICRUDEntity} from '../interfaces/ICRUDEntity';
import {IWordFilterData} from '../interfaces/IWordFilterData';
import {genders, speechParts, languages} from '../const/constData';

export class Word implements ICRUDEntity<IWordDto> {
    dbid?: number;
    word?: string;
    translations?: string[];
    speechPart?: SpeechPart;
    gender?: Gender;
    forms?: string[];
    originalLanguage?: Language;
    translatedLanguage?: Language;
    remarks?: string;
    stressLetterIndex?: number;
    userCreated?: User;

    constructor(word?: IWordDto, user?: User) {
        this.replaceWith(word, user);
    }

    async save(): Promise<void> {
        let query;
        const params = [
            this.word,
            this.translations,
            this.speechPart?.dbid,
            this.gender?.dbid,
            this.forms,
            this.originalLanguage?.dbid,
            this.translatedLanguage?.dbid,
            this.remarks as string,
            this.userCreated?.dbid,
            this.stressLetterIndex
        ];

        if (this.dbid) {
            query = 'UPDATE tnw2.words SET word=$1, translations=$2, speech_part_id=$3, gender_id=$4, forms=$5, original_language_id=$6, translated_language_id=$7, remarks=$8, user_created_id=$9, stress_letter_index=$10 WHERE id=$11';
            params.push(this.dbid);
        } else {
            query = 'INSERT INTO tnw2.words (word, translations, speech_part_id, gender_id, forms, original_language_id, translated_language_id, remarks, user_created_id, stress_letter_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
        }

        return queryDatabase(query, params).then();
    }

    async loadFromDB(id: number, filterData?: IWordFilterData, user?: User): Promise<void> {
        const queryPart = this.createFilterDataSubquery(filterData);
        const query = 'SELECT id, word, translations, forms, remarks, stress_letter_index, speech_part, gender, original_language, translated_language FROM tnw2.words WHERE id = $1' + queryPart.queryPart;
        const dbResult = await queryDatabase(query, [id, ...queryPart.params]);

        if (dbResult?.length) {
            const loadedWord = dbResult[0];
            this.dbid = loadedWord.id;
            this.speechPart = speechParts.find(sp => sp.dbid === loadedWord.speech_part);
            this.gender = genders.find(g => g.dbid === loadedWord.gender);
            this.originalLanguage = languages.find(l => l.dbid === loadedWord.original_language);
            this.translatedLanguage = languages.find(l => l.dbid === loadedWord.translated_language);
            this.word = loadedWord.word;
            this.translations = loadedWord.translations;
            this.forms = loadedWord.forms;
            this.remarks = loadedWord.remarks;
            this.stressLetterIndex = loadedWord.stress_letter_index;
            this.userCreated = user;
        }
    }

    private createFilterDataSubquery(filterData?: IWordFilterData): { queryPart: string; params: any[] } {
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
        return {
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
        } as IWordDto;
    }

    replaceWith(entity?: IWordDto, user?: User): void {
        this.word = entity?.word;
        this.translations = entity?.translations;
        this.speechPart = speechParts.find(({dbid}) => entity?.speech_part_id?.toString() === dbid.toString());
        this.gender = genders.find(({dbid}) => entity?.gender_id?.toString() === dbid.toString());
        this.forms = entity?.forms;
        this.originalLanguage = languages.find(({dbid}) => entity?.original_language_id.toString() === dbid.toString());
        this.translatedLanguage = languages.find(({dbid}) => entity?.translated_language_id.toString() === dbid.toString());
        this.remarks = entity?.remarks;
        this.stressLetterIndex = entity?.stress_letter_index;
        this.userCreated = user ? user : this.userCreated;
    }

    async remove(): Promise<void> {
        if (!this.dbid) {
            throw {type: 'NO_ID_PROVIDED'};
        }

        const query = 'DELETE FROM tnw2.words WHERE id=$1';

        return queryDatabase(query, [this.dbid]).then();
    }
}
