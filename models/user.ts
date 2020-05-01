import * as mongoose from 'mongoose';
import {secureHtmlString} from "../services/database-helpers";
import {Validators} from "../services/validators";

const schema = new mongoose.Schema({
  login: {type: String, required: true, set: secureHtmlString},
  email: {type: String, required: true, validate: Validators.email, set: secureHtmlString},
  password: {type: String, required: true},
});

export const User = mongoose.model('User', schema);
