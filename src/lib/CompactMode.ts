
export enum CompactMode {
    SINGLE =  0b00,
    TWO =  0b01,
    FOUR =  0b10,
    BIGINT =  0b11
}

export class NegativValueRestricted extends Error {}
export class MoreThan536Restricted extends Error {}

export class CompactModeExtentions {
    private static  MaxValue = BigInt( Math.pow(2,536)-1 );
    public static GetCompactMode (number: number) : CompactMode {
    
        if (number<0) throw new NegativValueRestricted("Negative numbers are not supported");

        if (number <= 0x3f)
            return CompactMode.SINGLE;
        if (number <= 0x3fff)
            return CompactMode.TWO;
        if (number <= 0x3fffffff)
            return CompactMode.FOUR;
        return CompactMode.BIGINT;
        
    }
    public static GetCompactModeBig (number: bigint) : CompactMode {

        if (number<0) throw new NegativValueRestricted("Negative numbers are not supported");

        if (number > CompactModeExtentions.MaxValue)
            throw new MoreThan536Restricted("Numbers larger than 2**536-1 are not supported");

        if (number <= 0x3f)
            return CompactMode.SINGLE;
        if (number <= 0x3fff)
            return CompactMode.TWO;
        if (number <= 0x3fffffff)
            return CompactMode.FOUR;
        return CompactMode.BIGINT;

    }
}