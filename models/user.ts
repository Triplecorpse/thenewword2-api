import * as mongoose from 'mongoose';
import {secureHtmlString, hashPassword} from "../services/database-helpers";
import {Validators} from "../services/validators";

const schema = new mongoose.Schema({
  login: {type: String, required: true, set: secureHtmlString},
  email: {type: String, required: true, validate: Validators.email, set: secureHtmlString},
  password: {type: String, required: true, set: hashPassword}
});

export const User = mongoose.model('User', schema);
