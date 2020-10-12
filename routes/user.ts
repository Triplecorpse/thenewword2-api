import * as express from 'express';
import {Request, Response} from "express";
import * as bcrypt from "bcrypt";
import * as util from 'util';
import {queryDatabase} from "../services/db";
import {IUserTokenPayload} from "../interfaces/IUserTokenPayload";
import {jwtSign} from "../services/jwt";

export const userRouter = express.Router();
const saltRounds = 10;

userRouter.post('/register', async (req: Request, res: Response) => {
    const {login, email, password} = req.body;
    const hash = await util.promisify(bcrypt.hash)(password, saltRounds);
    const query = `INSERT INTO tnw2.users (login, password, email) VALUES('${login}', '${hash}', '${email}')`;

    await queryDatabase(query)
        .catch(error => {
            res.status(400).json(error);
            throw error;
        });

    res.sendStatus(201);
});

userRouter.post('/login', async (req: Request, res: Response) => {
    const {login, password} = req.body;
    const query = `SELECT DISTINCT ON(login) login, password FROM tnw2.users WHERE login = '${login}'`;

    const dbResult = await queryDatabase(query)
        .catch(error => {
            res.status(400).json(error);
            throw error;
        });

    if (dbResult.rowCount) {
        const user = dbResult.rows[0];

        const compareResult = await util.promisify(bcrypt.compare)(password, user.password)
            .catch(error => {
                res.status(400).json(error);
                throw error;
            });

        if (compareResult) {
            const payload: IUserTokenPayload = {
                host: req.hostname,
                IP: req.ip,
                password: user.password,
                UA: req.get('user-agent') as string,
                login
            }
            const webtoken = await jwtSign(payload);

            res.status(200).send(webtoken);
            return;
        }
    }

    res.sendStatus(401);
});
