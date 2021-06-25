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
    | 'NO_PASSWORD_PROVIDED'
    | 'GENERIC_DB_ERROR'
    | 'NO_ID_PROVIDED'
    | 'SAVE_FAILED'
    | 'ID_NOT_EXISTS'
    | 'ID_IN_EDIT'
    | 'QUERY_ERROR'
    | 'GET_WORDS_ERROR'
    | 'GET_WORDSETS_ERROR'
    | 'WORD_CHECK_ERROR'
    | 'WORD_STATISTIC_ERROR'
