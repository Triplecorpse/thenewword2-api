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
       ('pro-form'),
       ('particle'),
       ('participle'),
       ('transgressive'),
       ('article');

INSERT INTO tnw2.genders (title)
VALUES ('masculine'),
       ('feminine'),
       ('neutral');

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

