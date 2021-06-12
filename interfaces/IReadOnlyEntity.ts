export interface IReadOnlyEntity<T = any, K = any> {
    dbid: number;
    loadFromDb(...args: any): void;
    convertToDto(): K
}
