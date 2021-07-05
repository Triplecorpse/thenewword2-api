export interface ISymbolDto {
    language_id: number;
    user_id: number;
    symbols: string[];
    action: 'add' | 'remove';
}
