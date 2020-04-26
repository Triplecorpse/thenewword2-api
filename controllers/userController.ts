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
      return res.status(400).json({error: new Error(FORM_NOT_VALID)});
    }

    await validateRecaptcha(req.body.token)
      .catch(err => {
        Logger.Err(err);
        res.status(400).json({error: new Error(RECAPTCHA_ERROR)});
        throw new Error(RECAPTCHA_ERROR);
      });

    await User.create(req.body).catch((err: any) => {
      Logger.Err(err);
      return res.status(500).json({error: new Error(INTERNAL_SERVER_ERROR)})
    });

    return res.status(200).json({
      status: 'ok',
    });
  }

  @Post('login')
  private async loginUser(req: Request, res: Response) {
    console.log(req.body);
    const password = hashPassword(req.body.password);
    const user: IUser = (await User.findOne({login: req.body.login}) as any)
      // .catch((err: any) => {
      //   Logger.Err(err);
      //   res.status(500).json({error: new Error(INTERNAL_SERVER_ERROR)});
      // })
    await validateRecaptcha(req.body.token)
      .catch(err => {
        Logger.Err(err);
        res.status(400).json({error: new Error(RECAPTCHA_ERROR)});
        throw new Error(RECAPTCHA_ERROR);
      });

    if (!user) {
      Logger.Warn(req.body);
      return res.status(401).json({error: new Error(BAD_CREDENTIALS)});
    }

    const token = JwtManager.jwt({login: user.login, email: user.email, password: user.password});

    Logger.Info(req.params.msg);
    delete user.password;

    return res.status(200).json({login: user.login, email: user.email, token});
  }
}
