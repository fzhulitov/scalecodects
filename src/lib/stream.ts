export interface IWritableSyncStream {
    writeByte(byte: number): void

    writeBytes(array: Uint8Array, offset: number, len: number): void
}

export interface IReadableSyncStream {
    readByte(): number

    readBytes(len: number): Uint8Array
}

export class EndOfStreamError extends Error {
}

export class ArrayReadableSyncStream implements IReadableSyncStream {
    private offset = 0

    constructor(private array: Uint8Array) {
    }

    readByte(): number {
        if (this.offset > this.array.byteLength) throw new EndOfStreamError()

        const rv = this.array[this.offset]

        if (rv == undefined) throw new EndOfStreamError("end")

        this.offset++
        return rv
    }

    readBytes(len: number): Uint8Array {
        if (this.offset + len > this.array.byteLength) throw new EndOfStreamError()
        const rv = this.array.slice(this.offset, this.offset + len)
        this.offset += len
        return rv
    }
}

export class ArrayBufferWritableSyncStream implements IWritableSyncStream {
    private array = new Uint8Array(32)
    private offset = 0

    private ensureCanWrite(len: number) {
        const desiredSize = this.offset + len
        if (desiredSize > this.array.byteLength) {
            const narr = new Uint8Array(this.array.byteLength * 2)
            narr.set(this.array)
            this.array = narr
        }
    }

    writeByte(byte: number): void {
        this.ensureCanWrite(1)
        this.array[this.offset] = byte
        this.offset++
    }

    writeBytes(array: Uint8Array, offset: number, len: number): void {
        this.ensureCanWrite(len)
        const sub = array.subarray(offset, offset + len)
        this.array.set(sub, this.offset)
        this.offset += len
    }

    toArray(): Uint8Array {
        const rv = new Uint8Array(this.offset)
        rv.set(this.array.subarray(0, this.offset))
        return rv
    }
}
