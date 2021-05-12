import {countries, Country, Language, languagesAll} from 'countries-list';

interface INativeCountry extends Country {
  code: string;
}

interface INativeLanguage extends Language {
  code: string;
}

export interface ITerritory {
  code: string;
  name: string;
  nativeName: string;
}

export interface ILanguage {
  code: string;
  territories: ITerritory[];
  name: string;
  nativeName: string;
  rtl?: number;
}

export function getLanguages(): ILanguage[] {
  // @ts-ignore
  const languagesArray: INativeLanguage[] = Object.keys(languagesAll).map((code: string) => ({...languagesAll[code], code}))
  // @ts-ignore
  const countriesArray: INativeCountry[] = Object.keys(countries).map((code: string) => ({...countries[code], code: code.toLowerCase()}))

  return  languagesArray.map(l => ({
    code: l.code,
    name: l.name,
    nativeName: l.native,
    rtl: l.rtl,
    territories: countriesArray.filter(c => c.languages.includes(l.code)).map(c => ({name: c.name, nativeName: c.native, code: c.code.toLowerCase()}))
  }));
}
