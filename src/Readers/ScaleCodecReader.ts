import {IReadableSyncStream} from "#stream"
import {CompactMode} from "#CompactMode";
import {toHexString} from "../../tests/hexUtil";

export class ScaleCodecReader {
    private _mem: IReadableSyncStream;

    public constructor(mem: IReadableSyncStream) {
        this._mem = mem;
    }

    public Skip(len: number){
        this._mem.readBytes(len);
        return;
    }
    public ReadRawBytes(len: number): Uint8Array {
        return this._mem.readBytes(len);
    }

    public ReadByteArray(): Uint8Array {
        let len = Number.parseInt( this.ReadBigInt().toString(16),16);
        return this.ReadRawBytes(len);
    }

    public ReadByte(): number {

        return this._mem.readByte();
    }

    public ReadNullableByte(): number | null {
        if (this.ReadByte() == 0) {
            return null;
        }
        return this.ReadByte();
    }

    public ReadUint16(): number {
        let result = 0;
        result += this.ReadByte();
        result += (this.ReadByte() << 8);
        return result;
    }

    public ReadNullableUint16(): number | null {
        if (this.ReadByte() == 0) {
            return null;
        }
        return this.ReadUint16();
    }

    public ReadUint32(): number {
        let result = 0;
        result += this.ReadByte();
        result += (this.ReadByte() << 8);
        result += (this.ReadByte() << (2 * 8));
        result += (this.ReadByte() << (3 * 8));
        return result;
    }
    public ReadNullableUint32(): number | null {
        if (this.ReadByte() == 0) {
            return null;
        }
        return this.ReadUint32();
    }
    
    public ReadUint64(): bigint {
        let result = 0n;
        result += BigInt(this.ReadByte());
        result += BigInt((this.ReadByte() << 8));
        result += BigInt((this.ReadByte() << (2 * 8)));
        result += BigInt((this.ReadByte() << (3 * 8)));
        result += BigInt((this.ReadByte() << (4 * 8)));
        result += BigInt((this.ReadByte() << (5 * 8)));
        result += BigInt((this.ReadByte() << (6 * 8)));
        result += BigInt((this.ReadByte() << (7 * 8)));
        return result;
    }
    
    public ReadBigInt(): bigint {
        let first = this.ReadByte();
        let mode = <CompactMode>(first & 0b11);
        if (mode == CompactMode.SINGLE) return BigInt(first >> 2);
        if (mode == CompactMode.TWO) return BigInt((first >> 2) + (this.ReadByte() << 6));
        if (mode == CompactMode.FOUR) return BigInt(
            (first >> 2) +
            (this.ReadByte() << 6) +
            (this.ReadByte() << (6 + 8)) +
            (this.ReadByte() << (6 + 2 * 8))
        );
        let len = (first>>2)+4;
        let value = this.ReadRawBytes(len);
        return BigInt( "0x".concat(toHexString( value.reverse())));
    }

    public ReadNullableBigInt(): bigint | null {
        if (this.ReadByte() == 0) {
            return null;
        }
        return this.ReadBigInt();
    }

    public ReadBool(): boolean {
        return this.ReadByte() != 0;
    }

    public ReadNullableBool(): boolean | null {
        let b = this.ReadByte();
        if (b == 0) return null;
        if (b == 1) return true;
        return false;
    }

    public ReadString(): string {
        let len = Number (this.ReadBigInt());
        let s = this.ReadRawBytes(len);
        return new TextDecoder().decode(s);
    }
}

