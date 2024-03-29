import {IUserDto} from '../interfaces/dto/IUserDto';
import {queryDatabase, Transaction} from '../services/db';
import * as util from 'util';
import * as bcrypt from 'bcrypt';
import {ICRUDEntity} from '../interfaces/ICRUDEntity';
import {Language} from './Language';
import {languages} from '../const/constData';
import {CustomError} from './CustomError';
import {generateRefreshToken} from '../services/jwt';
import {IDashboardDto} from '../interfaces/dto/IDashboardDto';

const saltRounds = 10;

export class User implements ICRUDEntity<IUserDto> {
    dbid?: number;
    login: string = '';
    password?: string = '';
    email?: string = '';
    passwordHash?: string = '';
    nativeLanguages: Language[] = [];
    learningLanguages: Language[] = [];
    mapCyrillic: boolean = false;

    constructor(user?: IUserDto) {
        this.replaceWith(user);
    }

    async loadFromDB(loginOrEmail: string, password: string): Promise<void> {
        try {
            const dbResult = await queryDatabase('SELECT tnw2.users.id, tnw2.users.login, tnw2.users.email, tnw2.users.password, tnw2.users.map_cyrillic, tnw2.relation_users_learning_language.language_id AS learning_languages_ids, tnw2.relation_users_native_language.language_id AS native_languages_ids FROM tnw2.users LEFT JOIN tnw2.relation_users_learning_language ON tnw2.relation_users_learning_language.user_id = tnw2.users.id LEFT JOIN tnw2.relation_users_native_language ON tnw2.relation_users_native_language.user_id = tnw2.users.id WHERE login = $1 OR email = $1', [loginOrEmail]);

            if (!dbResult.length) {
                throw new CustomError('USER_NOT_FOUND');
            }

            const user = dbResult[0];
            const compareResult = await util.promisify(bcrypt.compare)(password, user.password);
            const isRestoringPassword = password === 'restore' && user.password === 'to_restore';
            const learningLanguages = dbResult.map(result => result.learning_languages_ids);
            const nativeLanguages = dbResult.map(result => result.native_languages_ids);

            if (!compareResult && !isRestoringPassword) {
                throw new CustomError('PASSWORD_CHECK_FAILED');
            } else {
                this.login = user.login;
                this.email = user.email;
                this.passwordHash = user.password;
                this.dbid = user.id;
                this.mapCyrillic = user.map_cyrillic;
                this.nativeLanguages = languages.filter(lang => nativeLanguages.includes(lang.dbid));
                this.learningLanguages = languages.filter(lang => learningLanguages.includes(lang.dbid));
            }
        } catch (error) {
            if (['USER_NOT_FOUND', 'PASSWORD_CHECK_FAILED'].includes(error.name)) {
                throw error;
            }

            throw new CustomError('USER_LOAD_ERROR', error);
        }
    }

    async checkPassword(password: string): Promise<boolean> {
        let queryPart = '';
        let queryPartParams = [];

        if (this.dbid) {
            queryPart = 'id=$1';
            queryPartParams = [this.dbid];
        } else if (this.login) {
            queryPart = 'login=$1';
            queryPartParams = [this.login];
        } else if (this.email) {
            queryPart = 'email=$1'
            queryPartParams = [this.email];
        } else {
            throw new CustomError('USER_CHECK_PASSWORD_ERROR', {message: 'id, login or email is required'})
        }

        const result = await queryDatabase('SELECT password FROM tnw2.users WHERE ' + queryPart, queryPartParams as string[]);

        return await bcrypt.compare(password, result[0]?.password);
    }

