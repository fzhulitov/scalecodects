import {ArrayBufferWritableSyncStream, ArrayReadableSyncStream, EndOfStreamError} from "#stream";
import {
    ScaleCodecWriter, ToBigForBigint,
    ToBigForUint16,
    ToBigForUint32,
    ToBigForUint64,
    ToBigForUint8
} from "../src/Writers/ScaleCodecWriter";
import {ScaleCodecReader} from "../src/Readers/ScaleCodecReader";
import {bufferToHex, hexToBuffer, toHexString} from "./hexUtil";
import {ArrayWriter} from "../src/Writers/ArrayWriter";
import {BoolWriter, UInt16Writer} from "../src/Writers/PrimitiveWriters";
import {BoolReader, Uint16Reader} from "../src/Readers/PrimitiveReaders";
import {ArrayReader} from "../src/Readers/ArrayReader";
import theoretically from "jest-theories";
import {NegativValueRestricted} from "#CompactMode";

it("Should write byte", () => {
    let writer = new ArrayBufferWritableSyncStream();
    writer.writeByte(0);
    let reader = new ArrayReadableSyncStream(writer.toArray());
    expect(reader.readByte()).toEqual(0);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);
})

it("Should write bytes some", () => {
    let writer = new ArrayBufferWritableSyncStream();
    writer.writeBytes(hexToBuffer("0102030405"), 0, 5);
    let reader = new ArrayReadableSyncStream(writer.toArray());
    expect(bufferToHex(reader.readBytes(5))).toEqual("0102030405");
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);
})

it("Should Write byte Array", () => {
    let writer = new ArrayBufferWritableSyncStream();
    let writeCodec = new ScaleCodecWriter(writer, true);
    let arr = hexToBuffer("00112233445566")
    writeCodec.WriteByteArray(arr);
    let reader = new ArrayReadableSyncStream(writer.toArray());
    let readerCodec = new ScaleCodecReader(reader);
    expect(readerCodec.ReadByteArray()).toEqual(arr);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);

})

it("Should Write byte Array of one element", () => {
    let writer = new ArrayBufferWritableSyncStream();
    let writeCodec = new ScaleCodecWriter(writer, true);
    let arr = hexToBuffer("00")
    writeCodec.WriteByteArray(arr);
    let reader = new ArrayReadableSyncStream(writer.toArray());
    let readerCodec = new ScaleCodecReader(reader);
    expect(readerCodec.ReadByteArray()).toEqual(arr);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);

})

it ("Shouldn't write negative values",()=>{
    let writer = new ArrayBufferWritableSyncStream();
    let writeCodec = new ScaleCodecWriter(writer, true);
    expect(() => writeCodec.WriteByte(-1)).toThrowError(NegativValueRestricted);
    expect(() => writeCodec.WriteUint16(-1)).toThrowError(NegativValueRestricted);
    expect(() => writeCodec.WriteUint32(-1)).toThrowError(NegativValueRestricted);
    expect(() => writeCodec.WriteUint64(-1n)).toThrowError(NegativValueRestricted);
    expect(() => writeCodec.WriteBigInt(-1n)).toThrowError(NegativValueRestricted);
    let reader = new ArrayReadableSyncStream(writer.toArray());
    let readerCodec = new ScaleCodecReader(reader);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);    
})

it("Should write byte 240 ", () => {
    let writer = new ArrayBufferWritableSyncStream();
    writer.writeByte(240);
    let reader = new ArrayReadableSyncStream(writer.toArray());
    expect(reader.readByte()).toEqual(240);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);
})

describe("Test theory for byte", ()=> {
    const theories = [
        {hex: "00", value: 0},
        {hex: "01", value: 1},
        {hex: "ff", value: 255},
    ]
    theoretically("must write data {value}, after it, trying to write more than maks to catch error", theories, theory => {
        let writer = new ArrayBufferWritableSyncStream();
        let writeCodec = new ScaleCodecWriter(writer, true);
        writeCodec.WriteByte(theory.value);
        expect(() => writeCodec.WriteByte(2 ** 8)).toThrowError(ToBigForUint8);
        expect(bufferToHex(writer.toArray())).toEqual(theory.hex);
        let reader = new ArrayReadableSyncStream(writer.toArray());
        let readerCodec = new ScaleCodecReader(reader);
        expect(readerCodec.ReadByte()).toEqual(theory.value);
        expect(() => reader.readByte()).toThrowError(EndOfStreamError);
    })
})

    describe("Test theory for Uint16", ()=> {
        const theories = [
            {hex: "0000", value: 0},
            {hex: "0100", value: 1},
            {hex: "ff00", value: 255},
            {hex: "ffff", value: 2**16-1},
        ]
        theoretically("must write data {value}, after it, trying to write more than maks to catch error",theories,theory =>{
            let writer = new ArrayBufferWritableSyncStream();
            let writeCodec = new ScaleCodecWriter(writer, true);
            writeCodec.WriteUint16(theory.value);
            expect(()=>writeCodec.WriteUint16(2**16)).toThrowError(ToBigForUint16);
            expect(bufferToHex(writer.toArray())).toEqual(theory.hex);
            let reader = new ArrayReadableSyncStream(writer.toArray());
            let readerCodec = new ScaleCodecReader(reader);
            expect(readerCodec.ReadUint16()).toEqual(theory.value);
            expect(() => reader.readByte()).toThrowError(EndOfStreamError);
        })
})

