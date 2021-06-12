export interface ISpeechPartDto {
    id: number;
    name: string;
}

export interface IGenderDto {
    id: number;
    name: string;
}

export interface ILanguageDto {
    id: number;
    english_name: string;
    native_name: string;
    iso2: string;
    rtl: boolean;
}

export interface IWordMetadataDto {
    speechParts: ISpeechPartDto[],
    genders: IGenderDto[],
    languages: ILanguageDto[]
}
