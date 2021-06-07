import {languagesAll} from 'countries-list';

const languageQueryParts: any = [];

(function languages() {
    let query = 'INSERT INTO tnw2.languages\nSET (iso2, englishName, nativeName, rtl)\nVALUES';

    Object.keys(languagesAll).forEach(code => {
        // @ts-ignore
        const lang: any = languagesAll[code] as any;
        languageQueryParts.push(`('${code}', '${lang.name}', '${lang.native}', ${Boolean(lang.rtl)})`);
    });

    const queryPart = languageQueryParts.join(',\n');
    query = `${query} ${queryPart};`

    console.log(query);
})();

console.log('');

(function continents() {
    let query = 'INSERT INTO tnw2.continents\nSET (iso2, englishName)\nVALUES (\'af\': \'Africa\', \'an\': \'Antarctica\', \'as\': \'Asia\', \'eu\': \'Europe\', \'na\': \'North America\', \'os\': \'Oceania\', \'sa\': \'South America\');';

    console.log(query);
})();

console.log('');

(function countries() {
    let query = 'INSERT INTO tnw2.countries\nSET (iso2, englishName, nativeName, rtl)\nVALUES';
    const queryParts: any = [];

    Object.keys(languagesAll).forEach(code => {
        // @ts-ignore
        const lang: any = languagesAll[code] as any;
        queryParts.push(`('${code}', '${lang.name}', '${lang.native}', ${Boolean(lang.rtl)})`);
    });

    const queryPart = queryParts.join(',\n');
    query = `${query} ${queryPart};`

    console.log(query);
})();