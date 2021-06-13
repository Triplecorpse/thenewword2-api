import * as express from 'express';
import {Request, Response} from 'express';

export const wordsetRouter = express.Router();

wordsetRouter.post('/add', (req: Request, res: Response) => {
    if (!req.user) {
        res.sendStatus(401);
    }

    if (req.body.id) {
        res.status(400).json({type: 'ID_IN_EDIT'});
    }
});

wordsetRouter.put('/edit', (req: Request, res: Response) => {});

wordsetRouter.get('/get', (req: Request, res: Response) => {});

wordsetRouter.delete('/remove', (req: Request, res: Response) => {});
