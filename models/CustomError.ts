export class CustomError extends Error {
    constructor(name: ErrorName, message: string) {
        super(message);
        super.name = name;
    }
}

export type ErrorName = 'DATABASE_ERROR'
    | 'AUTHENTICATION_FAILED'
    | 'PASSWORD_CHECK_FAILED'
    | 'REGISTRATION_FAILED'
