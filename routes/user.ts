import * as express from 'express';
import {Request, Response} from 'express';
import {IUserTokenPayload} from '../interfaces/IUserTokenPayload';
import {jwtSign} from '../services/jwt';
import {User} from '../models/User';
import {validateRecaptcha} from '../services/recaptcha';
import {CustomError} from '../models/CustomError';
import * as util from 'util';
import * as bcrypt from 'bcrypt';

export const userRouter = express.Router();

userRouter.post('/register', async (req: Request, res: Response) => {
    try {
        const user = new User(req.body);

        await validateRecaptcha(req.body.token);
        await user.save();
        res.status(201).json({});
    } catch (error) {
        if (error.code === '23505') {
            if (error.constraint === 'users_login_key') {
                res.status(401).json(new CustomError('LOGIN_EXISTS'));
            } else if (error.constraint === 'users_email_key') {
                res.status(401).json(new CustomError('EMAIL_EXISTS'));
            } else {
                res.status(401).json(error);
            }
        } else {
            res.status(400).json(error);
        }
    }
});

userRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const user = new User();

        await validateRecaptcha(req.body.token);
        await user.loadFromDB(req.body.login, req.body.password);

        const payload: IUserTokenPayload = {
            host: await util.promisify(bcrypt.hash)(req.hostname, 10) as string,
            IP: await util.promisify(bcrypt.hash)(req.ip, 10) as string,
            UA: await util.promisify(bcrypt.hash)(req.get('user-agent'), 10) as string,
            id: user.dbid as number,
            login: req.body.login
        };
        const webtoken = await jwtSign(payload);
        res.status(200).json({
            token: webtoken,
            login: user.login,
            native_languages: user.nativeLanguages?.map(({dbid}) => dbid),
            learning_languages: user.learningLanguages.map(lang => lang.dbid)
        });
    } catch (error) {
        res.status(400).json(error);
    }
});

userRouter.post('/modify', async (req: Request, res: Response) => {
    try {
        if (!req.user
            || req.user.login !== req.body.login
            || req.user.dbid !== req.body.dbid) {
            throw new CustomError('USER_UPDATE_ERROR');
        }

        const user = await User.fromDb(req.body.id);

        if (req.body.new_password) {
            const checkResult = await user.checkPassword(req.body.old_password);

            if (!checkResult) {
                throw new CustomError('USER_CHECK_PASSWORD_ERROR', {message: 'password mismatch'});
            }
        }

        user.replaceWith({
            ...req.body,
            password: req.body.new_password
        });

        await user.save();

        const payload: IUserTokenPayload = {
            host: await util.promisify(bcrypt.hash)(req.hostname, 10) as string,
            IP: await util.promisify(bcrypt.hash)(req.ip, 10) as string,
            UA: await util.promisify(bcrypt.hash)(req.get('user-agent'), 10) as string,
            id: user.dbid as number,
            login: req.body.login
        };
        const webtoken = await jwtSign(payload);

        res.status(200).json({
            token: webtoken
        });
    } catch (error) {
        if (error.name === 'USER_UPDATE_ERROR') {
            res.status(401).json(error);
        } else {
            res.status(500).json(error);
        }
    }
});

userRouter.post('/modify-keyboard-settings', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND');
        }
    } catch (error) {
        if (error.name === 'USER_NOT_FOUND') {
            res.status(401).json(error);
        } else {
            res.status(500).json(error)
        }
    }
});

userRouter.post('/validate-login', async (req: Request, res: Response) => {
    try {
        await validateRecaptcha(req.body.token);
    } catch (error) {
        res.status(500).json(error);
    }
});

userRouter.post('/validate-email', async (req: Request, res: Response) => {
    try {
        await validateRecaptcha(req.body.token);
    } catch (error) {
        res.status(500).json(error);
    }
});
