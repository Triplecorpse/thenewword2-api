import {IWordDto} from "./IWordDto";
import {Change} from "diff";

export interface IWordCheckDto {
    status: 'right' | 'wrong' | 'skipped';
    right: boolean;
    you: IWordDto;
    vault: IWordDto;
    diff?: Change[];
}
