import * as express from 'express';
import {Request, Response} from 'express';
import {Wordset} from "../models/Wordset";
import {User} from "../models/User";
import {CustomError} from "../models/CustomError";

export const wordsetRouter = express.Router();

wordsetRouter.post('/add', async (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    if (req.body.id) {
        res.status(400).json({type: 'ID_IN_EDIT'});
    }

    try {
        const wordset = new Wordset(req.body);
        wordset.user = req.user as User;
        await wordset.save();
        res.status(200).json({success: true});
    } catch (error) {
        res.status(400).json(error);
    }
});

wordsetRouter.put('/edit', (req: Request, res: Response) => {});

wordsetRouter.get('/get', async (req: Request, res: Response) => {
    if (!req.user) {
        const error = new CustomError('USER_NOT_FOUND')
        res.status(401).json(error);
        throw error;
    }

    const smth = await Wordset.factoryLoadForUser(req.user?.dbid as number);
    res.json(smth.map(w => w.convertToDto()));
});

wordsetRouter.delete('/remove', (req: Request, res: Response) => {});
