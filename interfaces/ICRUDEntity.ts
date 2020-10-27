export interface ICRUDEntity<Dto, Db> {
    dbid?: number;
    replaceWith(entity: Dto): void;
    loadFromDB(...args: any): Promise<void>;
    convertToDto(): Dto;
    save(): Promise<void>;
}
