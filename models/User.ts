import {IUserDto} from "../interfaces/IUserDto";
import {queryDatabase} from "../services/db";
import * as util from "util";
import * as bcrypt from "bcrypt";
import {IUserTokenPayload} from "../interfaces/IUserTokenPayload";
import {jwtSign} from "../services/jwt";
import {Request} from "express";

const saltRounds = 10;

export class User {
    dbid?: number;
    login: string;
    password?: string;
    email: string;
    passwordHash?: string;
    isLoaded?: boolean;

    constructor(user?: IUserDto) {
        this.login = user?.login as string;
        this.password = user?.password as string;
        this.email = user?.email as string;
    }

    async load(loginOrEmail: string, password: string): Promise<User> {
        this.isLoaded = false;
        const query = 'SELECT DISTINCT ON(login) login, password FROM tnw2.users WHERE login = $1 OR email = $1';
        const dbResult = await queryDatabase(query, [loginOrEmail]);

        if (!dbResult.length) {
            throw new Error('USER_NOT_FOUND');
        }

        const user: IUserDto = dbResult[0];
        const compareResult = await util.promisify(bcrypt.compare)(password, user.password)
            .catch(error => {
                console.error(error);
                throw new Error('PASSWORD_CHECK_FAILED');
            });

        if (compareResult) {
            this.login = user.login;
            this.email = user.email;
            this.passwordHash = user.password;
            this.isLoaded = true;

            return this;
        } else {
            throw new Error('PASSWORD_MISMATCH');
        }
    }

    async save(): Promise<User> {
        this.passwordHash = await util.promisify(bcrypt.hash)(this.password, saltRounds) as string;

        const user = await queryDatabase('INSERT INTO tnw2.users (login, password, email) VALUES($1, $2, $3) RETURNING *', [
            this.login,
            this.passwordHash,
            this.email
        ]);

        this.dbid = user[0].id;

        delete this.password;

        return this;
    }
}