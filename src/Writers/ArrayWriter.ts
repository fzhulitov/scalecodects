import {IScaleWriter} from "./IScaleWriter";
import {ScaleCodecWriter} from "./ScaleCodecWriter";

export class ArrayWriter<T> implements IScaleWriter<T[]> {
    private readonly _elementWriter: IScaleWriter<T>;

    public constructor(elementWriter: IScaleWriter<T>) {
        this._elementWriter = elementWriter;
    }

    public Write(codec: ScaleCodecWriter, value: T[]): void {
        codec.WriteBigInt(BigInt(value.length));
        for (let i of value) {
            this._elementWriter.Write(codec, i);
        }
    }
}

export class FixedSizeArrayWriter<T> implements IScaleWriter<T[]> {
    private readonly _len: number;
    private readonly _elementWriter: IScaleWriter<T>;

    public constructor(len: number, elementWriter: IScaleWriter<T>) {
        this._elementWriter = elementWriter;
        this._len = len;
    }

    public Write(codec: ScaleCodecWriter, value: T[]): void {
        if (this._len != value.length) throw new Error("Excpected an array of size " + this._len);
        for (let i of value) {
            this._elementWriter.Write(codec, i);
        }
    }
}
