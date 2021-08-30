import {IScaleReader} from "./IScaleReader";
import {ScaleCodecReader} from "./ScaleCodecReader";

export class BoolReader implements IScaleReader<boolean>{
    static get instance() {
        return new BoolReader();
    }
    public read(reader: ScaleCodecReader): boolean {
       return  reader.ReadBool();
    }
}

export class Uint8Reader implements IScaleReader<number>{
    static get instance() {
        return new Uint8Reader();
    }
    public read(reader: ScaleCodecReader): number {
       return  reader.ReadByte();
    }
}

export class Uint16Reader implements IScaleReader<number>{
    static get instance() {
        return new Uint16Reader();
    }
    public read(reader: ScaleCodecReader): number {
        return  reader.ReadUint16();
    }
}
export class Uint32Reader implements IScaleReader<number>{
    static get instance() {
        return new Uint32Reader();
    }
    public read(reader: ScaleCodecReader): number {
        return  reader.ReadUint32();
    }
}
export class Uint64Reader implements IScaleReader<bigint>{
    static get instance() {
        return new Uint64Reader();
    }
    public read(reader: ScaleCodecReader): bigint {
        return  reader.ReadUint64();
    }
}
export class BigIntegerReader implements IScaleReader<bigint>{
    static get instance() {
        return new BigIntegerReader();
    }
    public read(reader: ScaleCodecReader): bigint {
        return  reader.ReadBigInt();
    }
}
export class ByteArrayReader implements IScaleReader<Uint8Array>{
    static get instance() {
        return new BigIntegerReader();
    }
    public read(reader: ScaleCodecReader): Uint8Array {
        return  reader.ReadByteArray();
    }
}
export class RawBytesReader implements IScaleReader<Uint8Array>{
   private readonly _len :number;
   
   public constructor (len : number) {
       this._len=len
   } 

    public read(reader: ScaleCodecReader): Uint8Array {
        return  reader.ReadRawBytes(this._len);
    }
}
export class OptionalReader<T> implements IScaleReader<T|null>{
    private readonly _reader: IScaleReader<T>;
    public constructor  (reader : IScaleReader<T>){
        this._reader = reader;
    }
    public read(reader: ScaleCodecReader): T|null  {
        if (this._reader instanceof BoolReader){
            return <T|null> reader.ReadNullableBool();}
        if ( reader.ReadByte() == 0) {return null;}
        return this._reader.read(reader);
    }
} 