    async save(): Promise<void> {
        if (this.password) {
            this.passwordHash = await util.promisify(bcrypt.hash)(this.password, saltRounds) as string;
        }

        if (!this.passwordHash) {
            throw new CustomError('NO_PASSWORD_PROVIDED');
        }

        const transaction = new Transaction();

        await transaction.BEGIN();

        if (this.dbid) {
            try {
                await transaction.QUERY_LINE('UPDATE tnw2.users SET (password, email, last_modified_at, map_cyrillic) = ($1, $2, (NOW() AT TIME ZONE \'utc\'), $4) WHERE id = $3 RETURNING *', [
                    this.passwordHash,
                    this.email,
                    this.dbid,
                    this.mapCyrillic
                ]);

                // TODO: Optimize updating learning languages
                await transaction.QUERY_LINE('DELETE FROM tnw2.relation_users_learning_language WHERE user_id = $1', [
                    this.dbid
                ]);

                await transaction.QUERY_LINE('DELETE FROM tnw2.relation_users_native_language WHERE user_id = $1', [
                    this.dbid
                ]);
            } catch (error) {
                await transaction.ROLLBACK();
                throw new CustomError('USER_UPDATE_ERROR', error);
            }
        } else {
            try {
                const refreshToken = await util.promisify(bcrypt.hash)(generateRefreshToken(), saltRounds) as string;
                const user = await transaction.QUERY_LINE('INSERT INTO tnw2.users (login, password, email, active_refresh_token, map_cyrillic) VALUES($1, $2, $3, $4, $5) RETURNING *', [
                    this.login,
                    this.passwordHash,
                    this.email,
                    refreshToken,
                    this.mapCyrillic
                ]);

                this.dbid = user[0].id;
            } catch (error) {
                await transaction.ROLLBACK();
                if (error.code === '23505') {
                    if (error.constraint === 'users_login_key') {
                        throw new CustomError('LOGIN_EXISTS');
                    } else if (error.constraint === 'users_email_key') {
                        throw new CustomError('EMAIL_EXISTS');
                    } else {
                        throw new CustomError('USER_SAVE_ERROR', error);
                    }
                } else {
                    throw new CustomError('USER_SAVE_ERROR', error);
                }
            }
        }

        if (this.learningLanguages.length) {
            try {
                const queryPart =
                    this.learningLanguages.map((lang, index) => `($1, $${index + 2})`).join(', ');

                await transaction.QUERY_LINE(`INSERT INTO tnw2.relation_users_learning_language (user_id, language_id) VALUES ${queryPart} RETURNING *`, [
                    this.dbid,
                    ...this.learningLanguages.map(lang => lang.dbid)
                ]);
            } catch (error) {
                await transaction.ROLLBACK();
                throw new CustomError('LEARNING_LANGUAGES_SAVE_ERROR', error);
            }
        }

        if (this.nativeLanguages.length) {
            try {
                const queryPart =
                    this.nativeLanguages.map((lang, index) => `($1, $${index + 2})`).join(', ');

                await transaction.QUERY_LINE(`INSERT INTO tnw2.relation_users_native_language (user_id, language_id) VALUES ${queryPart} RETURNING *`, [
                    this.dbid,
                    ...this.nativeLanguages.map(lang => lang.dbid)
                ]);
            } catch (error) {
                await transaction.ROLLBACK();
                throw new CustomError('NATIVE_LANGUAGES_SAVE_ERROR', error);
            }
        }

        await transaction.COMMIT();
    }

    convertToDto(): IUserDto {
        return {
            id: this.dbid,
            password: this.password,
            email: this.email,
            login: this.login,
            native_languages: this.nativeLanguages?.map(ll => ll.dbid),
            learning_languages: this.learningLanguages?.map(ll => ll.dbid),
            map_cyrillic: this.mapCyrillic
        } as IUserDto;
    }

