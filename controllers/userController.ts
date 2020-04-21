import { Request, Response } from 'express';
import {Controller, Put, Post, Middleware} from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import {User} from "../models/user";
import {setPassword} from "../services/database-helpers";
import {IUser} from "../interfaces/IUser";
import {BAD_CREDENTIALS, FORM_NOT_VALID, INTERNAL_SERVER_ERROR} from "../const/error";
import {Validators} from "../services/validators";
import {JwtManager} from "@overnightjs/jwt";

@Controller('user')
export class UserController {
  @Put()
  @Middleware(JwtManager.middleware)
  private putMessage(req: Request, res: Response) {
    Logger.Info(req.params.msg);
    return res.status(400).json({
      error: req.params.msg,
    });
  }

  @Post('register')
  private async registerUser(req: Request, res: Response) {
    const simpleInputFields = ['login', 'password'];
    const inputValid = Validators.object(req.body, simpleInputFields, input => Validators.simpleInput(input));
    const emailValid = Validators.email(req.body.email);

    if (!(inputValid && emailValid)) {
      return  res.status(400).json({error: new Error(FORM_NOT_VALID)});
    }

    await User.create(req.body).catch((err: any) => {
      Logger.Err(err);
      return res.status(500).json({error: new Error(INTERNAL_SERVER_ERROR)})
    })

    return res.status(200).json({
      error: req.params.msg,
    });
  }

  @Post('login')
  private async loginUser(req: Request, res: Response) {
    const user: IUser = (await User.findOne({login: req.body.login}) as any)
      // .catch((err: any) => {
      //   Logger.Err(err);
      //   res.status(500).json({error: new Error(INTERNAL_SERVER_ERROR)});
      // })

    if (!user) {
      Logger.Warn(req.body);
      return res.status(401).json({error: new Error(BAD_CREDENTIALS)});
    }

    console.log(req.body);
    console.log(user);

    const token = JwtManager.jwt({login: user.login, email: user.email, password: user.password});

    Logger.Info(req.params.msg);
    delete user.password;

    return res.status(200).json({login: user.login, email: user.email, token});
  }
}
