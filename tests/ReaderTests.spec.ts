import {ScaleCodecReader} from "../src/Readers/ScaleCodecReader";
import {ArrayReadableSyncStream, EndOfStreamError} from "#stream";
import {hexToBuffer} from "./hexUtil";
import {CompactMode} from "#CompactMode";

it ("Should Read Byte", ()=>{
    let codec = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer("45")));
    expect(codec.ReadByte()).toEqual(69);
    expect(()=>codec.ReadByte()).toThrowError(EndOfStreamError);
})

it ("Should Read Uint16", ()=>{
    let codec = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer("2a00")));
    expect(codec.ReadUint16()).toEqual(42);
    expect(()=>codec.ReadByte()).toThrowError(EndOfStreamError);
})

it ("Should Read Bool", ()=>{
    let codec = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer("00")));
    expect(codec.ReadBool()).toEqual(false);
    expect(()=>codec.ReadByte()).toThrowError(EndOfStreamError);
    let codec2 = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer("01")));
    expect(codec2.ReadBool()).toEqual(true);
    expect(()=>codec2.ReadByte()).toThrowError(EndOfStreamError);
})

it ("Should Read Nullable Bool", ()=>{
    let codec = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer("00")));
    expect(codec.ReadNullableBool()).toEqual(null);
    expect(()=>codec.ReadByte()).toThrowError(EndOfStreamError);
    let codec2 = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer("01")));
    expect(codec2.ReadNullableBool()).toEqual(true);
    expect(()=>codec2.ReadByte()).toThrowError(EndOfStreamError);
    let codec3 = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer("02")));
    expect(codec3.ReadNullableBool()).toEqual(false);
    expect(()=>codec3.ReadByte()).toThrowError(EndOfStreamError);
})

it("Should read Bigint", ()=>{
    type pair = { hex: string; value: bigint }
    let pairs: pair[] = 
    [
        {hex: "00",value: 0n},
            {hex: "04",value: 1n},
            {hex: "a8",value: 42n},
            {hex: "fc",value: 63n},
            {hex: "0101",value: 64n},
            {hex: "1501",value: 69n},
            {hex: "fdff",value: 16383n},
            {hex: "02000100",value: 16384n},
            {hex: "feffffff",value: 0x3f_ff_ff_ffn},
            {hex: "0300000040",value: 0x40_00_00_00n},
            {hex: "0370605040",value: 0x40_50_60_70n},
            {hex: "03000000ff",value: 0xff_00_00_00n},
            {hex: "030000ffff",value: 0xff_ff_00_00n},
            {hex: "03ffffffff",value: 0xff_ff_ff_ffn},
            {hex: "0700ffffffff",value: 0xffffffff00n},
        {hex: "07ffffffffff",value: 0xffffffffffn},
        {hex:"33aabbccddeeff00112233445566778899",
            value:  BigInt("0x99887766554433221100ffeeddccbbaa")}
//                hexToBuffer("99887766554433221100ffeeddccbbaa"))}
    ]
    for (let val of pairs) {
        let codec = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer(val.hex)));
           expect(codec.ReadBigInt()).toEqual(val.value);
        expect(()=>codec.ReadByte()).toThrowError(EndOfStreamError);
    }
    
})

it ("Should read string",()=>{
    let codec = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer("3048656c6c6f20576f726c6421")));
    expect(codec.ReadString()).toEqual("Hello World!");
    expect(()=>codec.ReadByte()).toThrowError(EndOfStreamError);
})

it ("Should read byte array", ()=>{
    let codec = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer(            "a8".concat("00".repeat(42)) )));
    expect(codec.ReadByteArray()).toEqual(hexToBuffer("00".repeat(42)));
    expect(()=>codec.ReadByte()).toThrowError(EndOfStreamError);
})

it ("Should skip some byte ", ()=>{
    let codec = new ScaleCodecReader(new ArrayReadableSyncStream(hexToBuffer(            "00".repeat(42) )));
    expect(()=>codec.Skip(43)).toThrowError(EndOfStreamError);
    expect(()=>codec.Skip(42)).not.toThrowError(EndOfStreamError);
    expect(()=>codec.ReadByte()).toThrowError(EndOfStreamError);
})
