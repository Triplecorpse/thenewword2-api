CREATE SCHEMA IF NOT EXISTS tnw2 AUTHORIZATION postgres;
CREATE TYPE word_status AS ENUM ('right', 'wrong', 'skipped');

CREATE TABLE IF NOT EXISTS tnw2.speech_parts
(
    id serial PRIMARY KEY,
    title text NOT NULL
);
CREATE TABLE IF NOT EXISTS tnw2.genders
(
    id serial PRIMARY KEY,
    title text NOT NULL
);
CREATE TABLE IF NOT EXISTS tnw2.languages
(
    id serial PRIMARY KEY,
    iso2 char(2) NOT NULL,
    english_name text,
    native_name text,
    rtl boolean
);

CREATE TABLE IF NOT EXISTS tnw2.users (
    id serial PRIMARY KEY,
    login text NOT NULL UNIQUE CHECK(login != ''),
    password text NOT NULL,
    email text NOT NULL UNIQUE CHECK(email != ''),
    created_at timestamp DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL,
    last_modified_at timestamp DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL,
    last_issued_at timestamp DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL,
    active_refresh_token char(60) NOT NULL,
    map_cyrillic boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS tnw2.words (
    id serial PRIMARY KEY,
    word text NOT NULL CHECK(word != ''),
    translations text[] NOT NULL,
    transcription text,
    speech_part_id smallint REFERENCES tnw2.speech_parts(id),
    gender_id smallint REFERENCES tnw2.genders(id),
    forms text[],
    original_language_id smallint REFERENCES tnw2.languages(id) NOT NULL,
    translated_language_id smallint REFERENCES tnw2.languages(id) NOT NULL,
    remarks text,
    user_created_id integer REFERENCES tnw2.users(id),
    stress_letter_index smallint,
    created_at timestamp DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL,
    last_modified_at timestamp DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL
);
CREATE TABLE IF NOT EXISTS tnw2.word_sets (
    id serial PRIMARY KEY,
    title text NOT NULL,
    foreign_language_id smallint REFERENCES tnw2.languages(id) NOT NULL,
    native_language_id smallint REFERENCES tnw2.languages(id) NOT NULL,
    user_created_id integer REFERENCES tnw2.users(id),
    created_at timestamp DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL,
    last_modified_at timestamp DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL
);
CREATE TABLE IF NOT EXISTS tnw2.word_statistics (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES tnw2.users(id),
    word_id integer NOT NULL REFERENCES tnw2.words(id),
    status word_status NOT NULL,
    created_at timestamp DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL
);
CREATE TABLE IF NOT EXISTS tnw2.exercise_in_progress (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES tnw2.users(id),
    word_id integer NOT NULL REFERENCES tnw2.words(id)
);
CREATE TABLE IF NOT EXISTS tnw2.special_letters (
    id serial PRIMARY KEY,
    letter char(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS tnw2.relation_words_users (
    user_id integer NOT NULL REFERENCES tnw2.users(id),
    word_id integer NOT NULL REFERENCES tnw2.words(id)
);
CREATE TABLE IF NOT EXISTS tnw2.relation_words_word_sets (
    word_set_id integer NOT NULL REFERENCES tnw2.word_sets(id),
    word_id integer NOT NULL REFERENCES tnw2.words(id)
);
CREATE TABLE IF NOT EXISTS tnw2.relation_users_word_sets (
    user_id integer NOT NULL REFERENCES tnw2.users(id),
    word_set_id integer NOT NULL REFERENCES tnw2.word_sets(id)
);
CREATE TABLE IF NOT EXISTS tnw2.relation_users_learning_language (
    user_id integer NOT NULL REFERENCES tnw2.users(id),
    language_id integer NOT NULL REFERENCES tnw2.languages(id)
);
CREATE TABLE IF NOT EXISTS tnw2.relation_users_native_language (
    user_id integer NOT NULL REFERENCES tnw2.users(id),
    language_id integer NOT NULL REFERENCES tnw2.languages(id)
);
CREATE TABLE IF NOT EXISTS tnw2.relation_users_learning_language_special_letters (
    user_id integer REFERENCES tnw2.users(id),
    language_id integer NOT NULL REFERENCES tnw2.languages(id),
    letter_id integer NOT NULL REFERENCES tnw2.special_letters(id)
);
-- Add new speech parts to the end only
INSERT INTO tnw2.speech_parts (title)
VALUES ('noun'),
       ('pronoun'),
       ('verb'),
       ('adjective'),
       ('adverb'),
       ('preposition'),
       ('conjunction'),
       ('interjection'),
       ('numeral'),
       ('proform'),
       ('particle'),
       ('participle'),
       ('transgressive'),
       ('article');
-- Add new genders to the end only
INSERT INTO tnw2.genders (title)
VALUES ('masculine'),
       ('feminine'),
       ('neutral');
-- Add new languages to the end only
INSERT INTO tnw2.languages (iso2, english_name, native_name, rtl)
VALUES ('aa', 'Afar', 'Afar', false),
       ('ab', 'Abkhazian', 'Аҧсуа', false),
       ('af', 'Afrikaans', 'Afrikaans', false),
       ('ak', 'Akan', 'Akana', false),
       ('am', 'Amharic', 'አማርኛ', false),
       ('an', 'Aragonese', 'Aragonés', false),
       ('ar', 'Arabic', 'العربية', true),
       ('as', 'Assamese', 'অসমীয়া', false),
       ('av', 'Avar', 'Авар', false),
       ('ay', 'Aymara', 'Aymar', false),
       ('az', 'Azerbaijani', 'Azərbaycanca / آذربايجان', false),
       ('ba', 'Bashkir', 'Башҡорт', false),
       ('be', 'Belarusian', 'Беларуская', false),
       ('bg', 'Bulgarian', 'Български', false),
       ('bh', 'Bihari', 'भोजपुरी', false),
       ('bi', 'Bislama', 'Bislama', false),
       ('bm', 'Bambara', 'Bamanankan', false),
       ('bn', 'Bengali', 'বাংলা', false),
       ('bo', 'Tibetan', 'བོད་ཡིག / Bod skad', false),
       ('br', 'Breton', 'Brezhoneg', false),
       ('bs', 'Bosnian', 'Bosanski', false),
       ('ca', 'Catalan', 'Català', false),
       ('ce', 'Chechen', 'Нохчийн', false),
       ('ch', 'Chamorro', 'Chamoru', false),
       ('co', 'Corsican', 'Corsu', false),
       ('cr', 'Cree', 'Nehiyaw', false),
       ('cs', 'Czech', 'Čeština', false),
       ('cu', 'Old Church Slavonic / Old Bulgarian', 'словѣньскъ / slověnĭskŭ', false),
       ('cv', 'Chuvash', 'Чăваш', false),
       ('cy', 'Welsh', 'Cymraeg', false),
       ('da', 'Danish', 'Dansk', false),
       ('de', 'German', 'Deutsch', false),
       ('dv', 'Divehi', 'ދިވެހިބަސް', true),
       ('dz', 'Dzongkha', 'ཇོང་ཁ', false),
       ('ee', 'Ewe', 'Ɛʋɛ', false),
       ('el', 'Greek', 'Ελληνικά', false),
       ('en', 'English', 'English', false),
       ('eo', 'Esperanto', 'Esperanto', false),
       ('es', 'Spanish', 'Español', false),
       ('et', 'Estonian', 'Eesti', false),
       ('eu', 'Basque', 'Euskara', false),
       ('fa', 'Persian', 'فارسی', true),
       ('ff', 'Peul', 'Fulfulde', false),
       ('fi', 'Finnish', 'Suomi', false),
       ('fj', 'Fijian', 'Na Vosa Vakaviti', false),
       ('fo', 'Faroese', 'Føroyskt', false),
       ('fr', 'French', 'Français', false),
       ('fy', 'West Frisian', 'Frysk', false),
       ('ga', 'Irish', 'Gaeilge', false),
       ('gd', 'Scottish Gaelic', 'Gàidhlig', false),
       ('gl', 'Galician', 'Galego', false),
       ('gn', 'Guarani', 'Avañe''ẽ', false),
       ('gu', 'Gujarati', 'ગુજરાતી', false),
       ('gv', 'Manx', 'Gaelg', false),
       ('ha', 'Hausa', 'هَوُسَ', true),
       ('he', 'Hebrew', 'עברית', true),
       ('hi', 'Hindi', 'हिन्दी', false),
       ('ho', 'Hiri Motu', 'Hiri Motu', false),
       ('hr', 'Croatian', 'Hrvatski', false),
       ('ht', 'Haitian', 'Krèyol ayisyen', false),
       ('hu', 'Hungarian', 'Magyar', false),
       ('hy', 'Armenian', 'Հայերեն', false),
       ('hz', 'Herero', 'Otsiherero', false),
       ('ia', 'Interlingua', 'Interlingua', false),
       ('id', 'Indonesian', 'Bahasa Indonesia', false),
       ('ie', 'Interlingue', 'Interlingue', false),
       ('ig', 'Igbo', 'Igbo', false),
       ('ii', 'Sichuan Yi', 'ꆇꉙ / 四川彝语', false),
       ('ik', 'Inupiak', 'Iñupiak', false),
       ('io', 'Ido', 'Ido', false),
       ('is', 'Icelandic', 'Íslenska', false),
       ('it', 'Italian', 'Italiano', false),
       ('iu', 'Inuktitut', 'ᐃᓄᒃᑎᑐᑦ', false),
       ('ja', 'Japanese', '日本語', false),
       ('jv', 'Javanese', 'Basa Jawa', false),
       ('ka', 'Georgian', 'ქართული', false),
       ('kg', 'Kongo', 'KiKongo', false),
       ('ki', 'Kikuyu', 'Gĩkũyũ', false),
       ('kj', 'Kuanyama', 'Kuanyama', false),
       ('kk', 'Kazakh', 'Қазақша', false),
       ('kl', 'Greenlandic', 'Kalaallisut', false),
       ('km', 'Cambodian', 'ភាសាខ្មែរ', false),
       ('kn', 'Kannada', 'ಕನ್ನಡ', false),
       ('ko', 'Korean', '한국어', false),
       ('kr', 'Kanuri', 'Kanuri', false),
       ('ks', 'Kashmiri', 'कश्मीरी / كشميري', true),
       ('ku', 'Kurdish', 'Kurdî / كوردی', true),
       ('kv', 'Komi', 'Коми', false),
       ('kw', 'Cornish', 'Kernewek', false),
       ('ky', 'Kyrgyz', 'Кыргызча', false),
       ('la', 'Latin', 'Latina', false),
       ('lb', 'Luxembourgish', 'Lëtzebuergesch', false),
       ('lg', 'Ganda', 'Luganda', false),
       ('li', 'Limburgian', 'Limburgs', false),
       ('ln', 'Lingala', 'Lingála', false),
       ('lo', 'Laotian', 'ລາວ / Pha xa lao', false),
       ('lt', 'Lithuanian', 'Lietuvių', false),
       ('lu', 'Luba-Katanga', 'Tshiluba', false),
       ('lv', 'Latvian', 'Latviešu', false),
       ('mg', 'Malagasy', 'Malagasy', false),
       ('mh', 'Marshallese', 'Kajin Majel / Ebon', false),
       ('mi', 'Maori', 'Māori', false),
       ('mk', 'Macedonian', 'Македонски', false),
       ('ml', 'Malayalam', 'മലയാളം', false),
       ('mn', 'Mongolian', 'Монгол', false),
       ('mo', 'Moldovan', 'Moldovenească', false),
       ('mr', 'Marathi', 'मराठी', false),
       ('ms', 'Malay', 'Bahasa Melayu', false),
       ('mt', 'Maltese', 'bil-Malti', false),
       ('my', 'Burmese', 'မြန်မာစာ', false),
       ('na', 'Nauruan', 'Dorerin Naoero', false),
       ('nb', 'Norwegian Bokmål', 'Norsk bokmål', false),
       ('nd', 'North Ndebele', 'Sindebele', false),
       ('ne', 'Nepali', 'नेपाली', false),
       ('ng', 'Ndonga', 'Oshiwambo', false),
       ('nl', 'Dutch', 'Nederlands', false),
       ('nn', 'Norwegian Nynorsk', 'Norsk nynorsk', false),
       ('no', 'Norwegian', 'Norsk', false),
       ('nr', 'South Ndebele', 'isiNdebele', false),
       ('nv', 'Navajo', 'Diné bizaad', false),
       ('ny', 'Chichewa', 'Chi-Chewa', false),
       ('oc', 'Occitan', 'Occitan', false),
       ('oj', 'Ojibwa', 'ᐊᓂᔑᓈᐯᒧᐎᓐ / Anishinaabemowin', false),
       ('om', 'Oromo', 'Oromoo', false),
       ('or', 'Oriya', 'ଓଡ଼ିଆ', false),
       ('os', 'Ossetian / Ossetic', 'Иронау', false),
       ('pa', 'Panjabi / Punjabi', 'ਪੰਜਾਬੀ / पंजाबी / پنجابي', false),
       ('pi', 'Pali', 'Pāli / पाऴि', false),
       ('pl', 'Polish', 'Polski', false),
       ('ps', 'Pashto', 'پښتو', true),
       ('pt', 'Portuguese', 'Português', false),
       ('qu', 'Quechua', 'Runa Simi', false),
       ('rm', 'Raeto Romance', 'Rumantsch', false),
       ('rn', 'Kirundi', 'Kirundi', false),
       ('ro', 'Romanian', 'Română', false),
       ('ru', 'Russian', 'Русский', false),
       ('rw', 'Rwandi', 'Kinyarwandi', false),
       ('sa', 'Sanskrit', 'संस्कृतम्', false),
       ('sc', 'Sardinian', 'Sardu', false),
       ('sd', 'Sindhi', 'सिनधि', false),
       ('se', 'Northern Sami', 'Sámegiella', false),
       ('sg', 'Sango', 'Sängö', false),
       ('sh', 'Serbo-Croatian', 'Srpskohrvatski / Српскохрватски', false),
       ('si', 'Sinhalese', 'සිංහල', false),
       ('sk', 'Slovak', 'Slovenčina', false),
       ('sl', 'Slovenian', 'Slovenščina', false),
       ('sm', 'Samoan', 'Gagana Samoa', false),
       ('sn', 'Shona', 'chiShona', false),
       ('so', 'Somalia', 'Soomaaliga', false),
       ('sq', 'Albanian', 'Shqip', false),
       ('sr', 'Serbian', 'Српски', false),
       ('ss', 'Swati', 'SiSwati', false),
       ('st', 'Southern Sotho', 'Sesotho', false),
       ('su', 'Sundanese', 'Basa Sunda', false),
       ('sv', 'Swedish', 'Svenska', false),
       ('sw', 'Swahili', 'Kiswahili', false),
       ('ta', 'Tamil', 'தமிழ்', false),
       ('te', 'Telugu', 'తెలుగు', false),
       ('tg', 'Tajik', 'Тоҷикӣ', false),
       ('th', 'Thai', 'ไทย / Phasa Thai', false),
       ('ti', 'Tigrinya', 'ትግርኛ', false),
       ('tk', 'Turkmen', 'Туркмен / تركمن', false),
       ('tl', 'Tagalog / Filipino', 'Tagalog', false),
       ('tn', 'Tswana', 'Setswana', false),
       ('to', 'Tonga', 'Lea Faka-Tonga', false),
       ('tr', 'Turkish', 'Türkçe', false),
       ('ts', 'Tsonga', 'Xitsonga', false),
       ('tt', 'Tatar', 'Tatarça', false),
       ('tw', 'Twi', 'Twi', false),
       ('ty', 'Tahitian', 'Reo Mā`ohi', false),
       ('ug', 'Uyghur', 'Uyƣurqə / ئۇيغۇرچە', false),
       ('uk', 'Ukrainian', 'Українська', false),
       ('ur', 'Urdu', 'اردو', true),
       ('uz', 'Uzbek', 'Ўзбек', false),
       ('ve', 'Venda', 'Tshivenḓa', false),
       ('vi', 'Vietnamese', 'Tiếng Việt', false),
       ('vo', 'Volapük', 'Volapük', false),
       ('wa', 'Walloon', 'Walon', false),
       ('wo', 'Wolof', 'Wollof', false),
       ('xh', 'Xhosa', 'isiXhosa', false),
       ('yi', 'Yiddish', 'ייִדיש', true),
       ('yo', 'Yoruba', 'Yorùbá', false),
       ('za', 'Zhuang', 'Cuengh / Tôô / 壮语', false),
       ('zh', 'Chinese', '中文', false),
       ('zu', 'Zulu', 'isiZulu', false);
-- Add new letters to the end only
--       1      2      3      4      5      6      7      8      9      0
INSERT INTO tnw2.special_letters (letter)
VALUES ('à'), ('á'), ('â'), ('ä'), ('æ'), ('ã'), ('å'), ('ā'), ('ă'), ('ç'), -- 10
       ('ć'), ('č'), ('ċ'), ('ď'), ('đ'), ('è'), ('é'), ('ê'), ('ë'), ('ē'), -- 20
       ('ė'), ('ę'), ('ģ'), ('ġ'), ('ğ'), ('ì'), ('į'), ('ī'), ('í'), ('ï'), -- 30
       ('î'), ('ķ'), ('ł'), ('ļ'), ('ń'), ('ñ'), ('ņ'), ('ň'), ('õ'), ('ō'), -- 40
       ('ø'), ('œ'), ('ó'), ('ò'), ('ö'), ('ő'), ('ô'), ('ŕ'), ('ř'), ('ß'), -- 50
       ('ś'), ('š'), ('ş'), ('ț'), ('ť'), ('ū'), ('ú'), ('ù'), ('ü'), ('ű'), -- 60
       ('û'), ('ų'), ('ů'), ('ŭ'), ('ÿ'), ('ý'), ('ž'), ('ź'), ('ż'), ('ӂ'), -- 70
       ('ѕ'), ('џ'), ('Ꙟ'), ('Ѵ'), ('ў'), ('ѓ'), ('ќ'), ('ђ'), ('љ'), ('њ'), -- 80
       ('ћ'), ('є'), ('ї'), ('ґ'), ('і'), ('ј'), ('ą'), ('ħ'), ('ș'), ('ѻ'), -- 90
       ('Ȣ'), ('ѡ'), ('ꙑ'), ('ѣ'), ('ꙗ'), ('ѥ'), ('ѧ'), ('ѫ'), ('ѯ'), ('ѱ'), -- 100
       ('ѳ'), ('ѵ'), ('ꙟ'), ('ľ'), ('ě');
INSERT INTO tnw2.relation_users_learning_language_special_letters (language_id, letter_id)
VALUES (13, 85), (13, 75), -- Belarusian
       (103, 76), (103, 71), (103, 86), (103, 79), (103, 80), (103, 77), (103, 72), -- Macedonian
       (151, 78), (151, 86), (151, 79), (151, 80), (151, 81), (151, 72), -- Serbian Cyrillic
       (151, 15), (151, 67), (151, 11), (151, 12), (151, 52), -- Serbian Latin
       (172, 82), (172, 83), (172, 84), (172, 85), -- Ukrainian
       (166, 10), (166, 25), (166, 45), (166, 53), (166, 59), -- Turkish
       (61, 2), (61, 17), (61, 46), (61, 43), (61, 57), (61, 59), (61, 60), -- Hungarian
       (31, 5), (31, 41), (31, 7), -- Danish
       (39, 36), -- Spanish
       (99, 8), (99, 12), (99, 20), (99, 23), (99, 28), (99, 32), (99, 34), (99, 37), (99, 52), (99, 56), (99, 67), -- Latvian
       (97, 87), (97, 12), (97, 22), (97, 27), (97, 52), (97, 62), (97, 56), (97, 67), -- Lithuanian
       (109, 13), (109, 24), (109, 88), (109, 69), -- Maltese
       (32, 4), (32, 45), (32, 59), (32, 50), -- German
       (129, 87), (129, 22), (129, 11), (129, 33), (129, 35), (129, 43), (129, 51), (129, 68), (129, 69), -- Polish
       (131, 2), (131, 3), (131, 6), (131, 1), (131, 10), (131, 17), (131, 18), (131, 16), (131, 26), (131, 28), (131, 43), (131, 44), (131, 46), (131, 47), (131, 57), (131, 58), -- Portuguese
       (135, 71), (135, 85), (135, 90), (135, 91), (135, 92), (135, 93), (135, 94), (135, 95), (135, 96), (135, 97), (135, 98), (135, 99), (135, 100), (135, 101), (135, 102), (135, 103), (135, 72), -- Romanian Cyrillic
       (135, 9), (135, 3), (135, 31), (135, 89), (135, 54), -- Romanian Latin
       (145, 12), (145, 14), (145, 29), (145, 104), (145, 38), (145, 48), (145, 52), (145, 55), -- Slovak
       (146, 12), (146, 52), (146, 67), -- Slovenian
       (44, 7), (44, 4), (44, 45), (44, 52), (44, 67), -- Finnish
       (47, 5), (47, 42), (47, 3), (47, 1), (47, 10), (47, 16), (47, 17), (47, 18), (47, 19), (47, 31), (47, 30), (47, 47), (47, 61), (47, 58), (47, 59), (47, 65), -- French
       (59, 67), (59, 11), (59, 12), (59, 52), -- Croatian
       (27, 2), (27, 12), (27, 14), (27, 17), (27, 105), (27, 29), (27, 38), (27, 43), (27, 49), (27, 52), (27, 55), (27, 57), (27, 63), (27, 66), (27, 67), -- Czech
       (155, 7), (155, 4), (155, 45), -- Swedish
       (40, 52), (40, 67), (40, 39), (40, 4), (40, 45), (40, 59); -- Estonian
