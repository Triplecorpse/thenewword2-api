CREATE TABLE tnw2.speech_parts (
    id serial PRIMARY KEY,
    title text
);
CREATE TABLE tnw2.genders (
    id serial PRIMARY KEY,
    title text
);

INSERT INTO tnw2.speech_parts (title) VALUES ('noun'), ('pronoun'), ('verb'), ('adjective'), ('adverb'), ('preposition'), ('conjunction'), ('interjection');
INSERT INTO tnw2.genders (title) VALUES ('masculine'), ('feminine'), ('neutral');
