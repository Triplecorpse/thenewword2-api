import {Language} from "./Language";
import {User} from "./User";
import {queryDatabase} from "../services/db";
import {IReadOnlyEntity} from "../interfaces/IReadOnlyEntity";
import {ISymbolDto} from "../interfaces/dto/ISymbolDto";
import {languages} from "../const/constData";
import {CustomError} from "./CustomError";

export class KeyMapper implements IReadOnlyEntity<KeyMapper, ISymbolDto> {
    dbid? = 0;
    keys?: string[];
    language?: Language;
    user?: User;

    constructor(dto?: ISymbolDto) {
        if (dto) {
            this.dbid = dto.id;
            this.keys = dto.symbols;
            this.language = languages.find(l => l.dbid === dto.language_id);
        }
    }

    static async fromDb(id: number): Promise<KeyMapper> {
        const keyMapper = new KeyMapper();
        keyMapper.dbid = id;
        await keyMapper.loadFromDb();

        return keyMapper;
    }

    static async loadShared(languageIds: number[] = []): Promise<KeyMapper[]> {
        try {
            let queryPart = '';

            if (languageIds.length) {
                const indexes = languageIds.map((id, index) => index).map(index => `$${index + 1}`);

                queryPart = ` AND tnw2.relation_users_learning_language_special_letters.language_id IN (${indexes.join(', ')})`;
            }

            const result = await queryDatabase('SELECT tnw2.relation_users_learning_language_special_letters.language_id, tnw2.special_letters.letter FROM tnw2.relation_users_learning_language_special_letters LEFT JOIN tnw2.special_letters ON tnw2.special_letters.id = tnw2.relation_users_learning_language_special_letters.letter_id WHERE tnw2.relation_users_learning_language_special_letters.user_id IS NULL' + queryPart, [...languageIds]);
            const uniqLanguages: number[] = [];

            result.forEach(item => {
                if (!uniqLanguages.includes(item.language_id)) {
                    uniqLanguages.push(item.language_id);
                }
            });

            return uniqLanguages.map((lang_id) => {
                const keyMapper = new KeyMapper();

                keyMapper.language = languages.find(l => l.dbid === lang_id);
                keyMapper.keys = result.filter(item => item.language_id === lang_id).map(({letter}) => letter);

                return keyMapper;
            });
        } catch (error) {
            throw new CustomError('KEYMAPPER_LOAD_BY_LANGUAGE_ID', error);
        }
    }

    convertToDto(): ISymbolDto {
        return {
            id: this.dbid || undefined,
            symbols: this.keys,
            language_id: this.language?.dbid,
            user_id: this.user?.dbid
        };
    }

    async loadFromDb(): Promise<void> {
        const result = await queryDatabase('SELECT * FROM tnw2.relation_users_learning_language_special_letters WHERE id=$1', [this.dbid]);
        const keyMapper = new KeyMapper();

        keyMapper.keys = [result[0].letter];
        keyMapper.language = await Language.fromDb(result[0].language_id);
        keyMapper.user = await User.fromDb(result[0].user_id);
    }
}
