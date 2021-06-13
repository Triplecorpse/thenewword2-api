export class CustomError extends Error {
    data: any;

    constructor(name: ErrorName, data?: any, message?: string) {
        super(message);
        super.name = name;
        this.data = data;
    }
}

export type ErrorName = 'DATABASE_ERROR'
    | 'AUTHENTICATION_FAILED'
    | 'PASSWORD_CHECK_FAILED'
    | 'LOGIN_EXISTS'
    | 'EMAIL_EXISTS'
    | 'RECAPTCHA_ERROR'
    | 'USER_NOT_FOUND'
    | 'PASSWORD_CHECK_FAILED'
