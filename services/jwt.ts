import * as dotenv from 'dotenv';
import * as util from 'util';
import * as jwt from 'jsonwebtoken'
import {Request} from 'express';
import {IUserTokenPayload} from '../interfaces/IUserTokenPayload';
import {User} from '../models/User';
import {Secret} from "jsonwebtoken";
import * as bcrypt from "bcrypt";

dotenv.config();

export async function jwtSign(payload: any): Promise<string> {
    return util.promisify(jwt.sign)(payload, process.env.WEB_TOKEN as string) as Promise<string>;
}

export function jwtVerify(token: string, host: string, ip: string, ua: string): Promise<User | null> {
    if (!token) {
        return Promise.resolve(null);
    }

    return new Promise<User | null>(async resolve => {
        const verificationResult: IUserTokenPayload =
            await util.promisify(jwt.verify)(token, process.env.WEB_TOKEN as string) as IUserTokenPayload;

        if (verificationResult) {
            const tokenMatchesUserParams =
                await util.promisify(bcrypt.compare)(host, verificationResult.host) &&
                await util.promisify(bcrypt.compare)(ip, verificationResult.IP) &&
                await util.promisify(bcrypt.compare)(ua, verificationResult.UA);

            if (tokenMatchesUserParams) {
                const user = new User();
                user.dbid = verificationResult.id;
                user.login = verificationResult.login;

                resolve(user);
            } else {
                resolve(null);
            }
        }
    });
}

export async function jwtDecode<T = any>(token: string): Promise<T> {
    if (!token) {
        return Promise.reject();
    }

    return await util.promisify(jwt.verify)(token, process.env.WEB_TOKEN as string) as any;
}
