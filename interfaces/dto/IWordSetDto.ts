export interface IWordSetDto {
    id: number;
    name: string;
    words?: number[];
    original_language_id: number;
    translated_language_id: number;
}
