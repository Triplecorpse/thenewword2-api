import * as dotenv from 'dotenv';
import * as util from 'util';
import * as jwt from 'jsonwebtoken'
import {Request} from 'express';
import {IUserTokenPayload} from '../interfaces/IUserTokenPayload';
import {User} from '../models/User';

dotenv.config();

export async function jwtSign(payload: any): Promise<string> {
    return util.promisify(jwt.sign)(payload, process.env.WEB_TOKEN as string) as Promise<string>;
}

export function jwtVerify(token: string, req: Request): Promise<User | null> {
    if (!token) {
        return Promise.resolve(null);
    }

    return new Promise<User | null>(async resolve => {
        const verificationResult: IUserTokenPayload = await util.promisify(jwt.verify)(token, process.env.WEB_TOKEN as string) as IUserTokenPayload;

        if (verificationResult) {
            const tokenMatchesUserParams =
                verificationResult.host === req.hostname &&
                verificationResult.IP === req.ip &&
                verificationResult.UA === req.get('user-agent') as string;

            if (tokenMatchesUserParams) {
                const user = new User();
                await user.loadFromDB(verificationResult.login, verificationResult.password);

                resolve(user);
            } else {
                resolve(null);
            }
        } else {
            resolve(null);
        }
    });
}

export async function jwtDecode<T = any>(token: string): Promise<T> {
    if (!token) {
        return Promise.reject();
    }

    return await util.promisify(jwt.verify)(token, process.env.WEB_TOKEN as string) as any;
}
