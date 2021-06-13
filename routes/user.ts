import * as express from 'express';
import {Request, Response} from 'express';
import {IUserTokenPayload} from '../interfaces/IUserTokenPayload';
import {jwtSign} from '../services/jwt';
import {User} from '../models/User';
import {validateRecaptcha} from '../services/recaptcha';
import {CustomError} from '../models/CustomError';

export const userRouter = express.Router();

userRouter.post('/register', async (req: Request, res: Response) => {
    const user = new User(req.body);

    try {
        await validateRecaptcha(req.body.token);
        await user.save();
        res.status(201).json({});
    } catch (error) {
        if (error.code === '23505') {
            if (error.constraint === 'users_login_key') {
                res.status(400).json(new CustomError('LOGIN_EXISTS'));
            } else if (error.constraint === 'users_email_key') {
                res.status(400).json(new CustomError('EMAIL_EXISTS'));
            } else {
                res.status(400).json(error);
            }
        } else {
            res.status(400).json(error);
        }
    }
});

userRouter.post('/login', async (req: Request, res: Response) => {
    try {
        await validateRecaptcha(req.body.token);
        const user = new User();
        await user.loadFromDB(req.body.login, req.body.password);
        const payload: IUserTokenPayload = {
            host: req.hostname,
            IP: req.ip,
            password: req.body.password,
            UA: req.get('user-agent') as string,
            login: req.body.login
        };
        const webtoken = await jwtSign(payload);
        res.status(200).json({
            token: webtoken,
            login: user.login,
            native_language: user.nativeLanguage?.dbid,
            learning_languages: user.learningLanguages.map(lang => lang.dbid)
        });
    } catch (error) {
        res.status(400).json(error);
    }
    // await validateRecaptcha(req.body.token)
    //     .catch(() => {
    //         res.status(400).json({type: 'RECAPTCHA_ERROR'});
    //     });
    //
    // const user = new User();
    //
    // await user.loadFromDB(req.body.login, req.body.password)
    //     .catch(error => {
    //         console.error(error);
    //         res.sendStatus(401);
    //     });

    // const payload: IUserTokenPayload = {
    //     host: req.hostname,
    //     IP: req.ip,
    //     password: req.body.password,
    //     UA: req.get('user-agent') as string,
    //     login: req.body.login
    // }
    // const webtoken = await jwtSign(payload)
    //     .catch(error => {
    //         console.error(error);
    //         res.status(500).json(error);
    //         throw error;
    //     });
    //
    // res.status(200).json({
    //     token: webtoken,
    //     login: user.login,
    //     native_language: user.nativeLanguage?.dbid,
    //     learning_languages: user.learningLanguages.map(lang => lang.dbid)
    // });
});

userRouter.post('/modify', async (req: Request, res: Response) => {
    if (!req.user || req.user.login !== req.body.login || req.user.password !== req.body.password) {
        res.sendStatus(401);
        throw new Error('INVALID_USER');
    }

    const user = new User({
        email: req.user.email,
        ...req.body,
        password: req.body.new_password || req.body.password
    });

    user.dbid = req.user.dbid;
    user.login = req.user.login;
    user.nativeLanguage = req.user.nativeLanguage;

    await user.save()
        .catch(error => {
            res.status(400).json(error);
            throw error;
        });

    const payload: IUserTokenPayload = {
        host: req.hostname,
        IP: req.ip,
        password: req.body.password,
        UA: req.get('user-agent') as string,
        login: req.body.login
    }
    const webtoken = await jwtSign(payload)
        .catch(error => {
            console.error(error);
            res.status(500).json(error);
            throw error;
        });

    res.status(200).json({
        token: webtoken,
        login: user.login,
        native_language: user.nativeLanguage?.dbid,
        learning_languages: user.learningLanguages.map(lang => lang.dbid)
    });
})
