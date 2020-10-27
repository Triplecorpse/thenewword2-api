export interface IWordDb {
    id: number;
    word: string;
    translations: string;
    speech_part_id: number;
    gender_id: number;
    forms?: string;
    original_language_id: number;
    translated_language_id: number;
    remarks?: string;
    stress_letter_index: number;
    user_created_id?: number;
}
