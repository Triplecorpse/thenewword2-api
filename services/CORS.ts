import {NextFunction, Request, Response} from "express";

//TODO: Securify
export function CORS(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');

  next();
}
