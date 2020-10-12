CREATE SCHEMA IF NOT EXISTS tnw2 AUTHORIZATION postgres;

CREATE TABLE IF NOT EXISTS tnw2.speech_part (
    id serial PRIMARY KEY,
    title text
);
CREATE TABLE IF NOT EXISTS tnw2.gender (
    id serial PRIMARY KEY,
    title text
);

CREATE TABLE IF NOT EXISTS tnw2.users (
    id serial PRIMARY KEY,
    login text NOT NULL UNIQUE CHECK(login != ''),
    password text NOT NULL,
    email text NOT NULL UNIQUE CHECK(email != '')
);
CREATE TABLE IF NOT EXISTS tnw2.words (
    id serial PRIMARY KEY,
    word text NOT NULL UNIQUE CHECK(word != ''),
    translations text[],
    speech_part_id integer REFERENCES tnw2.speech_part(id),
    gender integer REFERENCES tnw2.gender(id),
    forms text[],
    original_language char(2),
    translated_language char(2),
    remarks text,
    user_created_id integer REFERENCES tnw2.users(id),
    stress_letter_index smallint
);
CREATE TABLE IF NOT EXISTS tnw2.relation_words_users_copied (
    user_id integer NOT NULL REFERENCES tnw2.users(id),
    word_id integer NOT NULL REFERENCES tnw2.words(id)
);

CREATE TABLE IF NOT EXISTS tnw2.word_sets (
    id serial PRIMARY KEY,
    title text NOT NULL,
    user_created_id integer REFERENCES tnw2.users(id)
);
CREATE TABLE IF NOT EXISTS tnw2.relation_words_word_sets (
    word_set_id integer NOT NULL REFERENCES tnw2.word_sets(id),
    word_id integer NOT NULL REFERENCES tnw2.words(id)
);
CREATE TABLE IF NOT EXISTS tnw2.relation_users_word_sets (
    user_id integer NOT NULL REFERENCES tnw2.users(id),
    word_set_id integer NOT NULL REFERENCES tnw2.word_sets(id)
);

CREATE TABLE IF NOT EXISTS tnw2.word_statistics (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES tnw2.users(id),
    word_id integer NOT NULL REFERENCES tnw2.words(id),
    right_times_guessed integer DEFAULT 0,
    false_times_guessed integer DEFAULT 0,
    partly_times_guessed integer DEFAULT 0
);