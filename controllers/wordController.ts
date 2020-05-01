import {Request, Response} from 'express';
import {ClassMiddleware, Controller, Get, Middleware} from '@overnightjs/core';
import {CORS} from "../services/CORS";
import {countries, languagesAll} from "countries-list";
import {JwtManager} from "@overnightjs/jwt";
import { getLanguages } from '../services/language.service';
import {Word} from "../models/word";

@Controller('data')
@ClassMiddleware(CORS)
export class WordController {
  @Get('word/:uniqueId')
  @Middleware(JwtManager.middleware)
  private async getWord(req: Request, res: Response) {
    const uniqueId = req.params.uniqueId;

    const word = await Word.findOne({uniqueId});

    res.json(getLanguages());
  }
}
