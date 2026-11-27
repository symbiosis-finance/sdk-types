import { describe, expect, it } from 'vitest'
import { ChainId } from '../constants'
import type { Token } from '../entities'
import { Symbiosis } from './symbiosis'
import type { OmniPoolConfig } from './types'

describe('Symbiosis chain override', () => {
    it('replaces the spare RPCs when the override lists them', () => {
        const symbiosis = new Symbiosis('mainnet', 'test', {
            chains: [
                {
                    id: ChainId.TRON_MAINNET,
                    rpc: 'https://tron-rpc.publicnode.com',
                    spareRpcs: ['https://api.trongrid.io'],
                },
            ],
        })

        const chainConfig = symbiosis.chainConfig(ChainId.TRON_MAINNET)
        expect(chainConfig.rpc).toBe('https://tron-rpc.publicnode.com')
        expect(chainConfig.spareRpcs).toEqual(['https://api.trongrid.io'])
    })

    it('keeps the configured spare RPCs when the override has none', () => {
        const configured = new Symbiosis('mainnet', 'test').chainConfig(ChainId.SEI_EVM_MAINNET).spareRpcs

        const symbiosis = new Symbiosis('mainnet', 'test', {
            chains: [{ id: ChainId.SEI_EVM_MAINNET, rpc: 'https://evm-rpc.sei-apis.com' }],
        })

        expect(configured?.length).toBeGreaterThan(0)
        expect(symbiosis.chainConfig(ChainId.SEI_EVM_MAINNET).spareRpcs).toEqual(configured)
    })
})

describe('Symbiosis transit tokens', () => {
    const symbiosis = new Symbiosis('mainnet', 'test')
    const chainIds = symbiosis.chains().map((chain) => chain.id)

    it('gives the pairs of transit tokens that differ, within the routing limits', () => {
        const pool = (address: string) => {
            const found = symbiosis.config.omniPools.find((poolConfig) => poolConfig.address === address)
            if (!found) throw new Error(`no pool ${address}`)
            return found
        }
        const stablePool = pool('0xC3255E317481B95A3e61844c274dE8BAF8eDF397')
        const wethPool = pool('0x2d877Fe148dBCB056Bf71ED5232E8d580195c0f1')
        const bnbPool = pool('0x095B362957B3E3638AE1eb7A957f392cD3Dc3c7C')
        const usdcEth = symbiosis.transitToken(ChainId.ETH_MAINNET, stablePool)
        const usdcBsc = symbiosis.transitToken(ChainId.BSC_MAINNET, stablePool)
        const wethEth = symbiosis.transitToken(ChainId.ETH_MAINNET, wethPool)
        const wethArbitrum = symbiosis.transitToken(ChainId.ARBITRUM_MAINNET, wethPool)
        const wbnbBsc = symbiosis.transitToken(ChainId.BSC_MAINNET, bnbPool)
        const ethereum = symbiosis.chains().find((chain) => chain.id === ChainId.ETH_MAINNET)
        if (!ethereum) throw new Error('no Ethereum')
        const cases: [OmniPoolConfig, Token, Token, boolean, boolean, string[]][] = [
            [stablePool, usdcEth, usdcBsc, false, false, ['USDC@1 > USDC@56']],
            [stablePool, usdcEth, usdcBsc, true, true, ['USDC@1 > USDC@56']],
            [stablePool, usdcEth, usdcEth, false, false, []],
            [stablePool, wethEth, usdcBsc, false, false, ['USDC@1 > USDC@56']],
            [stablePool, wethEth, usdcBsc, true, false, []],
            [stablePool, usdcEth, wbnbBsc, false, false, ['USDC@1 > USDC@56']],
            [stablePool, usdcEth, wbnbBsc, false, true, []],
            [wethPool, ethereum.gasToken, wethArbitrum, true, true, ['WETH@1 > WETH@42161']],
        ]
        for (const [poolConfig, tokenIn, tokenOut, disableSrcChainRouting, disableDstChainRouting, expected] of cases) {
            const combinations = symbiosis.getTransitCombinations({
                poolConfig,
                tokenIn,
                tokenOut,
                disableSrcChainRouting,
                disableDstChainRouting,
            })
            expect(
                combinations.map(({ transitTokenIn, transitTokenOut }) => `${transitTokenIn} > ${transitTokenOut}`),
                `${tokenIn} to ${tokenOut}, routing off: ${disableSrcChainRouting}, ${disableDstChainRouting}`
            ).toEqual(expected)
        }
    })

    it('gives the first transit token off the pool’s chain, and the chain’s first token on it', () => {
        for (const poolConfig of symbiosis.config.omniPools) {
            for (const id of chainIds) {
                const transit = symbiosis.transitTokens(id, poolConfig)
                if (id === poolConfig.chainId) {
                    expect(symbiosis.transitToken(id, poolConfig).symbol).toBe('WSIS')
                } else if (transit.length > 0) {
                    expect(symbiosis.transitToken(id, poolConfig)).toBe(transit[0])
                } else {
                    expect(() => symbiosis.transitToken(id, poolConfig)).toThrow(/Cannot find/)
                }
            }
        }
    })
})
