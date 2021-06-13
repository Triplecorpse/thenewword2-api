import * as request from 'request';
import * as dotenv from 'dotenv';
import {CustomError} from "../models/CustomError";

dotenv.config();

const privateKey: string = process.env.RECAPTCHA_SECRET as string;

export interface IRecaptchaResponse {
    success: boolean,
    challenge_ts: string,
    hostname: string,
    score: number,
    action: string
}

export function validateRecaptcha(key: string): Promise<IRecaptchaResponse> {
    const captchaRequestOpts = {
        uri: `https://www.google.com/recaptcha/api/siteverify?secret=${privateKey}&response=${key}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return new Promise<IRecaptchaResponse>((resolve, reject) => {
        request.post(captchaRequestOpts, (error: any, response: any) => {
            if (error) {
                reject(new CustomError('RECAPTCHA_ERROR', error));
                return;
            }

            try {
                response = JSON.parse(response.body);
            } catch (error) {
                reject(new CustomError('RECAPTCHA_ERROR', error));
                return;
            }

            if (!response.success) {
                reject(new CustomError('RECAPTCHA_ERROR', response));
                return;
            }

            resolve(response);
        });
    });
}