    replaceWith(entity?: IUserDto): void {
        this.login = entity?.login as string || this.login;
        this.password = entity?.password as string || this.password;
        this.email = entity?.email as string || this.email;
        this.nativeLanguages = entity?.native_languages
            ? languages.filter(l => entity?.native_languages?.includes(l.dbid))
            : this.nativeLanguages;
        this.learningLanguages = entity?.learning_languages
            ? languages.filter(l => entity?.learning_languages?.includes(l.dbid))
            : this.learningLanguages;
        this.mapCyrillic = entity?.map_cyrillic || this.mapCyrillic;
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

    async compareRefreshToken(refreshToken: string): Promise<{ compareResult: boolean, newToken: string }> {
        try {
            const result = await queryDatabase('SELECT active_refresh_token from tnw2.users WHERE id=$1', [this.dbid]);
            const token = result[0]?.active_refresh_token;
            const newToken = generateRefreshToken();
            const newTokenHashed = await util.promisify(bcrypt.hash)(newToken, saltRounds) as string;
            await queryDatabase('UPDATE tnw2.users SET active_refresh_token=$1 WHERE id=$2', [newTokenHashed, this.dbid]);
            const compareResult = await util.promisify(bcrypt.compare)(refreshToken, token);

            return {compareResult, newToken};
        } catch (error) {
            throw new CustomError('REFRESH_TOKEN_COMPARE_ERROR', error);
        }
    }

    async getStatistics(): Promise<IDashboardDto> {
        const dateCreatedResult = await queryDatabase('SELECT created_at FROM tnw2.users WHERE id=$1', [this.dbid]);
        const wordsRightResult = await queryDatabase('SELECT count(*) FROM tnw2.word_statistics WHERE user_id=$1 AND status=\'right\'', [this.dbid]);
        const wordsWrongResult = await queryDatabase('SELECT count(*) FROM tnw2.word_statistics WHERE user_id=$1 AND status=\'wrong\'', [this.dbid]);
        const wordsSkippedResult = await queryDatabase('SELECT count(*) FROM tnw2.word_statistics WHERE user_id=$1 AND status=\'skipped\'', [this.dbid]);
        const myWordsetsResult = await queryDatabase('SELECT count(*) FROM tnw2.relation_users_word_sets WHERE user_id=$1', [this.dbid]);
        const iSubscribedToResult = await queryDatabase('SELECT count(*) FROM tnw2.relation_users_word_sets WHERE user_id=$1', [this.dbid]);
        const otherSubscribedToMineResult = await queryDatabase('SELECT count(*) FROM tnw2.word_sets LEFT JOIN tnw2.relation_users_word_sets ON tnw2.word_sets.id=tnw2.relation_users_word_sets.word_set_id WHERE tnw2.relation_users_word_sets.user_id!=$1', [this.dbid]);

        const words80Result1 = await queryDatabase('SELECT word_id, status FROM tnw2.word_statistics WHERE user_id=$1', [this.dbid]);
        const wordStat: { [key: number]: string[] } = {};
        let words80 = 0;
        words80Result1.forEach(wordResult => {
            if (wordStat[wordResult.word_id]) {
                wordStat[wordResult.word_id].push(wordResult.status);
            } else {
                wordStat[wordResult.word_id] = [wordResult.status];
            }
        });

        Object.keys(wordStat).forEach(key => {
            const value = wordStat[+key];
            const rightTimes = value.filter(v => v === 'right').length;
            const wrongOrSkippedTimes = value.filter(v => v === ('wrong' || 'skipped')).length;

            if (rightTimes / (rightTimes + wrongOrSkippedTimes) >= .8 && value.length >= 10) {
                words80++;
            }
        });

        return {
            account_created: dateCreatedResult[0]?.created_at,
            exercises_passed: +wordsRightResult[0]?.count + +wordsWrongResult[0]?.count + +wordsSkippedResult[0]?.count,
            my_learned_languages: this.learningLanguages.length,
            my_native_languages: this.nativeLanguages.length,
            my_subscribed_wordsets: +iSubscribedToResult[0]?.count,
            other_subscribed_wordsets: +otherSubscribedToMineResult[0]?.count,
            my_wordsets: +myWordsetsResult[0]?.count,
            words_right: +wordsRightResult[0]?.count,
            words_wrong: +wordsWrongResult[0]?.count,
            words_skipped: +wordsSkippedResult[0]?.count,
            words_80: words80
        };
    }

    static async fromDb(userId: number): Promise<User> {
        try {
            const result = await queryDatabase('SELECT * FROM tnw2.users WHERE id=$1', [userId]);
            const learningLanguagesIdsResult = await queryDatabase('SELECT language_id as id FROM tnw2.relation_users_learning_language WHERE user_id=$1', [userId]);
            const nativeLanguagesIdsResult = await queryDatabase('SELECT language_id as id FROM tnw2.relation_users_native_language WHERE user_id=$1', [userId]);
            const learningLanguages = await Promise.all(learningLanguagesIdsResult.map(({id}) => Language.fromDb(id)));
            const nativeLanguages = await Promise.all(nativeLanguagesIdsResult.map(({id}) => Language.fromDb(id)));
            const user = new User();

            user.dbid = result[0].id;
            user.login = result[0].login;
            user.passwordHash = result[0].password;
            user.email = result[0].email;
            user.mapCyrillic = result[0].map_cyrillic;
            user.nativeLanguages = nativeLanguages;
            user.learningLanguages = learningLanguages;

            return user;
        } catch (error) {
            throw new CustomError('GENERIC_DB_ERROR', error);
        }
    };

    static async byEmail(email: string): Promise<boolean> {
        try {
            const result = await queryDatabase('SELECT * from tnw2.users WHERE email=$1', [email]);

            return !!result[0];
        } catch (error) {
            throw new CustomError('USER_BY_EMAIL_ERROR', error);
        }
    }

    static async byLogin(login: string): Promise<boolean> {
        try {
            const result = await queryDatabase('SELECT * from tnw2.users WHERE login=$1', [login]);

            return !!result[0];
        } catch (error) {
            throw new CustomError('USER_BY_LOGIN_ERROR', error);
        }
    }
}
