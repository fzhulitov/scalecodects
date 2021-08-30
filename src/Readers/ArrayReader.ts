import {IScaleReader} from "./IScaleReader";
import {ScaleCodecReader} from "./ScaleCodecReader";


export class FixedSizeArrayReader<T> implements IScaleReader<T[]> {
    private readonly _len: number;
    private readonly _elementReader: IScaleReader<T>;

    public constructor(len: number, elementReader: IScaleReader<T>) {
        this._len = len;
        this._elementReader = elementReader;
    }

    public read(reader: ScaleCodecReader): T[] {
        let lst: T[] = new Array(this._len);
        for (let c = 0; c < this._len; c++) {
            lst[c] = this._elementReader.read(reader);
        }
        return lst;
    }
}

export class ArrayReader<T> implements IScaleReader<T[]> {
    private readonly _elementReader: IScaleReader<T>;

    public constructor(elementReader: IScaleReader<T>) {
        this._elementReader = elementReader;
    }

    public read(reader: ScaleCodecReader): T[] {
        let len = reader.ReadBigInt();
        let ilen = Number.parseInt(len.toString());
        let lst: T[] = new Array(ilen);
        for (let c = 0; c < ilen; c++) {
            lst[c] = this._elementReader.read(reader);
        }
        return lst;
    }
}


export class StringReader implements IScaleReader<string> {
    public read(reader: ScaleCodecReader): string {
        return reader.ReadString();
    }
}