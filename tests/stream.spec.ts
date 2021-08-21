import * as Lib from '../src'
import { hexToBuffer } from './hexUtil'

it('reads bytes', () => {
  const reader = new Lib.ArrayReadableSyncStream(hexToBuffer('01020304'))
  expect(reader.readByte()).toEqual(1)
  expect(reader.readByte()).toEqual(2)
  expect(reader.readBytes(2)).toEqual(new Uint8Array([3, 4]))
  expect(() => reader.readByte()).toThrowError(Lib.EndOfStreamError)
  expect(() => reader.readBytes(2)).toThrowError(Lib.EndOfStreamError)
})

it('writes bytes', () => {
  const writer = new Lib.ArrayBufferWritableSyncStream()
  writer.writeByte(1)
  writer.writeByte(2)
  writer.writeBytes(new Uint8Array([3, 4, 5]), 0, 3)
  writer.writeByte(6)
  expect(writer.toArray()).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]))
})
