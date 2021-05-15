export interface IUserDb {
    id: number;
    login: string;
    password: string;
    email: string;
    native_language: number;
    learning_languages: number[];
}