describe("Test theory for Uint32", ()=> {
    const theories = [
        {hex: "00000000", value: 0},
        {hex: "ff000000", value: 2**8-1},
        {hex: "ffff0000", value: 2**16-1},
        {hex: "ffffff00", value: 2**24-1},
        {hex: "ffffffff", value: 2**32-1},
    ]
    theoretically("must write data {value}, after it, trying to write more than maks to catch error",theories,theory =>{
        let writer = new ArrayBufferWritableSyncStream();
        let writeCodec = new ScaleCodecWriter(writer, true);
        writeCodec.WriteUint32(theory.value);
        expect(()=>writeCodec.WriteUint32(2**32)).toThrowError(ToBigForUint32);
        expect(bufferToHex(writer.toArray())).toEqual(theory.hex);
        let reader = new ArrayReadableSyncStream(writer.toArray());
        let readerCodec = new ScaleCodecReader(reader);
        expect(readerCodec.ReadUint32()).toEqual(theory.value);
        expect(() => reader.readByte()).toThrowError(EndOfStreamError);
    })
})

describe("Test theory for Uint64", ()=> {
    const theories = [
        {hex: "0000000000000000", value: 0n},
        {hex: "ff00000000000000", value: 2n**8n-1n},
        {hex: "ffff000000000000", value: 2n**16n-1n},
        {hex: "ffffff0000000000", value: 2n**24n-1n},
        {hex: "ffffffff00000000", value: 2n**32n-1n},
        {hex: "ffffffffff000000", value: 2n**40n-1n},
        {hex: "ffffffffffff0000", value: 2n**48n-1n},
        {hex: "ffffffffffffff00", value: 2n**56n-1n},
        {hex: "ffffffffffffffff", value: 2n**64n-1n},
    ]
    theoretically("must write data {value}, after it, trying to write more than maks to catch error",theories,theory =>{
        let writer = new ArrayBufferWritableSyncStream();
        let writeCodec = new ScaleCodecWriter(writer, true);
        writeCodec.WriteUint64(theory.value);
        expect(()=>writeCodec.WriteUint64(2n**64n)).toThrowError(ToBigForUint64);
        expect(bufferToHex(writer.toArray())).toEqual(theory.hex);
        let reader = new ArrayReadableSyncStream(writer.toArray());
        let readerCodec = new ScaleCodecReader(reader);
        expect(readerCodec.ReadUint64()).toEqual(theory.value);
        expect(() => reader.readByte()).toThrowError(EndOfStreamError);
    })
})

describe("Test theory for Bigint", ()=>{
    const theories =[
        {hex: "00", value: 0n},
        {hex: "04", value: 1n},
        {hex: "a8", value: 42n},
        {hex: "fc", value: 63n},
        {hex: "0101", value: 64n},
        {hex: "1501", value: 69n},
        {hex: "fdff", value: 16383n},
        {hex: "02000100", value: 16384n},
        {hex: "feffffff", value: 0x3f_ff_ff_ffn},
        {hex: "0300000040", value: 0x40_00_00_00n},
        {hex: "0370605040", value: 0x40_50_60_70n},
        {hex: "03000000ff", value: 0xff_00_00_00n},
        {hex: "030000ffff", value: 0xff_ff_00_00n},
        {hex: "03ffffffff", value: 0xff_ff_ff_ffn},
        {hex: "0700ffffffff", value: 0xffffffff00n},
        {hex: "07ffffffffff", value: 0xffffffffffn},
        {
            hex: "33aabbccddeeff00112233445566778899",
            value: BigInt("0x99887766554433221100ffeeddccbbaa")
        }

    ]
    theoretically("the number {value} correct write to hex {hex}",theories,theory => {
        let writer = new ArrayBufferWritableSyncStream();
        let writeCodec = new ScaleCodecWriter(writer, true);
        writeCodec.WriteBigInt(theory.value);
        expect(()=>writeCodec.WriteBigInt(2n**536n)).toThrowError(ToBigForBigint);
        expect(toHexString(writer.toArray())).toEqual(theory.hex);
        let reader = new ArrayReadableSyncStream(writer.toArray());
        let readerCodec = new ScaleCodecReader(reader);
        expect(readerCodec.ReadBigInt()).toEqual(theory.value);
        expect(() => reader.readByte()).toThrowError(EndOfStreamError);
    })
})



