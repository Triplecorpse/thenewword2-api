export interface ISymbolDto {
    id?: number;
    language_id?: number;
    user_id?: number;
    symbols?: string[];
    action?: 'add' | 'remove';
}
