import * as striptags from "striptags";
import * as crypto from "crypto";
import * as dotenv from "dotenv";
import {gender, speechParts} from "../const/wordTypes";
dotenv.config();

export function secureHtmlString(input: string): string {
  return striptags(input);
}

export function secureHtmlStringArray(input: string[]): string[] {
  return input.map(i => striptags(i));
}

export function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

export function validateSpeechPart(input: string): boolean {
  return speechParts.includes(input);
}

export function validateGender(input: string): boolean {
  return gender.includes(input);
}
