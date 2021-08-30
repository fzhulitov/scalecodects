import {ScaleCodecReader} from "./ScaleCodecReader";
export interface IScaleReader <T>{
     read (reader: ScaleCodecReader) : T;
}