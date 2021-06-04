import * as request from 'request';
import * as dotenv from 'dotenv';

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
        request.post(captchaRequestOpts, (g_error: any, g_response: any) => {
            if (g_error) {
                reject({type: 'RECAPTCHA_ERROR', error: g_error});
                return;
            }

            try {
                g_response = JSON.parse(g_response.body);
            } catch (e) {
                reject({type: 'RECAPTCHA_ERROR', error: e});
                return;
            }

            if (!g_response.success) {
                reject({type: 'RECAPTCHA_ERROR', error: g_response});
                return;
            }

            resolve(g_response);
        });
    });
}
