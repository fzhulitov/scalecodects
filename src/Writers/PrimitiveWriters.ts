import {IScaleWriter} from "./IScaleWriter";
import {ScaleCodecWriter} from "./ScaleCodecWriter";

export class BoolWriter implements IScaleWriter<boolean> {
    static get instance() {
        return new BoolWriter();
    }

    public Write(codec: ScaleCodecWriter, value: boolean) {
        codec.WriteBool(value);
    }
}

export class UInt8Writer implements IScaleWriter<number> {
    static get instance() {
        return new UInt8Writer();
    }

    public Write(codec: ScaleCodecWriter, value: number) {
        codec.WriteByte(value);
    }
}

export class UInt16Writer implements IScaleWriter<number> {
    static get instance() {
        return new UInt16Writer();
    }

    public Write(codec: ScaleCodecWriter, value: number) {
        codec.WriteUint16(value);
    }
}

export class UInt32Writer implements IScaleWriter<number> {
    static get instance() {
        return new UInt32Writer();
    }

    public Write(codec: ScaleCodecWriter, value: number) {
        codec.WriteUint32(value);
    }
}

export class UInt64Writer implements IScaleWriter<bigint> {
    static get instance() {
        return new UInt64Writer();
    }

    public Write(codec: ScaleCodecWriter, value: bigint) {
        codec.WriteUint64(value);
    }
}

export class BigIntegerWriter implements IScaleWriter<bigint> {
    static get instance() {
        return new BigIntegerWriter();
    }

    public Write(codec: ScaleCodecWriter, value: bigint) {
        codec.WriteBigInt(value);
    }
}

export class ByteArrayWriter implements IScaleWriter<Uint8Array> {
    static get instance() {
        return new ByteArrayWriter();
    }

    public Write(codec: ScaleCodecWriter, value: Uint8Array) {
        codec.WriteByteArray(value);
    }
}

export class RawBytesWriter implements IScaleWriter<Uint8Array> {
    static get instance() {
        return new RawBytesWriter();
    }

    public Write(codec: ScaleCodecWriter, value: Uint8Array) {
        codec.WriteRawBytes(value);
    }
}

export class OptionalWriter<T> implements IScaleWriter<T> {
    private readonly _writer: IScaleWriter<T>;

    public constructor(writer: IScaleWriter<T>) {
        this._writer = writer;
    }

    public Write(codec: ScaleCodecWriter, value: T) {
        if (value == null) {
            codec.WriteByte(0x00);
        } else {
            codec.WriteByte(0x01);
            this._writer.Write(codec, value);
        }
    }
}

export class StringWriter implements IScaleWriter<string> {
    static get instance() {
        return new StringWriter();
    }

    public Write(codec: ScaleCodecWriter, value: string) {

        codec.WriteString(value);
    }
}
