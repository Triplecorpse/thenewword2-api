import * as mongoose from 'mongoose';
import {
  secureHtmlString,
  secureHtmlStringArray,
  validateGender,
  validateSpeechPart
} from "../services/database-helpers";

const schema = new mongoose.Schema({
  words: {type: [String], required: true},
  name: {type: String, required: true},
  userCreated: {type: String, required: true},
  usersCopied: {type: [String]}
});

export const WordSet = mongoose.model('WordSet', schema);
