import * as express from 'express';
import {Request, Response} from 'express';
import {queryDatabase} from '../services/db';
import {Word} from '../models/Word';
import {genders, languages, speechParts} from '../const/constData';
import {User} from '../models/User';
import {jwtDecode} from '../services/jwt';
import {IWordDto} from '../interfaces/dto/IWordDto';
import {CustomError} from '../models/CustomError';
import {IWordFilterData} from '../interfaces/IWordFilterData';
import {IWordCheckDto} from "../interfaces/dto/IWordCheckDto";
import * as Diff from 'diff';

export const wordRouter = express.Router();

wordRouter.get('/metadata', (req: Request, res: Response) => {
    res.json({
        speechParts: speechParts.map(sp => sp.convertToDto()),
        genders: genders.map(g => g.convertToDto()),
        languages: languages.map(l => l.convertToDto())
    });
});

wordRouter.post('/add', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND');
        }

        if (req.body.id) {
            throw new CustomError('ID_IN_EDIT');
        }

        const word = new Word(req.body, req.user);
        await word.save()

        if (req.body.word_set_id) {
            await word.saveToWordSet(req.body.word_set_id);
        }

        res.status(201).json(word.convertToDto());
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

wordRouter.get('/get', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND');
        }

        let words;

        const filterData: IWordFilterData = req.query;

        if (filterData?.word_set_id) {
            words = await Word.searchByWordSetId(filterData.word_set_id);
        } else {
            words = await Word.searchByUserId(req.user.dbid as number);
        }

        res.send(words.map(word => word.convertToDto()));
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

wordRouter.put('/edit', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND');
        }

        if (!req.body.id) {
            throw new CustomError('ID_NOT_EXISTS');
        }

        const word = await Word.fromDb(req.body.id);
        word.replaceWith(req.body);
        await word.save();
        res.status(200).json(word.convertToDto());
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

wordRouter.delete('/remove', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND');
        }

        if (!req.query.id) {
            throw new CustomError('ID_NOT_EXISTS');
        }

        await Word.unsubscribe(+req.query.id, req.user.dbid as number);

        res.json({success: true});
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

wordRouter.get('/exercise', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND');
        }
        const words = await Word.getWordsToExercise({
            wordset: req.query.wordset ? (req.query.wordset as string).split(',').map(ws => +ws) : [],
            limit: +(req.query.limit as string),
            language: +(req.query.language as string),
            threshold: +(req.query.threshold as string)
        }, req.user.dbid as number);

        res.json(words.map(word => word.convertToDto()));
    } catch (error) {
        if (error.name === 'USER_NOT_FOUND') {
            res.sendStatus(401);
        } else {
            res.status(500).json(error);
        }
    }
});

wordRouter.post('/exercise', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND')
        }

        if (!req.body.word) {
            throw new CustomError('WORD_CHECK_ERROR');
        }

        const yourWord = new Word(req.body.word);
        const dbWord = await Word.fromDb(req.body.word.id);
        const diff = Diff.diffChars(yourWord.word?.toLowerCase() as string, dbWord.word?.toLowerCase() as string);
        const response: IWordCheckDto = {
            right: yourWord.word?.toLowerCase() === dbWord.word?.toLowerCase(),
            you: yourWord.convertToDto(),
            diff,
            vault: dbWord.convertToDto(),
            status: req.body.skipped
                ? 'skipped'
                : yourWord.word?.toLowerCase() === dbWord.word?.toLowerCase()
                    ? 'right'
                    : 'wrong'
        };

        res.json(response);
    } catch (error) {
        if (error.name === 'USER_NOT_FOUND') {
            res.sendStatus(401);
        } else if (error.name === 'WORD_CHECK_ERROR') {
            res.status(400).json(error);
        } else {
            res.status(500).json(error);
        }
    }

    const decoded: IWordDto[] = await jwtDecode(req.body.encoded)
        .catch(error => {
            const err: any = {...error};
            if (!error?.type) {
                err.desc = error.message;
                err.type = 'JWT_ERROR';
            }
            res.status(500).json({err});
            throw error;
        });

    const wordFromUser: IWordDto = req.body.word;
    const wordFromVault: IWordDto = decoded.find(word => word.id === wordFromUser.id) as IWordDto;
    const isRight = wordsEqual(wordFromUser, wordFromVault);

    res.json({you: wordFromUser, vault: wordFromVault, right: isRight});
});

async function getWordsByQuery(query: string, params: any[], user: User): Promise<Word[]> {
    const wordIds: { id: number }[] = await queryDatabase<{ id: number }>(query, params)
        .catch(error => Promise.reject(error));

    const words = wordIds.map(() => new Word(undefined, user));
    const words$ = wordIds.map(({id}, index) => words[index].loadFromDB(id));

    await Promise.all(words$);

    return words;
}

function wordsEqual(word1: IWordDto, word2: IWordDto): boolean {
    return word1.word === word2.word;
}
