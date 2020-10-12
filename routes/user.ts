import * as express from 'express';
import {Request, Response} from "express";

export const userRouter = express.Router();

userRouter.post('/register', (req: Request, res: Response) => {
    const {login, email, password} = req.body;

    console.log(req.body);

    res.send();
});