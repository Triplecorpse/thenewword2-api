import {IUserDto} from "../interfaces/dto/IUserDto";
import {queryDatabase} from "../services/db";
import * as util from "util";
import * as bcrypt from "bcrypt";
import {ICRUDEntity} from "../interfaces/ICRUDEntity";
import {IUserDb} from "../interfaces/db/IUserDb";

const saltRounds = 10;

export class User implements ICRUDEntity<IUserDto, IUserDb>{
    dbid?: number;
    login: string = '';
    password?: string = '';
    email: string = '';
    passwordHash?: string = '';

    constructor(user?: IUserDto) {
        this.replaceWith(user);
    }

    async loadFromDB(loginOrEmail: string, password: string): Promise<void> {
        const query = 'SELECT DISTINCT ON(login) id, login, email, password FROM tnw2.users WHERE login = $1 OR email = $1';
        const dbResult = await queryDatabase(query, [loginOrEmail]);

        if (!dbResult.length) {
            throw new Error('USER_NOT_FOUND');
        }

        const user = dbResult[0];
        const compareResult = await util.promisify(bcrypt.compare)(password, user.password)
            .catch(error => {
                console.error(error);
                throw new Error('PASSWORD_CHECK_FAILED');
            });

        if (compareResult) {
            this.login = user.login;
            this.email = user.email;
            this.passwordHash = user.password;
            this.dbid = user.id;

            return;
        } else {
            throw new Error('PASSWORD_MISMATCH');
        }
    }

    async save(): Promise<void> {
        this.passwordHash = await util.promisify(bcrypt.hash)(this.password, saltRounds) as string;

        const user = await queryDatabase('INSERT INTO tnw2.users (login, password, email) VALUES($1, $2, $3) RETURNING *', [
            this.login,
            this.passwordHash,
            this.email
        ])
          .catch(error => {
              throw error;
          });

        this.dbid = user[0].id;

        return;
    }

    convertToDto(): IUserDto {
        return <IUserDto>{
            password: this.password,
            email: this.email,
            login: this.login
        };
    }

    replaceWith(entity?: IUserDto): void {
        this.login = entity?.login as string;
        this.password = entity?.password as string;
        this.email = entity?.email as string;
    }

    remove(): Promise<void> {
        if (!this.dbid) {
            throw new Error('NO_ID_PROVIDED');
        }

        const query = 'DELETE FROM tnw2.users WHERE id=$1';

        return queryDatabase(query, [this.dbid]).then();
    }
}
