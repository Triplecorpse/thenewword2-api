CREATE SCHEMA IF NOT EXISTS tnw2 AUTHORIZATION postgres;
CREATE TABLE IF NOT EXISTS tnw2.tnw2_users (
    id serial PRIMARY KEY,
    login text NOT NULL UNIQUE CHECK(login != ''),
    email text NOT NULL UNIQUE CHECK(email != '')
);
CREATE TABLE IF NOT EXISTS tnw2.tnw2_words (
    id serial PRIMARY KEY,
    PRIMARY KEY(id),
    word text NOT NULL UNIQUE CHECK(word != ''),
    translations text[],
    speechPart text,
    gender text,
    forms text[],
    original_language char(2),
    translated_language char(2),
    remarks text,
    user_created integer NOT NULL REFERENCES tnw2.tnw_users(id),
    users_copied integer[] NOT NULL REFERENCES tnw2.tnw_users(id),
    stress_letter_index smallint
);