export interface IReadOnlyEntity<T> {
    dbid: number;
    body: T;
    loadFromDb(...args: any): void;
}