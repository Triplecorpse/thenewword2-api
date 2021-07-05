export interface ISymbolDto {
    language_id: number;
    user_id: number;
    symbol: string;
    action: 'add' | 'remove';
}
