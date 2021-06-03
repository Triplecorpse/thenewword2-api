import {User} from "../models/User";
import {jwtDecode, jwtSign, jwtVerify} from "./jwt";

jest.mock('../models/User');

describe('Jwt module', () => {
    beforeEach(() => {
        process.env.WEB_TOKEN = 'test_web_token';
    });

    describe('Jwt sign method', () => {
        it('Jwt sign should encode values (e.g. User) correctly', async () => {
            const result = await jwtSign({whatever: 'please sing correctly'});
            expect(result).toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        });
    });

    describe('Jwt verify method', () => {
        const request: any = {
            ip: '192.168.0.1',
            hostname: 'generic-host',
            ua: 'generic user-agent',
            get() {
                return this.ua;
            }
        };
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImxvZ2luIiwicGFzc3dvcmQiOiJwYXNzd29yZCIsImhvc3QiOiJnZW5lcmljLWhvc3QiLCJJUCI6IjE5Mi4xNjguMC4xIiwiVUEiOiJnZW5lcmljIHVzZXItYWdlbnQiLCJpYXQiOjE2MjI3MjExODl9.bsOtpZmr6N-xCpkSlV2bYpY1z8r2kF_DvlG0bh-qI8k';

        it('Jwt verify should return valid User object if token and request data is correct', async () => {
            const result = await jwtVerify(token, request);
            expect(result).toBeInstanceOf(User);
        });

        it('Jwt verify should return null if token\'s and request\'s ip address don\'t match', async () => {
            request.ip = '192.168.0.11'
            const result = await jwtVerify(token, request);
            expect(result).toBeNull();
        });

        it('Jwt verify should return null if token\'s and request\'s host don\'t match', async () => {
            request.hostname = 'fake-host'
            const result = await jwtVerify(token, request);
            expect(result).toBeNull();
        });

        it('Jwt verify should return null if token\'s and request\'s user agent don\'t match', async () => {
            request.ua = 'fake user-agent'
            const result = await jwtVerify(token, request);
            expect(result).toBeNull();
        });
    });

    describe('Jwt decode method', () => {
        it('Jwt should decode random values correctly if token is correct', async () => {
            const result = await jwtDecode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3aGF0ZXZlciI6InBsZWFzZSBzaW5nIGNvcnJlY3RseSIsImlhdCI6MTYyMjY0Njk3Nn0.ynYwdVvui9AiFl6KRyn0WXW2JWOA6M0vns3o01L1lao');
            expect(result.whatever).toBe('please sing correctly');
        });
    });
});
