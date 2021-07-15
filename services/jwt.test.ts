import {User} from '../models/User';
import {jwtSign, jwtDecodeAndVerifyUser} from './jwt';
import {IUserTokenPayload} from "../interfaces/IUserTokenPayload";
import * as util from "util";
import * as bcrypt from "bcrypt";

jest.mock('../models/User');

describe('Jwt module', () => {
    beforeEach(() => {
        process.env.WEB_TOKEN = 'test_web_token';
    });

    describe('Jwt sign method', () => {
        it('Jwt sign should encode values (e.g. User) correctly', async () => {
            const result = await jwtSign({whatever: 'please sing correctly'}, 'generic-host', '192.168.0.1', 'generic user-agent');
            expect(result).toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        });
    });

    describe('Jwt verify method', () => {
        let token = '';

        beforeEach(async () => {
            const payload: IUserTokenPayload = {
                id: 1,
                login: 'login'
            };
            token = await jwtSign(payload, 'generic-host', '192.168.0.1', 'generic user-agent');
        });

        it('Jwt verify should return valid User object if token and request data is correct', async () => {
            const result = await jwtDecodeAndVerifyUser(token, 'generic-host', '192.168.0.1', 'generic user-agent');
            expect(result).toBeInstanceOf(User);
        });

        it('Jwt verify should return null if token is not provided', async () => {
            const result = await jwtDecodeAndVerifyUser('', 'generic-host', '192.168.0.1', 'generic user-agent');
            expect(result).toBeNull();
        });

        it('Jwt verify should return null if token\'s and request\'s ip address don\'t match', async () => {
            const result = await jwtDecodeAndVerifyUser(token, 'generic-host', '192.168.0.11', 'generic user-agent');
            expect(result).toBeNull();
        });

        it('Jwt verify should return null if token\'s and request\'s host don\'t match', async () => {
            const result = await jwtDecodeAndVerifyUser(token, 'fake-host', '192.168.0.1', 'generic user-agent');
            expect(result).toBeNull();
        });

        it('Jwt verify should return null if token\'s and request\'s user agent don\'t match', async () => {
            const result = await jwtDecodeAndVerifyUser(token, 'generic-host', '192.168.0.1', 'fake user-agent');
            expect(result).toBeNull();
        });
    });
});
