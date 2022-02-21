import * as express from 'express';
import {Request, Response} from 'express';
import {IWordSetFilterData, Wordset} from '../models/Wordset';
import {User} from '../models/User';
import {CustomError} from '../models/CustomError';

export const wordsetRouter = express.Router();

wordsetRouter.post('/add', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND');
        }

        if (req.body.id) {
            throw new CustomError('ID_IN_EDIT');
        }

        if (req.body.wordset_id) {
            await Wordset.subscribe(req.body.wordset_id, req.user!.dbid!);
            const wordset = await Wordset.fromDb(req.body.wordset_id);
            res.status(201).json(wordset.convertToDto());
            return;
        }

        const wordset = new Wordset(req.body);

        wordset.user = req.user as User;
        wordset.wordsCount = 0;

        await wordset.save();

        res.status(201).json(wordset.convertToDto());
    } catch (error) {
        if (error.name === 'USER_NOT_FOUND') {
            res.sendStatus(401);
        } else if (error.name === 'ID_IN_EDIT') {
            res.status(400).json(error);
        } else {
            res.status(500).json(error);
        }
    }
});

wordsetRouter.put('/edit', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND')
        }

        const wordset = await Wordset.patchName(req.body.name, req.body.id);

        res.json(wordset.convertToDto());
    } catch (error) {
        if (error.name === 'USER_NOT_FOUND') {
            res.status(401).json(error);
        } else {
            res.status(500).json(error);
        }
    }
});

wordsetRouter.get('/get', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND')
        }


        const filter: IWordSetFilterData = {
            ...req.query,
            user_subscribed_id: req.user.dbid!
        };

        const wordSets = await Wordset.factoryLoad(filter);
        const wordSetsDto = await Promise.all(wordSets.map(async wordset => {
            const isSubscribed = await wordset.isUserSubscribed(req.user!.dbid!);
            return {...wordset.convertToDto(), user_is_subscribed: isSubscribed}
        }));

        res.json(wordSetsDto);
    } catch (error) {
        if (error.name === 'USER_NOT_FOUND') {
            res.status(401).json(error);
        } else {
            res.status(500).json(error);
        }
    }
});

wordsetRouter.delete('/remove', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND')
        }

        if (!req.query.id) {
            throw new CustomError('ID_NOT_EXISTS');
        }

        await Wordset.unsubscribe(+req.query.id, req.user.dbid as number);

        res.send({success: true});
    } catch (error) {
        if (error.name === 'USER_NOT_FOUND') {
            res.sendStatus(401);
        } else if (error.name === 'ID_NOT_EXISTS') {
            res.status(400).json(error);
        } else {
            res.status(500).json(error);
        }
    }
});
