import * as dotenv from "dotenv";
import * as util from 'util';
import * as jwt from 'jsonwebtoken'

dotenv.config();

export async function jwtSign(payload: any) {
    return util.promisify(jwt.sign)(payload, process.env.WEB_TOKEN as string);
}