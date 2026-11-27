import { describe, expect, it } from 'vitest'

import { ChainId } from '../constants'
import { isValidRecipientAddress, normalizeRecipientAddress } from './addressValidation'

describe('recipient addresses', () => {
    it('takes a Bitcoin Cash address with or without its scheme prefix', () => {
        const cashAddr = 'qq07l6rr5lsdm3m80qxw80ku2ex0tj76vvsxpvmp6p'
        expect(normalizeRecipientAddress(ChainId.BCH_MAINNET, `bitcoincash:${cashAddr}`)).toBe(cashAddr)
        expect(normalizeRecipientAddress(ChainId.ETH_MAINNET, 'bitcoincash:x')).toBe('bitcoincash:x')
        expect(isValidRecipientAddress(ChainId.BCH_MAINNET, `bitcoincash:${cashAddr}`)).toBe(true)
        expect(isValidRecipientAddress(ChainId.BCH_MAINNET, cashAddr)).toBe(true)
    })

    it('takes the Bitcoin Cash scheme prefix in any case, once, before a CashAddr or a legacy address', () => {
        const cashAddr = 'qq07l6rr5lsdm3m80qxw80ku2ex0tj76vvsxpvmp6p'
        const legacy = '1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu'
        expect(isValidRecipientAddress(ChainId.BCH_MAINNET, `BitcoinCash:${cashAddr}`)).toBe(true)
        expect(isValidRecipientAddress(ChainId.BCH_MAINNET, legacy)).toBe(true)
        expect(isValidRecipientAddress(ChainId.BCH_MAINNET, `bitcoincash:${legacy}`)).toBe(true)
        expect(isValidRecipientAddress(ChainId.BCH_MAINNET, `bitcoincash:bitcoincash:${cashAddr}`)).toBe(false)
        expect(isValidRecipientAddress(ChainId.BCH_MAINNET, 'bitcoincash:')).toBe(false)
        expect(isValidRecipientAddress(ChainId.BCH_MAINNET, `bitcoin:${cashAddr}`)).toBe(false)
    })

    it('checks a chain’s address format where it has one, and only that it is not empty elsewhere', () => {
        expect(isValidRecipientAddress(ChainId.XRP_MAINNET, 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH')).toBe(true)
        expect(isValidRecipientAddress(ChainId.XRP_MAINNET, '0x0000000000000000000000000000000000000001')).toBe(false)
        expect(isValidRecipientAddress(ChainId.ETH_MAINNET, 'anything')).toBe(true)
        expect(isValidRecipientAddress(ChainId.ETH_MAINNET, '')).toBe(false)
    })
})
