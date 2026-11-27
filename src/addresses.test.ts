import { describe, expect, expectTypeOf, it } from 'vitest'
import { ZodError } from 'zod'

import { type EvmAddress, evmAddressSchema, parseEvmAddress, ZERO_EVM_ADDRESS } from './addresses'

const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

describe('EvmAddress', () => {
    it('is made by a parser, not from a string literal', () => {
        expectTypeOf(WETH).not.toExtend<EvmAddress>()
        expectTypeOf(parseEvmAddress(WETH)).toEqualTypeOf<EvmAddress>()
        expectTypeOf(evmAddressSchema.parse(WETH)).toEqualTypeOf<EvmAddress>()
        expectTypeOf(parseEvmAddress(WETH)).toExtend<string>()
    })
})

describe('evmAddressSchema', () => {
    it('parses lowercase and EIP-55 text into EIP-55', () => {
        expect(evmAddressSchema.parse(WETH.toLowerCase())).toBe(WETH)
        expect(evmAddressSchema.parse(WETH)).toBe(WETH)
    })

    it('reports a zod issue for text that is not an address', () => {
        const wrongCase = WETH.replace('C02aaA', 'C02AAA')
        for (const text of [wrongCase, '', '0x1234', WETH.slice(2)]) {
            expect(() => evmAddressSchema.parse(text)).toThrow(ZodError)
        }
        expect(evmAddressSchema.safeParse(wrongCase).error?.issues[0].message).toBe(
            `${wrongCase} is not a valid address.`
        )
    })
})

describe('ZERO_EVM_ADDRESS', () => {
    it('is the parsed zero address, equal to a parsed zero address in data', () => {
        expectTypeOf(ZERO_EVM_ADDRESS).toEqualTypeOf<EvmAddress>()
        expect(ZERO_EVM_ADDRESS).toBe(parseEvmAddress('0x0000000000000000000000000000000000000000'))
    })
})
