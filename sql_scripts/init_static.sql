CREATE SCHEMA IF NOT EXISTS tnw2 AUTHORIZATION postgres;

CREATE TABLE tnw2.speech_parts (
    id serial PRIMARY KEY,
    title text NOT NULL
);
CREATE TABLE tnw2.genders (
    id serial PRIMARY KEY,
    title text NOT NULL
);
CREATE TABLE tnw2.languages (
    id serial PRIMARY KEY,
    code2 char(2) NOT NULL,
    english_name text,
    native_name text
);

INSERT INTO tnw2.speech_parts (title) VALUES ('noun'), ('pronoun'), ('verb'), ('adjective'), ('adverb'), ('preposition'), ('conjunction'), ('interjection'), ('numeral'), ('pro-form'), ('particle'), ('participle'), ('transgressive'), ('article');
INSERT INTO tnw2.genders (title) VALUES ('masculine'), ('feminine'), ('neutral');
