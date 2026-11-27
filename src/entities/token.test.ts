import { describe, expect, expectTypeOf, it } from 'vitest'

import { ChainId } from '../constants'
import type { Address } from '../crosschain/types'
import { Deployment, type DeployedChain } from '../crosschain/deployment'
import type { DeployedToken } from '../crosschain/deployedToken'
import { TokenAmount } from './fractions'
import { getChainById } from './chainList'
import type { Chain } from './chain'
import { Token } from './token'

const USDC = {
    chainId: ChainId.ETH_MAINNET,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
} as const

// The types are checked by tsc; each test also checks the value they describe.
describe('a token knows its chain', () => {
    it('as a deployed chain, when built on one', () => {
        const ethereum = Deployment.named('mainnet').chain(ChainId.ETH_MAINNET)
        const usdc = new Token(ethereum, USDC)
        expectTypeOf(usdc.chain).toEqualTypeOf<DeployedChain>()
        expect(usdc.chain).toBe(ethereum)
    })

    it("as a chain's own gas tokens, wrapped or not, and their amounts", () => {
        const ethereum = Deployment.named('mainnet').chain(ChainId.ETH_MAINNET)
        expectTypeOf(ethereum.gasToken).toEqualTypeOf<Token<DeployedChain>>()
        expectTypeOf(ethereum.gasToken.wrapped.chain).toEqualTypeOf<DeployedChain>()
        const weth = new TokenAmount(ethereum.gasToken, '1').wrapped
        expectTypeOf(weth.token.chain).toEqualTypeOf<DeployedChain>()
        // what Token.wrapped's cast relies on
        expect(ethereum.gasToken.chain).toBe(ethereum)
        expect(ethereum.wrappedGasToken?.chain).toBe(ethereum)
        expect(weth.token).toBe(ethereum.wrappedGasToken)
    })

    it("as a deployment's token", () => {
        const [token] = Deployment.named('mainnet').chain(ChainId.ETH_MAINNET).tokens()
        expectTypeOf(token).toExtend<Token<DeployedChain>>()
        expectTypeOf(token.chain).toEqualTypeOf<DeployedChain>()
    })

    it('as a plain chain, when built on one', () => {
        const ethereum = getChainById(ChainId.ETH_MAINNET)!
        const usdc = new Token(ethereum, USDC)
        expectTypeOf(usdc.chain).toEqualTypeOf<Chain>()
        expect(usdc.chain).toBe(ethereum)
    })

    it('maybe not, when built without one (deprecated)', () => {
        const usdc = new Token(USDC)
        expectTypeOf(usdc).toEqualTypeOf<Token>()
        expectTypeOf(usdc.chain).toEqualTypeOf<Chain | undefined>()
        expect(usdc.chain?.id).toBe(ChainId.ETH_MAINNET)
    })

    it('and goes wherever a plain Token is taken', () => {
        const ethereum = Deployment.named('mainnet').chain(ChainId.ETH_MAINNET)
        expectTypeOf<Token<DeployedChain>>().toExtend<Token>()
        expectTypeOf<DeployedToken>().toExtend<Token>()
        expectTypeOf<TokenAmount<Token<DeployedChain>>>().toExtend<TokenAmount>()
        expectTypeOf<Token>().not.toExtend<Token<Chain>>()
        expectTypeOf<Token<Chain>>().not.toExtend<Token<DeployedChain>>()
        expect(new Token(USDC).equals(new Token(ethereum, USDC))).toBe(true)
    })
})

describe('a token of a chain sdk-types does not know', () => {
    const unknown = { ...USDC, chainId: 999_999_999 as ChainId }

    it('has its address checksummed by EIP-55, and keeps an empty one', () => {
        expect(new Token(unknown).chain).toBeUndefined()
        const lowercase = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
        expect(new Token({ ...unknown, address: lowercase }).address).toBe(USDC.address)
        expect(new Token({ ...unknown, address: '' }).address).toBe('')
    })

    it('errors on an address that is not 0x', () => {
        // Raw input that no address type admits.
        expect(() => new Token({ ...unknown, address: 'not an address' as Address })).toThrow()
    })
})
