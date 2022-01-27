import * as express from 'express';
import {Request, Response} from 'express';
import {IUserTokenPayload} from '../interfaces/IUserTokenPayload';
import {jwtSign} from '../services/jwt';
import {User} from '../models/User';
import {validateRecaptcha} from '../services/recaptcha';
import {CustomError} from '../models/CustomError';

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

        const refresh = await user.compareRefreshToken('');

        const payload: IUserTokenPayload = {
            id: user.dbid as number,
            login: req.body.login
        };
        const webtoken = await jwtSign(payload, req.hostname, req.ip, req.get('user-agent')!);
        res.status(200).json({
            refresh: refresh.newToken,
            id: user.dbid,
            token: webtoken,
            login: user.login,
            native_languages: user.nativeLanguages?.map(({dbid}) => dbid),
            learning_languages: user.learningLanguages.map(lang => lang.dbid)
        });
    } catch (error) {
        res.status(400).json(error);
    }
});

userRouter.post('/refresh', async (req: Request, res: Response) => {
    try {
        if (!req.body.user_id) {
            throw new CustomError('REFRESH_TOKEN_USER_ID_ERROR');
        }

        const user = await User.fromDb(req.body.user_id);
        const refresh = await user.compareRefreshToken(req.body.refresh);

        if (!refresh) {
            throw new CustomError('REFRESH_TOKEN_COMPARE_ERROR');
        }

        const payload: IUserTokenPayload = {
            id: user.dbid as number,
            login: user.login
        };
        const token = await jwtSign(payload, req.hostname, req.ip, req.get('user-agent')!);

        res.json({refresh: refresh.newToken, token})
    } catch (error) {
        res.status(500).json(error);
    }
});

userRouter.post('/modify', async (req: Request, res: Response) => {
    try {
        if (!req.user
            || req.user.dbid !== req.body.id) {
            throw new CustomError('USER_UPDATE_ERROR', {
                message: 'Didn\'t pass route checks',
                reqUser: req.user,
                reqBody: req.body
            });
        }

        const user = await User.fromDb(req.body.id);

        if (req.body.password) {
            const checkResult = await user.checkPassword(req.body.password);

            if (!checkResult) {
                throw new CustomError('USER_CHECK_PASSWORD_ERROR', {message: 'password mismatch'});
            }
        }

        if ((req.body.new_password || req.body.email) && !req.body.password) {
            throw new CustomError('USER_SECURITY_CHECK_ERROR', {message: 'Password should be provided on security settings change'})
        }

        user.replaceWith({
            ...req.body,
            password: req.body.new_password
        });

        await user.save();

        const payload: IUserTokenPayload = {
            id: user.dbid as number,
            login: req.body.login
        };
        const webtoken = await jwtSign(payload, req.hostname, req.ip, req.get('user-agent')!);

        delete user.email;
        delete user.password;

        res.status(200).json({
            ...user.convertToDto(),
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

        res.json({...req.body});
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

userRouter.get('/statistics', async (req: Request, res: Response) => {
    try {
        const user = await User.fromDb(req.user!.dbid!);
        res.json(await user.getStatistics());
    } catch (error) {
        res.status(500).json(error);
    }
});
