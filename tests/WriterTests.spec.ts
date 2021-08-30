import {ArrayBufferWritableSyncStream, ArrayReadableSyncStream, EndOfStreamError} from "#stream";
import {ScaleCodecWriter} from "../src/Writers/ScaleCodecWriter";
import {ScaleCodecReader} from "../src/Readers/ScaleCodecReader";
import {bufferToHex, hexToBuffer, toHexString} from "./hexUtil";
import {ArrayWriter} from "../src/Writers/ArrayWriter";
import {BoolWriter, UInt16Writer} from "../src/Writers/PrimitiveWriters";
import {BoolReader, Uint16Reader} from "../src/Readers/PrimitiveReaders";
import {ArrayReader} from "../src/Readers/ArrayReader";
import theoretically from "jest-theories";

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

it("Should write byte 240 ", () => {
    let writer = new ArrayBufferWritableSyncStream();
    writer.writeByte(240);
    let reader = new ArrayReadableSyncStream(writer.toArray());
    expect(reader.readByte()).toEqual(240);
    expect(() => reader.readByte()).toThrowError(EndOfStreamError);
})

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


it("hex test", () => {

    let val = BigInt(0x40_00_00_00n);
    let hex = "00000040"; // 03 first
    let hexfrombig = BigInt(val).toString(16);
    let bytes = hexToBuffer(hexfrombig);
    bytes = bytes.reverse();
    hexfrombig = toHexString(bytes);
    expect(hex).toEqual(hexfrombig);
})

// theories
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
    theoretically("the number {input} correct write to hex {hex}",theories,theory => {
        let writer = new ArrayBufferWritableSyncStream();
        let writeCodec = new ScaleCodecWriter(writer, true);
        writeCodec.WriteBigInt(theory.value);
        expect(toHexString(writer.toArray())).toEqual(theory.hex);
        let reader = new ArrayReadableSyncStream(writer.toArray());
        let readerCodec = new ScaleCodecReader(reader);
        expect(readerCodec.ReadBigInt()).toEqual(theory.value);
        expect(() => reader.readByte()).toThrowError(EndOfStreamError);
    })
})