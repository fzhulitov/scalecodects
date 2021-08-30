import {CompactMode, CompactModeExtentions, MoreThan536Restricted, NegativValueRestricted} from "#CompactMode";


it("ShoudReturnCorrectNumberModes", () => {

    type pair = { mode: CompactMode; value: number }

    let dic: pair [] =
        [
            {mode: CompactMode.SINGLE, value: 0},
            {mode: CompactMode.SINGLE, value: 1},
            {mode: CompactMode.SINGLE, value: 10},
            {mode: CompactMode.SINGLE, value: 63},
            {mode: CompactMode.SINGLE, value: 0x3f},
            {mode: CompactMode.TWO, value: 64},
            {mode: CompactMode.TWO, value: 100},
            {mode: CompactMode.TWO, value: 1000},
            {mode: CompactMode.TWO, value: 10000},
            {mode: CompactMode.TWO, value: ((Math.pow(2, 14)) - 1)}, //16383},
            {mode: CompactMode.TWO, value: 0x3f_ff}, //16383},
            {mode: CompactMode.FOUR, value: 0x40_00},
            {mode: CompactMode.FOUR, value: Math.pow(2, 14)},
            {mode: CompactMode.FOUR, value: 100000},
            {mode: CompactMode.FOUR, value: 1000000},
            {mode: CompactMode.FOUR, value: Math.pow(2, 30) - 1},
            {mode: CompactMode.FOUR, value: 0x3f_ff_ff_ff},
            {mode: CompactMode.BIGINT, value: 0x40_00_00_00},
            {mode: CompactMode.BIGINT, value: Math.pow(2, 30)},
            {mode: CompactMode.BIGINT, value: Math.pow(2, 30) + 1},
            {mode: CompactMode.BIGINT, value: Number.MAX_SAFE_INTEGER},
        ]

    for (let val of dic) {
        let computed = CompactModeExtentions.GetCompactMode(val.value);
        expect(computed == val.mode);
    }
})

it("ShoudReturnCorrectBigIntModes", () => {

    type pair = { mode: CompactMode; value: bigint }

    let dic: pair [] =
        [
            {mode: CompactMode.SINGLE, value: 0n},
            {mode: CompactMode.SINGLE, value: 1n},
            {mode: CompactMode.SINGLE, value: 10n},
            {mode: CompactMode.SINGLE, value: 63n},
            {mode: CompactMode.SINGLE, value: 0x3fn},
            {mode: CompactMode.TWO, value: 64n},
            {mode: CompactMode.TWO, value: 100n},
            {mode: CompactMode.TWO, value: 1000n},
            {mode: CompactMode.TWO, value: 10000n},
            {mode: CompactMode.TWO, value: BigInt((Math.pow(2, 14)) - 1)}, //16383},
            {mode: CompactMode.TWO, value: 0x3f_ffn}, //16383},
            {mode: CompactMode.FOUR, value: 0x40_00n},
            {mode: CompactMode.FOUR, value: BigInt(Math.pow(2, 14))},
            {mode: CompactMode.FOUR, value: 100000n},
            {mode: CompactMode.FOUR, value: 1000000n},
            {mode: CompactMode.FOUR, value: BigInt(Math.pow(2, 30) - 1)},
            {mode: CompactMode.FOUR, value: 0x3f_ff_ff_ffn},
            {mode: CompactMode.BIGINT, value: 0x40_00_00_00n},
            {mode: CompactMode.BIGINT, value: BigInt(Math.pow(2, 30))},
            {mode: CompactMode.BIGINT, value: BigInt(Math.pow(2, 30) + 1)},
            {mode: CompactMode.BIGINT, value: BigInt(Number.MAX_SAFE_INTEGER)},
            {mode: CompactMode.BIGINT, value: BigInt(0xff_ff_ff_ff)},
            {mode: CompactMode.BIGINT, value: BigInt("12345678901234567890")},
        ]

    for (let val of dic) {
        let computed = CompactModeExtentions.GetCompactModeBig(val.value);
        expect(computed == val.mode);
    }
})

it("No mode for negative values", () => {
    expect(() => {CompactModeExtentions.GetCompactMode(-1)}).toThrowError(NegativValueRestricted);
    expect(() => {CompactModeExtentions.GetCompactModeBig(-1n)}).toThrowError(NegativValueRestricted);
})

it("No Mode for 536bit_int", () => {
    let str = "0x";
    let str2 = "ff".repeat(536);
    str = str.concat(str2);
    expect(()=>{CompactModeExtentions.GetCompactModeBig(BigInt(str))}).toThrowError(MoreThan536Restricted);

})
