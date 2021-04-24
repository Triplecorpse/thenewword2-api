import {IUserDto} from "./IUserDto";

export interface IWordDto {
    id?: number;
    word: string;
    translations: string;
    speech_part_id: number;
    speech_part_name?: string;
    gender_id: number;
    gender_name?: string;
    forms: string;
    original_language_id: number;
    translated_language_id: number;
    remarks: string;
    stress_letter_index: number;
    user_created?: IUserDto;
}
