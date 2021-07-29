export interface IWordSetDto {
    id: number;
    name: string;
    foreign_language_id?: number;
    native_language_id?: number;
    words_count?: number;
}
