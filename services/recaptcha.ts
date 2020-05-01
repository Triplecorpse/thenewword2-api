import * as request from 'request';
import * as dotenv from "dotenv";
dotenv.config();

const privateKey: string = process.env.RECAPTCHA_SECRET as string;

export function validateRecaptcha(key: string): Promise<any> {
  const captchaRequestOpts = {
    uri: `https://www.google.com/recaptcha/api/siteverify?secret=${privateKey}&response=${key}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise<any>((resolve, reject) => {
    request.post(captchaRequestOpts, (g_error: any, g_response: any) => {
      if (g_error) {
        reject({m: 'Error in verifying recaptcha', e: g_error, r: g_response});
      }

      try {
        g_response = JSON.parse(g_response.body);
      } catch (e) {
        reject({m: 'Error in parsing recaptcha response', e: g_error, r: g_response, jsone: e});
      }

      if (!g_response.success) {
        reject({m: 'Recaptcha not verified', e: g_error, r: g_response});
      }

      resolve(g_response);
    });
  });
}
