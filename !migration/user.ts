export const createUserTableQ = 'CREATE TABLE users (id integer, login text, email text)';
export const createWordTableQ = 'CREATE TABLE words (id integer, login text, email text)';

const sql = `
CREATE SCHEMA IF NOT EXISTS tnw2 AUTHORIZATION postgres;
CREATE TABLE IF NOT EXISTS tnw2.tnw2_users (
    id integer NOT NULL, 
    login text NOT NULL,
    email text NOT NULL
);
CREATE TYPE speech_part AS ENUM ('noun', 'pronoun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection');
CREATE TYPE gender AS ENUM ('masculine', 'feminine', 'neutral');
CREATE TABLE IF NOT EXISTS tnw2.tnw2_words (
    id integer NOT NULL, 
    PRIMARY KEY(id),
    word text NOT NULL, 
    translations text[],
    speechPart speech_part,
    gender gender,
    forms text[],
    original_language char(2),
    translated_language char(2),
    remarks text,
    user_created integer NOT NULL,
    users_copied integer[] NOT NULL,
    FOREIGN KEY (user_created) REFERENCES tnw2.tnw_users(id),
    FOREIGN KEY (users_copied) REFERENCES tnw2.tnw_users(id),
);
`