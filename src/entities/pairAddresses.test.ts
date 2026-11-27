import { describe, expect, it } from 'vitest'

import { parseEvmAddress } from '../addresses'
import { ChainId } from '../constants'
import { chainData } from '../crosschain/chainData'
import { chainDataSchema } from '../crosschain/types'
import { getZkCreate2Address, pairAddressesOf } from './pairAddresses'

describe('pairAddressesOf', () => {
    it('derives the Uniswap V2 pair of USDC and WETH on Ethereum', () => {
        const pairAddressOf = pairAddressesOf(chainData(ChainId.ETH_MAINNET))
        expect(
            pairAddressOf(
                parseEvmAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
                parseEvmAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
            )
        ).toBe('0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc')
    })

    it('derives a pair on Tron', () => {
        const pairAddressOf = pairAddressesOf(chainData(ChainId.TRON_MAINNET))
        expect(
            pairAddressOf(
                parseEvmAddress('0x891cdb91d149f23B1a45D9c5Ca78a88d0cB44C18'),
                parseEvmAddress('0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C')
            )
        ).toBe('0x3A10321A4E97a64D9376aF42Ec07D5fa50294b35')
    })

    it('returns a listed pair checksummed for its tokens in either order, and errors for an unlisted pair', () => {
        const token0 = parseEvmAddress('0x1111111111111111111111111111111111111111')
        const token1 = parseEvmAddress('0x2222222222222222222222222222222222222222')
        const pair = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'
        const data = chainDataSchema.parse({
            ...chainData(ChainId.ETH_MAINNET),
            uniswapV2: { pairs: [{ token0, token1, pair: pair.toLowerCase() as `0x${string}` }] },
        })
        const pairAddressOf = pairAddressesOf(data)
        expect(pairAddressOf(token0, token1)).toBe(pair)
        expect(pairAddressOf(token1, token0)).toBe(pair)
        expect(() => pairAddressOf(token0, parseEvmAddress('0x3333333333333333333333333333333333333333'))).toThrow()
    })
})

describe('getZkCreate2Address', () => {
    const uniswapV2 = chainData(ChainId.CRONOS_ZK_MAINNET).uniswapV2
    if (!('factory' in uniswapV2)) throw new Error('Cronos zkEVM lists no Uniswap V2 factory')
    const { factory, initCodeHash } = uniswapV2

    it('derives the pairs that were listed by hand, and any other', () => {
        const listed: Record<string, string> = {
            '0x10dac1b69a0ef99baf5786f77bf0aab84749fd564007f4fad53a9395afa06d6a':
                '0x20eDB5049461c9a6F490671742824c9F9aD05eD8',
            '0xdaa80bb10d1689abf76a659ce2e4b2c7e859fca2d05933a3d81c3636c0ef62f0':
                '0x006022eb9de7869e84f021605Ae23bE6C7D2d952',
            '0x91965e804433f989e92a043ea20a588fec7c4ca4ce64a380d6215f3992eadbb6':
                '0xA61947027caDbe9505d2a40E73EB21CB957e2daD',
        }
        for (const [salt, pair] of Object.entries(listed)) {
            expect(getZkCreate2Address(factory, salt, initCodeHash)).toBe(pair)
        }
        expect(getZkCreate2Address(factory, `0x${'1'.repeat(64)}`, initCodeHash)).toMatch(/^0x[0-9a-fA-F]{40}$/)
    })
})
