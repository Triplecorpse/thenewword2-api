import {Request, Response} from 'express';
import {ClassMiddleware, Controller, Middleware, Post, Put} from '@overnightjs/core';
import {Logger} from '@overnightjs/logger';
import {User} from "../models/user";
import {IUser} from "../interfaces/IUser";
import {BAD_CREDENTIALS, FORM_NOT_VALID, INTERNAL_SERVER_ERROR, NOT_IMPLEMENTED, RECAPTCHA_ERROR} from "../const/error";
import {Validators} from "../services/validators";
import {JwtManager} from "@overnightjs/jwt";
import {validateRecaptcha} from "../services/recaptcha";
import {hashPassword} from "../services/database-helpers";
import {CORS} from "../services/CORS";
import has = Reflect.has;

@Controller('user')
@ClassMiddleware(CORS)
export class UserController {
  @Put()
  @Middleware(JwtManager.middleware)
  private putUser(req: Request, res: Response) {
    Logger.Info(NOT_IMPLEMENTED + ':::: Put user');
    return res.status(501).json({
      error: new Error(NOT_IMPLEMENTED),
    });
  }

  @Post('register')
  private async registerUser(req: Request, res: Response) {
    const simpleInputFields = ['login', 'password'];
    const inputValid = Validators.object(req.body, simpleInputFields, input => Validators.simpleInput(input));
    const emailValid = Validators.email(req.body.email);

    if (!(inputValid && emailValid)) {
      return res.status(400).json({error: FORM_NOT_VALID});
    }

    await validateRecaptcha(req.body.token)
      .catch(err => {
        Logger.Err(err);
        res.status(400).json({error: RECAPTCHA_ERROR});
        throw new Error(RECAPTCHA_ERROR);
      });

    const user = {
      login: req.body.login,
      email: req.body.email,
      password: hashPassword(req.body.password)
    }

    await User.create(user).catch((err: any) => {
      Logger.Err(err);
      return res.status(500).json({error: INTERNAL_SERVER_ERROR})
    });

    return res.status(200).json({
      status: 'ok',
    });
  }

  @Post('login')
  private async loginUser(req: Request, res: Response) {
    const password = hashPassword(req.body.password);
    const user: IUser = (await User.findOne({login: req.body.login, password}) as any)

    await validateRecaptcha(req.body.token)
      .catch(err => {
        Logger.Err(err);
        res.status(400).json({error: RECAPTCHA_ERROR});
        throw new Error(RECAPTCHA_ERROR);
      });

    if (!user) {
      Logger.Warn(req.body);
      res.status(401).json({error: BAD_CREDENTIALS});
      throw new Error(BAD_CREDENTIALS);
    }

    const token = JwtManager.jwt({login: user.login, email: user.email, password: user.password});

    Logger.Info(req.params.msg);
    delete user.password;

    return res.status(200).json({login: user.login, email: user.email, token});
  }
}
