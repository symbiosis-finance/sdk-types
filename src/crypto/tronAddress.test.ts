import { describe, expect, it } from 'vitest'
import { tronAddressToEvm } from './tronAddress'

describe('tronAddressToEvm', () => {
  it('converts a base58 TRON address to a 0x EVM address', () => {
    expect(tronAddressToEvm('TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR')).toBe(
      '0x891cdb91d149f23b1a45d9c5ca78a88d0cb44c18'
    )
  })

  it('passes a 41-hex address through to 0x', () => {
    expect(tronAddressToEvm('41891cdb91d149f23b1a45d9c5ca78a88d0cb44c18')).toBe(
      '0x891cdb91d149f23b1a45d9c5ca78a88d0cb44c18'
    )
  })

  it('throws on a bad-checksum TRON address (last char changed)', () => {
    // TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR with last char R -> S
    expect(() => tronAddressToEvm('TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFS')).toThrow()
  })

  it('throws on a too-short input', () => {
    // A very short string that is valid base58 characters but too short to be a real TRON address
    expect(() => tronAddressToEvm('TNUC9Qb1')).toThrow()
  })
})
