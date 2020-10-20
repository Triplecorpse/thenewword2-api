CREATE SCHEMA IF NOT EXISTS tnw2 AUTHORIZATION postgres;

CREATE TABLE tnw2.speech_parts (
    id serial PRIMARY KEY,
    title text
);
CREATE TABLE tnw2.genders (
    id serial PRIMARY KEY,
    title text
);
CREATE TABLE tnw2.languages (
    id serial PRIMARY KEY,
    code2 char(2),
    english_name text,
    native_name text
);

INSERT INTO tnw2.speech_parts (title) VALUES ('noun'), ('pronoun'), ('verb'), ('adjective'), ('adverb'), ('preposition'), ('conjunction'), ('interjection');
INSERT INTO tnw2.genders (title) VALUES ('masculine'), ('feminine'), ('neutral');
