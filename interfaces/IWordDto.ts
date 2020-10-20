export interface IWordDto {
    id?: number;
    word: string;
    translations: string;
    speech_part: string;
    gender: string;
    forms: string;
    original_language: string;
    translated_language: string;
    remarks: string;
    stress_letter_index: number;
    user_created?: any;
}
