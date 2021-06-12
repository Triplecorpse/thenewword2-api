export interface ICRUDEntity<Dto = any, Db = any> {
    dbid?: number;
    replaceWith(entity: Dto): void;
    loadFromDB(...args: any): Promise<void>;
    convertToDto(): Dto;
    save(): Promise<void>;
    remove(): Promise<void>;
}
