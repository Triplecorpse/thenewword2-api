import {IWordDto} from "../interfaces/IWordDto";
import {queryDatabase} from "../services/db";

export class Word {
    id?: string;
    word?: string;
    translations?: string;
    speechPart?: string;
    gender?: string;
    forms?: string;
    originalLanguage?: string;
    translatedLanguage?: string;
    remarks?: string;
    stressLetterIndex?: number;
    userCreated?: any;

    constructor(word?: IWordDto) {
        this.word = word?.word;
        this.translations = word?.translations;
        this.speechPart = word?.speech_part;
        this.gender = word?.gender;
        this.forms = word?.forms;
        this.originalLanguage = word?.original_language;
        this.translatedLanguage = word?.translated_language;
        this.remarks = word?.remarks;
        this.stressLetterIndex = word?.stress_letter_index;
        this.userCreated = word?.user_created;
    }

    async save(): Promise<Word> {
        const query = 'INSERT INTO tnw2.words (word, translations, speech_part_id, gender_id, forms, original_language, translated_language, remarks, user_created_id, stress_letter_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
        const metadataResult$ = await Promise.all([
            queryDatabase('SELECT id FROM tnw2.speech_parts WHERE title = $1', [this.speechPart as string]),
            queryDatabase('SELECT id FROM tnw2.genders WHERE title = $1', [this.gender as string]),
            queryDatabase('SELECT id, code2 FROM tnw2.languages WHERE code2 = $1 OR code2 = $2',
                [
                    this.originalLanguage as string,
                    this.translatedLanguage as string
                ])
        ]);
        const originalLanguageId = metadataResult$[2].find(({code2}) => code2 === this.originalLanguage);
        const translatedLanguageId = metadataResult$[2].find(({code2}) => code2 === this.translatedLanguage);
        return queryDatabase(query, [
            this.word as string,
            this.translations as string,
            this.speechPart as string,
            this.gender as string,
            this.forms as string,
            originalLanguageId,
            translatedLanguageId,
            this.remarks as string,
            '',
            this.stressLetterIndex as number
        ]).then();
    }
}