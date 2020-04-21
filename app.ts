import server from './server';
import * as dotenv from 'dotenv';
import * as mongoose from "mongoose";
import {Logger} from "@overnightjs/logger";

dotenv.config();

const exampleServer = new server();

mongoose.connect(process.env.MONGODB_URI as string, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(Logger.Info);

exampleServer.start(process.env.PORT as any);
