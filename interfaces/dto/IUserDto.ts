export interface IUserDto {
    id: number;
    login: string;
    password: string;
    new_password: string;
    email: string;
    native_languages: number[];
    learning_languages: number[];
    map_cyrillic: boolean;
}
