import * as express from 'express';
import {Request, Response} from 'express';
import {queryDatabase} from '../services/db';
import {IUserTokenPayload} from '../interfaces/IUserTokenPayload';
import {jwtSign} from '../services/jwt';
import {IUserDto} from '../interfaces/dto/IUserDto';
import {User} from '../models/User';

export const userRouter = express.Router();

userRouter.post('/register', async (req: Request, res: Response) => {
    const user = new User(req.body);

    await user.save()
        .catch(error => {
            res.status(400).json(error);
            throw error;
        });

    res.status(201).json({});
});

userRouter.post('/login', async (req: Request, res: Response) => {
    const user = new User();

    await user.loadFromDB(req.body.login, req.body.password)
        .catch(error => {
            console.error(error);
            res.sendStatus(401);
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
