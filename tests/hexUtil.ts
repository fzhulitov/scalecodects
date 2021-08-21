export function bufferToHex(array: Uint8Array): string {
  return [...array].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export function hexToBuffer(hexString: string) {
  return new Uint8Array(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))
}
