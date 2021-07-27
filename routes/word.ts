import * as express from 'express';
import {Request, Response} from 'express';
import {queryDatabase} from '../services/db';
import {Word} from '../models/Word';
import {genders, keyMappers, languages, speechParts} from '../const/constData';
import {User} from '../models/User';
import {IWordDto} from '../interfaces/dto/IWordDto';
import {CustomError} from '../models/CustomError';
import {IWordFilterData} from '../interfaces/IWordFilterData';
import {IWordCheckDto} from "../interfaces/dto/IWordCheckDto";
import * as Diff from 'diff';
import {WordStat} from "../models/WordStat";

export const wordRouter = express.Router();

wordRouter.get('/metadata', (req: Request, res: Response) => {
    res.json({
        speechParts: speechParts.map(sp => sp.convertToDto()),
        genders: genders.map(g => g.convertToDto()),
        languages: languages.map(l => l.convertToDto()),
        symbols: keyMappers.map(k => k.convertToDto())
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
        await word.save();

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
        const currentExercise = await Word.getExerciseInProgressItems(req.user.dbid!);

        if (currentExercise.length) {
            res.json(currentExercise.map(word => word.convertToDto()))
            return;
        }

        const words = await Word.getWordsToExercise({
            wordset: req.query.wordset ? (req.query.wordset as string).split(',').map(ws => +ws) : [],
            limit: +(req.query.limit as string),
            language: +(req.query.language as string),
            threshold: +(req.query.threshold as string)
        }, req.user.dbid!);

        res.json(words.map(word => word.convertToDto()));
    } catch (error) {
        if (error.name === 'USER_NOT_FOUND') {
            res.sendStatus(401);
        } else {
            res.status(500).json(error);
        }
    }
});

wordRouter.post('/set-exercise', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND');
        }

        await Word.setExerciseInProgressItems(req.user.dbid!, req.body);

        res.json({success: true});
    } catch (error) {
        if (error.name === 'USER_NOT_FOUND') {
            res.sendStatus(401);
        } else {
            res.status(500).json(error);
        }
    }
});

wordRouter.post('/set-stat', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND')
        }

        if (!req.body.word) {
            throw new CustomError('WORD_CHECK_ERROR');
        }

        const fixingId = req.body.statId;
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
        let wordStat: WordStat;

        await Word.removeExerciseInProgressItem(req.user.dbid!, dbWord.dbid!);

        if (fixingId) {
            wordStat = await WordStat.fromDb(fixingId);
        } else {
            wordStat = new WordStat({
                id: 0,
                status: response.status,
                word_id: dbWord.dbid!,
                user_id: req.user.dbid!,
                timestamp_created: (new Date()).toISOString()
            });
        }

        wordStat.status = response.status;

        await wordStat.save();

        response.stat_id = wordStat.id;

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
});

wordRouter.post('/find', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new CustomError('USER_NOT_FOUND');
        }

        const {word, foreign_language, native_language} = req.body;
        const words = await Word.getByUserInput(word, foreign_language, native_language);

        res.send(words.map(word => word.convertToDto()));
    } catch (error) {
        if (error.name === 'USER_NOT_FOUND') {
            res.status(401).json(error);
        } else {
            res.status(500).json(error);
        }
    }
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
