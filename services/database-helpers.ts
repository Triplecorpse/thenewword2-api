import * as striptags from "striptags";
import * as crypto from "crypto";
import {IUser} from "../interfaces/IUser";
import * as dotenv from "dotenv";
dotenv.config();

export function secureHtmlString(input: string): string {
  return striptags(input);
}

export function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

export function isPasswordCorrect(user: IUser, password: string): boolean {
  const hashed = crypto.createHash('md5').update(password).digest('hex');

  return hashed === user.password;
}
