import * as mongoose from 'mongoose';
import {
  secureHtmlString,
  secureHtmlStringArray,
  validateGender,
  validateSpeechPart
} from "../services/database-helpers";

const schema = new mongoose.Schema({
  word: {type: String, required: true, set: secureHtmlString},
  uniqueId: {type: String, required: true},
  translations: {type: [String], required: true, set: secureHtmlStringArray},
  speechPart: {type: String, validate: validateSpeechPart},
  gender: {type: String, validate: validateGender},
  forms: {type: [String], set: secureHtmlStringArray},
  originalLang: {type: String, set: secureHtmlStringArray},
  translatedLang: {type: String, set: secureHtmlStringArray},
  remarks: {type: String, set: secureHtmlString},
  userCreated: {type: String, required: true},
  usersCopied: {type: [String]},
  stressIndex: {type: Number}
});

export const Word = mongoose.model('Word', schema);
