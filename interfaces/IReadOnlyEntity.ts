export interface IReadOnlyEntity<T = any, K = any> {
    dbid?: number;
    loadFromDb(...args: any): Promise<void>;
    convertToDto(): K
}