it("Should write bools", () => {
    let writer = new ArrayBufferWritableSyncStream();
    let writeCodec = new ScaleCodecWriter(writer, true);
    writeCodec.WriteBool(false);
    writeCodec.WriteBool(true);
    writeCodec.WriteOptionalBool(null);
    writeCodec.WriteOptionalBool();
    writeCodec.WriteOptionalBool(true);
    writeCodec.WriteOptionalBool(false);
    let reader = new ArrayReadableSyncStream(writer.toArray());
    let readerCodec = new ScaleCodecReader(reader);
    expect(readerCodec.ReadBool()).toEqual(false);
    expect(readerCodec.ReadBool()).toEqual(true);
    expect(readerCodec.ReadNullableBool()).toEqual(null);
    expect(readerCodec.ReadNullableBool()).toEqual(null);
    expect(readerCodec.ReadNullableBool()).toEqual(true);
    expect(readerCodec.ReadNullableBool()).toEqual(false);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);
})


it("Should write optional writer empty", () => {
    let writer = new ArrayBufferWritableSyncStream();
    let writeCodec = new ScaleCodecWriter(writer, true);
    let boolarr: boolean[] = [];
    let elWriter = new BoolWriter();
    let arrWriter = new ArrayWriter<boolean>(elWriter);

    arrWriter.Write(writeCodec, boolarr);
    expect(bufferToHex(writer.toArray())).toEqual("00");

    let reader = new ArrayReadableSyncStream(writer.toArray());
    let readerCodec = new ScaleCodecReader(reader);
    let elReader = new BoolReader();
    let arrReader = new ArrayReader<boolean>(elReader);
    expect(arrReader.read(readerCodec)).toEqual(boolarr);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);
})

it("Should write optional writer non empty unint16", () => {
    let writer = new ArrayBufferWritableSyncStream();
    let writeCodec = new ScaleCodecWriter(writer, true);
    let arr: number[] = [4, 8, 15, 16, 23, 42];
    let elWriter = new UInt16Writer();
    let arrWriter = new ArrayWriter<number>(elWriter);

    arrWriter.Write(writeCodec, arr);
    expect(bufferToHex(writer.toArray())).toEqual("18040008000f00100017002a00");

    let reader = new ArrayReadableSyncStream(writer.toArray());
    let readerCodec = new ScaleCodecReader(reader);
    let elReader = new Uint16Reader();
    let arrReader = new ArrayReader<number>(elReader);
    expect(arrReader.read(readerCodec)).toEqual(arr);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);
})




// leaved from sharp
it("Should write Uint16", () => {
    let writer = new ArrayBufferWritableSyncStream();
    let writeCodec = new ScaleCodecWriter(writer, true);
    writeCodec.WriteUint16(42);
    let reader = new ArrayReadableSyncStream(writer.toArray());
    let readerCodec = new ScaleCodecReader(reader);
    expect(readerCodec.ReadUint16()).toEqual(42);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);
})

it("Should write Uint32", () => {
    let writer = new ArrayBufferWritableSyncStream();
    let writeCodec = new ScaleCodecWriter(writer, true);
    writeCodec.WriteUint32(16777215);
    let reader = new ArrayReadableSyncStream(writer.toArray());
    let readerCodec = new ScaleCodecReader(reader);
    expect(readerCodec.ReadUint32()).toEqual(16777215);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);
})





it("Should write Bigint", () => {
    type pair = { hex: string; value: bigint }
    let pairs: pair[] =
        [
            {hex: "00", value: 0n},
            {hex: "04", value: 1n},
            {hex: "a8", value: 42n},
            {hex: "fc", value: 63n},
            {hex: "0101", value: 64n},
            {hex: "1501", value: 69n},
            {hex: "fdff", value: 16383n},
            {hex: "02000100", value: 16384n},
            {hex: "feffffff", value: 0x3f_ff_ff_ffn},
            {hex: "0300000040", value: 0x40_00_00_00n},
            {hex: "0370605040", value: 0x40_50_60_70n},
            {hex: "03000000ff", value: 0xff_00_00_00n},
            {hex: "030000ffff", value: 0xff_ff_00_00n},
            {hex: "03ffffffff", value: 0xff_ff_ff_ffn},
            {hex: "0700ffffffff", value: 0xffffffff00n},
            {hex: "07ffffffffff", value: 0xffffffffffn},
            {
                hex: "33aabbccddeeff00112233445566778899",
                value: BigInt("0x99887766554433221100ffeeddccbbaa")
            }
//                hexToBuffer("99887766554433221100ffeeddccbbaa"))}
    ]
    for (let val of pairs) {
        let writer = new ArrayBufferWritableSyncStream();
        let writeCodec = new ScaleCodecWriter(writer, true);
        writeCodec.WriteBigInt(val.value);
        let hexstringfromwrite = toHexString(writer.toArray());
        expect(hexstringfromwrite == val.hex);
        let reader = new ArrayReadableSyncStream(writer.toArray());
        let readerCodec = new ScaleCodecReader(reader);
        expect(readerCodec.ReadBigInt()).toEqual(val.value);
        expect(() => reader.readByte()).toThrowError(EndOfStreamError);
    }

})
