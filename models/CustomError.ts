export class CustomError extends Error {
    data: any;

    constructor(name: ErrorName, data?: any) {
        super(data?.message);
        super.name = name;
        this.data = data;

        console.error(name, data);
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
    | 'GET_WORDS_BY_USER_INPUT_ERROR'
    | 'GET_WORDSETS_ERROR'
    | 'WORD_CHECK_ERROR'
    | 'WORD_STATISTIC_ERROR'
    | 'WORD_STATISTIC_LOAD_ERROR'
    | 'WORD_STATISTIC_SAVE_ERROR'
    | 'NATIVE_LANGUAGES_SAVE_ERROR'
    | 'LEARNING_LANGUAGES_SAVE_ERROR'
    | 'USER_SAVE_ERROR'
    | 'USER_LOAD_ERROR'
    | 'USER_UPDATE_ERROR'
    | 'USER_BY_EMAIL_ERROR'
    | 'USER_BY_LOGIN_ERROR'
    | 'USER_CHECK_PASSWORD_ERROR'
    | 'USER_SECURITY_CHECK_ERROR'
    | 'KEYMAPPER_LOAD_BY_LANGUAGE_ID'
    | 'REFRESH_TOKEN_COMPARE_ERROR'
    | 'EXERCISE_IN_PROGRESS_REMOVE_ERROR'
    | 'EXERCISE_IN_PROGRESS_GET_ERROR'
    | 'EXERCISE_IN_PROGRESS_SET_ERROR'
    | 'JWT_EXPIRED_ERROR'
    | 'JWT_ERROR'
