import {IUserDto} from './IUserDto';
import {ITimeInterval} from "../ITimeInterval";

export interface IWordDto {
    id?: number;
    word?: string;
    translations: string[];
    speech_part_id: number;
    gender_id: number;
    gender_name?: string;
    forms: string[];
    original_language_id: number;
    translated_language_id: number;
    remarks: string;
    stress_letter_index: number;
    user_created?: IUserDto;
    word_set_id?: number;
    threshold?: number;
    times_in_exercise?: number;
    last_issued?: ITimeInterval;
}
