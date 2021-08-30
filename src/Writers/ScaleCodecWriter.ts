import {IDisposable} from "./IScaleWriter";
import {ArrayBufferWritableSyncStream} from "#stream";
import {CompactMode, CompactModeExtentions} from "#CompactMode";
import {hexToBuffer} from "../../tests/hexUtil";

export class ToBigForUint64 extends Error {}
export class ToBigForUint32 extends Error {}
export class ToBigForUint16 extends Error {}
export class ToBigForUint8 extends Error {}


export class ScaleCodecWriter implements IDisposable {
    private readonly _output: ArrayBufferWritableSyncStream;
    private readonly _ownsStream: boolean;
    private _tempBuffer = new Uint8Array(16);

    public constructor(output: ArrayBufferWritableSyncStream, ownsStream: boolean) {
        this._output = output;
        this._ownsStream = ownsStream;
    }

    private GetLastByte(value: number | bigint): number {
        if (typeof value == "number") return value % 256;
        let result = value % 256n;
        return parseInt(result.toString(10), 10);
    }

    public WriteRawBytes(data: Uint8Array): void {
        this._output.writeBytes(data, 0, data.length);
    }

    private WriteSmallBigInt(value: number, mode: CompactMode): void {
        let compact: number;
        compact = (value << 2) + mode;
        let bytes: number;
        switch (mode) {
            case CompactMode.SINGLE:
                bytes = 1;
                break;
            case CompactMode.TWO:
                bytes = 2;
                break;
            default:
                bytes = 4;
                break;
        }
        while (bytes > 0) {
            this._output.writeByte((compact & 0xff));
            compact >>= 8;
            bytes--;
        }
    }

    public WriteBigInt(value: bigint): void {
        let mode = CompactModeExtentions.GetCompactModeBig(value);
        let datastr = value.toString(16);

        if (mode != CompactMode.BIGINT) {
            this.WriteSmallBigInt(parseInt(datastr, 16), mode);
            return;
        }
        let data = hexToBuffer(datastr);
        let length = data.length;
        let bytes = data.reverse();
        let blen = ((bytes.length - 4) << 2) + this.GetLastByte(mode);
        this.WriteByte(blen);
        this._output.writeBytes(bytes, 0, bytes.length);
    }

    public WriteByteArray(data: Uint8Array): void {
        this.WriteBigInt(BigInt(data.length));
        this.WriteRawBytes(data);
    }

    public WriteByte(b: number): void {
        this._output.writeByte(b);
    }

    public WriteUint16(value: number): void {
        if (value > 2**16) {
            throw new ToBigForUint16("The number id more than 2^16");
        }
        this._tempBuffer[0] = (value & 0xff);
        this._tempBuffer[1] = ((value >> 8) & 0xff);
        this._output.writeBytes(this._tempBuffer, 0, 2);
    }

    public WriteUint32(value: number): void {
        if (value > 2**32) {
            throw new ToBigForUint32("The number id more than 2^32");
        }
        this._tempBuffer[0] = (value & 0xff);
        this._tempBuffer[1] = ((value >> 8) & 0xff);
        this._tempBuffer[2] = ((value >> 16) & 0xff);
        this._tempBuffer[3] = ((value >> 24) & 0xff);
        this._output.writeBytes(this._tempBuffer, 0, 4);
    }

    public WriteUint64(value: bigint): void {
        if (value > 2n**64n) {
            throw new ToBigForUint64("The number id more than 2^64");
        }
        this._tempBuffer[0] = (this.GetLastByte(value) & 0xff);
        this._tempBuffer[1] = (this.GetLastByte(value >> 8n) & 0xff);
        this._tempBuffer[2] = (this.GetLastByte(value >> 16n) & 0xff);
        this._tempBuffer[3] = (this.GetLastByte(value >> 24n) & 0xff);
        this._tempBuffer[4] = (this.GetLastByte(value >> 32n) & 0xff);
        this._tempBuffer[5] = (this.GetLastByte(value >> 40n) & 0xff);
        this._tempBuffer[6] = (this.GetLastByte(value >> 48n) & 0xff);
        this._tempBuffer[7] = (this.GetLastByte(value >> 56n) & 0xff);
        this._output.writeBytes(this._tempBuffer, 0, 8);// By the c sharp realisation, I think we need 8 here. applaeyd 8 versus 4
    }
 
    public WriteBool(value: boolean): void {
        this.WriteByte(value ? 1 : 0);
    }

    public WriteOptionalBool(value?: boolean | null): void {
        if (value == null || value == undefined) {
            this._output.writeByte(0);
        } else
            this._output.writeByte(value == true ? 1 : 2);
    }

    public WriteString(value: string): void {
        if (value == null) throw new Error("ArgumentExeption");
        const enc = new TextEncoder();
        let byteArray = enc.encode(value);
        this.WriteBigInt(BigInt(byteArray.length));
        if (byteArray.length == 0) return;
        this.WriteRawBytes(byteArray);
    }

    public dispose(): void {
        if (this._ownsStream)
            return;
        return;
    }
}