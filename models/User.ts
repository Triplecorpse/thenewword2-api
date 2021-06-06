import {IUserDto} from '../interfaces/dto/IUserDto';
import {queryDatabase} from '../services/db';
import * as util from 'util';
import * as bcrypt from 'bcrypt';
import {ICRUDEntity} from '../interfaces/ICRUDEntity';
import {IUserDb} from '../interfaces/db/IUserDb';
import {Language} from './Language';
import {languages} from '../const/constData';

const saltRounds = 10;

export class User implements ICRUDEntity<IUserDto, IUserDb> {
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
        const dbResult = await queryDatabase(query, [loginOrEmail])
            .catch(error => {
                throw error;
            });

        if (!dbResult.length) {
            throw {type: 'USER_NOT_FOUND'};
        }


        const user = dbResult[0];
        const compareResult = await util.promisify(bcrypt.compare)(password, user.password);
        const isRestoringPassword = password === 'restore' && user.password === 'to_restore';
        const learningLanguages = dbResult.map(result => result.learning_languages_ids);

        if (!compareResult && !isRestoringPassword) {
            throw {type: 'PASSWORD_CHECK_FAILED'};
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
            throw {type: 'NO_PASSWORD_PROVIDED'};
        }

        if (this.dbid) {
            await queryDatabase('UPDATE tnw2.users SET (password, email) = ($1, $2) WHERE id = $3 RETURNING *', [
                this.passwordHash,
                this.email,
                this.dbid
            ]);

            await queryDatabase('DELETE FROM tnw2.relation_users_learning_language WHERE user_id = $1', [
                this.dbid
            ]);
        } else {
            const user = await queryDatabase('INSERT INTO tnw2.users (login, password, email, native_language) VALUES($1, $2, $3, $4) RETURNING *', [
                this.login,
                this.passwordHash,
                this.email,
                this.nativeLanguage?.dbid
            ]);

            this.dbid = user[0].id;
        }

        if (this.learningLanguages.length) {
            const queryPart =
                this.learningLanguages.map((lang, index) => `($1, $${index + 2})`).join(', ');

            await queryDatabase(`INSERT INTO tnw2.relation_users_learning_language (user_id, language_id) VALUES ${queryPart} RETURNING *`, [
                this.dbid,
                ...this.learningLanguages.map(lang => lang.dbid)
            ]);
        }

        return;
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
            throw {type: 'NO_ID_PROVIDED'};
        }

        const query = 'DELETE FROM tnw2.users WHERE id=$1';

        return await queryDatabase(query, [this.dbid]).then();
    }
}
