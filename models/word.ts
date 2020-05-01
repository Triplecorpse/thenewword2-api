import * as mongoose from 'mongoose';
import {
  secureHtmlString,
  secureHtmlStringArray,
  validateGender,
  validateSpeechPart
} from "../services/database-helpers";

const schema = new mongoose.Schema({
  word: {type: String, required: true, set: secureHtmlString},
  translations: {type: [String], required: true, set: secureHtmlStringArray},
  speechPart: {type: String, validate: validateSpeechPart},
  gender: {type: String, validate: validateGender},
  forms: {type: [String], set: secureHtmlStringArray},
  originalLang: {type: String, set: secureHtmlStringArray},
  translatedLang: {type: String, set: secureHtmlStringArray},
  remarks: {type: String, set: secureHtmlString}
});

export const Word = mongoose.model('Word', schema);
