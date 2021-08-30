import {ScaleCodecWriter} from "./ScaleCodecWriter";

export interface IScaleWriter<T>{
     Write (codec : ScaleCodecWriter, value: T):void
}

export interface IDisposable {
     dispose() : void 
}