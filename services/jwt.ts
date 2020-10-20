import * as dotenv from "dotenv";
import * as util from 'util';
import * as jwt from 'jsonwebtoken'
import {Request} from "express";
import {IUserTokenPayload} from "../interfaces/IUserTokenPayload";
import {queryDatabase} from "./db";
import * as bcrypt from "bcrypt";

dotenv.config();

export async function jwtSign(payload: any): Promise<string> {
    return util.promisify(jwt.sign)(payload, process.env.WEB_TOKEN as string) as Promise<string>;
}

export function jwtVerify(token: string, req: Request): Promise<boolean> {
    if (!token) {
        return Promise.resolve(false);
    }

    return new Promise<boolean>(async resolve => {
        const verificationResult: IUserTokenPayload = await util.promisify(jwt.verify)(token, process.env.WEB_TOKEN as string) as IUserTokenPayload;

        if (verificationResult) {
            const tokenMatchesUserParams =
                verificationResult.host === req.hostname &&
                verificationResult.IP === req.ip &&
                verificationResult.UA === req.get('user-agent') as string;
            const query = `SELECT DISTINCT ON(login) login, password FROM tnw2.users WHERE login = '${verificationResult.login}'`;
            const dbResult = await queryDatabase(query)
                .catch(error => {
                    resolve(false);
                    throw error;
                });

            if (dbResult.length) {
                const user = dbResult[0];
                const compareResult = await util.promisify(bcrypt.compare)(verificationResult.password, user.password)
                    .catch(() => {
                        resolve(false);
                    });

                if (user.login !== verificationResult.login || !tokenMatchesUserParams) {
                    resolve(false);
                }

                if (compareResult) {
                    resolve(true);
                }
            }
        } else {
            resolve(false);
        }
    });
}
