import {IUserDto} from '../interfaces/dto/IUserDto';
import {queryDatabase} from '../services/db';
import * as util from 'util';
import * as bcrypt from 'bcrypt';
import {ICRUDEntity} from '../interfaces/ICRUDEntity';
import {Language} from './Language';
import {languages} from '../const/constData';
import {CustomError} from "./CustomError";

const saltRounds = 10;

export class User implements ICRUDEntity<IUserDto> {
    dbid?: number;
    login: string = '';
    password?: string = '';
    email: string = '';
    passwordHash?: string = '';
    nativeLanguage?: Language;
    learningLanguages: Language[] = [];

    constructor(user?: IUserDto) {
        this.replaceWith(user);
    }

    async loadFromDB(loginOrEmail: string, password: string): Promise<void> {
        const query = 'SELECT tnw2.users.id, tnw2.users.login, tnw2.users.email, tnw2.users.password, tnw2.users.native_language, tnw2.relation_users_learning_language.language_id AS learning_languages_ids FROM tnw2.users LEFT JOIN tnw2.relation_users_learning_language ON tnw2.relation_users_learning_language.user_id = tnw2.users.id WHERE login = $1;';
        const dbResult = await queryDatabase(query, [loginOrEmail]);

        if (!dbResult.length) {
            throw new CustomError('USER_NOT_FOUND');
        }


        const user = dbResult[0];
        const compareResult = await util.promisify(bcrypt.compare)(password, user.password);
        const isRestoringPassword = password === 'restore' && user.password === 'to_restore';
        const learningLanguages = dbResult.map(result => result.learning_languages_ids);

        if (!compareResult && !isRestoringPassword) {
            throw new CustomError('PASSWORD_CHECK_FAILED');
        } else {
            this.login = user.login;
            this.email = user.email;
            this.passwordHash = user.password;
            this.dbid = user.id;
            this.nativeLanguage = languages.find(lang => lang.dbid === user.native_language)
            this.learningLanguages = languages.filter(lang => learningLanguages.includes(lang.dbid))
        }
    }

    async save(): Promise<void> {
        if (this.password) {
            this.passwordHash = await util.promisify(bcrypt.hash)(this.password, saltRounds) as string;
        }

        if (!this.passwordHash) {
            throw new CustomError('NO_PASSWORD_PROVIDED');
        }

        if (this.dbid) {
            try {
                await queryDatabase('UPDATE tnw2.users SET (password, email, last_modified_at) = ($1, $2, (NOW() AT TIME ZONE \'utc\')) WHERE id = $3 RETURNING *', [
                    this.passwordHash,
                    this.email,
                    this.dbid
                ]);

                // TODO: Optimize updating learning languages
                await queryDatabase('DELETE FROM tnw2.relation_users_learning_language WHERE user_id = $1', [
                    this.dbid
                ]);
            } catch (error) {
                throw new CustomError('GENERIC_DB_ERROR', error);
            }
        } else {
            try {
                const user = await queryDatabase('INSERT INTO tnw2.users (login, password, email, native_language) VALUES($1, $2, $3, $4) RETURNING *', [
                    this.login,
                    this.passwordHash,
                    this.email,
                    this.nativeLanguage?.dbid
                ]);

                this.dbid = user[0].id;
            } catch (error) {
                if (error.code === '23505') {
                    if (error.constraint === 'users_login_key') {
                        throw new CustomError('LOGIN_EXISTS');
                    } else if (error.constraint === 'users_email_key') {
                        throw new CustomError('EMAIL_EXISTS');
                    } else {
                        throw new CustomError('GENERIC_DB_ERROR', error);
                    }
                }
            }
        }

        if (this.learningLanguages.length) {
            try {
                const queryPart =
                    this.learningLanguages.map((lang, index) => `($1, $${index + 2})`).join(', ');

                await queryDatabase(`INSERT INTO tnw2.relation_users_learning_language (user_id, language_id) VALUES ${queryPart} RETURNING *`, [
                    this.dbid,
                    ...this.learningLanguages.map(lang => lang.dbid)
                ]);
            } catch (error) {
                throw new CustomError('GENERIC_DB_ERROR', error);
            }
        }
    }

    convertToDto(): IUserDto {
        return {
            password: this.password,
            email: this.email,
            login: this.login,
            native_language: this.nativeLanguage?.dbid,
            learning_languages: this.learningLanguages?.map(ll => ll.dbid)
        } as IUserDto;
    }

    replaceWith(entity?: IUserDto): void {
        this.login = entity?.login as string;
        this.password = entity?.password as string;
        this.email = entity?.email as string;
        this.nativeLanguage = languages.find(l => l.dbid === entity?.native_language);
        this.learningLanguages = languages.filter(l => entity?.learning_languages?.includes(l.dbid));
    }

    async remove(): Promise<void> {
        if (!this.dbid) {
            throw new CustomError('NO_ID_PROVIDED');
        }

        try {
            const query = 'DELETE FROM tnw2.users WHERE id=$1';

            return await queryDatabase(query, [this.dbid]).then();
        } catch (error) {
            throw new CustomError('GENERIC_DB_ERROR', error);
        }
    }

    static async fromDb(id: number): Promise<User> {
        try {
            const result = await queryDatabase('SELECT * FROM tnw2.users WHERE id=$1', [id]);
            const learningLanguagesIdsResult = await queryDatabase('SELECT language_id as id FROM tnw2.relation_users_learning_language WHERE user_id=$1', [id]);
            const learningLanguages = await Promise.all(learningLanguagesIdsResult.map(({id}) => Language.fromDb(id)));
            const user = new User();

            user.dbid = result[0].id;
            user.login = result[0].login;
            user.passwordHash = result[0].password;
            user.email = result[0].email;
            user.nativeLanguage = await Language.fromDb(result[0].native_language);
            user.learningLanguages = learningLanguages;

            return user;
        } catch (error) {
            throw new CustomError('GENERIC_DB_ERROR', error);
        }
    };
}
