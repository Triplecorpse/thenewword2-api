CREATE SCHEMA IF NOT EXISTS tnw2 AUTHORIZATION postgres;
CREATE TABLE IF NOT EXISTS tnw2.users (
    id serial PRIMARY KEY,
    login text NOT NULL UNIQUE CHECK(login != ''),
    email text NOT NULL UNIQUE CHECK(email != '')
);
CREATE TABLE IF NOT EXISTS tnw2.words (
    id serial PRIMARY KEY,
    word text NOT NULL UNIQUE CHECK(word != ''),
    translations text[],
    speechPart text,
    gender text,
    forms text[],
    original_language char(2),
    translated_language char(2),
    remarks text,
    user_created integer REFERENCES tnw2.users(id),
    stress_letter_index smallint
);
CREATE TABLE IF NOT EXISTS tnw2.relation_words_users_copied (
    userId integer NOT NULL REFERENCES tnw2.users(id),
    wordId integer NOT NULL REFERENCES tnw2.words(id)
);