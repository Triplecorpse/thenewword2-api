import * as mongoose from 'mongoose';
import {
  secureHtmlString,
  secureHtmlStringArray,
  validateGender,
  validateSpeechPart
} from "../services/database-helpers";

const schema = new mongoose.Schema({
  word: {type: String, required: true},
  user: {type: String, required: true},
  rightGuessedTimes: {type: Number},
  falseGuessedTimes: {type: Number},
  partlyGuessedTimes: {type: Number}
});

export const WordStatistic = mongoose.model('WordsStatistics', schema);
