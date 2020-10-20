import * as express from 'express';
import {Request, Response} from "express";
import * as bcrypt from "bcrypt";
import * as util from 'util';
import {queryDatabase} from "../services/db";
import {IUserTokenPayload} from "../interfaces/IUserTokenPayload";
import {jwtSign} from "../services/jwt";
import {IUserDto} from "../interfaces/IUserDto";
import {User} from "../models/User";

export const userRouter = express.Router();
const saltRounds = 10;

userRouter.post('/register', async (req: Request, res: Response) => {
    const user = new User(req.body);

    await user.save()
        .catch(error => {
            res.status(400).json(error);
            throw error;
        });

    res.sendStatus(201);
});

userRouter.post('/login', async (req: Request, res: Response) => {
    const user = new User();

    await user.load(req.body.login, req.body.password)
        .catch(error => {
            console.error(error);
            res.sendStatus(401);
        });

    delete user.passwordHash;

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
            res.sendStatus(500);
        });

    res.status(200).send(webtoken);
});

userRouter.post('/modify', async (req: Request, res: Response) => {
    const newUser: IUserDto = req.body;

    if (req.user) {
        const query = `UPDATE tnw2.users SET (email, password) = (${newUser.email}, ${newUser.password}) WHERE login = ${newUser.login} RETURNING *`;

        const result = await queryDatabase(query)
            .catch(error => {
                res.sendStatus(500);
                throw error;
            });

        if (result.length === 1 && result[0]) {
            const user: IUserDto = result[0];

            if (user.login !== newUser.login) {
                res.sendStatus(400);
            }

            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    } else {
        res.sendStatus(401);
    }
})
