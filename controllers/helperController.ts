import {Request, Response} from 'express';
import {ClassMiddleware, Controller, Get, Middleware} from '@overnightjs/core';
import {CORS} from "../services/CORS";
import {countries, languagesAll} from "countries-list";
import {JwtManager} from "@overnightjs/jwt";
import { getLanguages } from '../services/language.service';

@Controller('data')
@ClassMiddleware(CORS)
export class HelperController {
  @Get('countries')
  // @Middleware(JwtManager.middleware)
  private getCountries(req: Request, res: Response) {
    res.json(countries);
  }

  @Get('languages')
  // @Middleware(JwtManager.middleware)
  private getLanguages(req: Request, res: Response) {

    res.json(getLanguages());
  }
}
