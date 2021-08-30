export function bufferToHex(array: Uint8Array): string {
    return [...array].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export function hexToBuffer(hexString: string) {
    return new Uint8Array(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))
}

export function Unit8ArrayToBigint(arr: Uint8Array): bigint {

    return 0n
}

export function toHexString(byteArray: Uint8Array) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}