import * as dotenv from 'dotenv';
import * as util from 'util';
import * as jwt from 'jsonwebtoken'
import {IUserTokenPayload} from '../interfaces/IUserTokenPayload';
import {User} from '../models/User';
import * as bcrypt from "bcrypt";
import {TokenExpiredError} from "jsonwebtoken";
import {CustomError} from "../models/CustomError";

dotenv.config();

export async function jwtSign(payload: any, host: string, ip: string, ua: string): Promise<string> {
    const data: IUserTokenPayload = {
        ...payload,
        host: await util.promisify(bcrypt.hash)(host, 10) as string,
        IP: await util.promisify(bcrypt.hash)(ip, 10) as string,
        UA: await util.promisify(bcrypt.hash)(ua, 10) as string,
    };

    return Promise.resolve(jwt.sign(data, process.env.WEB_TOKEN as string, {expiresIn: '15m'}));
}

export function jwtDecodeAndVerifyUser(token: string, host: string, ip: string, ua: string): Promise<User | null> {
    if (!token) {
        return Promise.resolve(null);
    }

    return new Promise<User | null>(async (resolve, reject) => {
        try {
            const verificationResult: IUserTokenPayload =
                await util.promisify(jwt.verify)(token, process.env.WEB_TOKEN as string) as IUserTokenPayload;

            if (verificationResult) {
                const tokenMatchesUserParams =
                    await util.promisify(bcrypt.compare)(host, verificationResult.host!) &&
                    await util.promisify(bcrypt.compare)(ip, verificationResult.IP!) &&
                    await util.promisify(bcrypt.compare)(ua, verificationResult.UA!);

                if (tokenMatchesUserParams) {
                    const user = new User();
                    user.dbid = verificationResult.id;
                    user.login = verificationResult.login;

                    resolve(user);
                } else {
                    resolve(null);
                }
            }

            resolve(null);
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                reject(new CustomError('JWT_EXPIRED_ERROR', error));
            }

            reject(new CustomError('JWT_ERROR', error));
        }
    });
}

export function generateRefreshToken(): string {
    const symbols = 'qwertyuiopasdfghjklzxcvbnm1234567890';
    let code = '';

    while (code.length < 32) {
        const index = (Math.random() * symbols.length - 1).toFixed(0);
        code += symbols[+index];
    }

    return code;
}
