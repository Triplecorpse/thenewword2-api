export interface IUserTokenPayload {
    login: string;
    UA?: string;
    IP?: string;
    host?: string;
    id: number;
    iat?: number;
}
