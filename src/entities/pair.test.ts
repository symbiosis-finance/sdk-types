import { describe, expect, it } from 'vitest'

import { parseEvmAddress } from '../addresses'
import { ChainId } from '../constants'
import { hardhatAddresses } from '../testing/localChain.fixture'
import { TokenAmount } from './fractions'
import { Pair } from './pair'
import { Token } from './token'

const [tokenA, tokenB] = hardhatAddresses
const local = parseEvmAddress(hardhatAddresses[2])

const token = (chainId: ChainId, address: `0x${string}`) => new Token({ address, chainId, decimals: 18, symbol: 'T' })
const amount = (chainId: ChainId, address: `0x${string}`, raw: number) =>
    new TokenAmount(token(chainId, address), String(raw))

describe('Pair', () => {
    it('derives a different address on each chain for the same token addresses', () => {
        const onEth = Pair.getAddress(token(ChainId.ETH_MAINNET, tokenA), token(ChainId.ETH_MAINNET, tokenB))
        const onBsc = Pair.getAddress(token(ChainId.BSC_MAINNET, tokenA), token(ChainId.BSC_MAINNET, tokenB))
        expect(onEth).not.toEqual(onBsc)
        expect(Pair.getAddress(token(ChainId.ETH_MAINNET, tokenB), token(ChainId.ETH_MAINNET, tokenA))).toEqual(onEth)
    })

    it('takes the address it is given', () => {
        const pair = new Pair(
            amount(ChainId.ETH_MAINNET, tokenA, 1_000_000),
            amount(ChainId.ETH_MAINNET, tokenB, 1_000_000),
            local
        )
        expect(pair.liquidityToken.address).toEqual(local)
    })

    it('keeps its address in the pair a swap leaves', () => {
        const pair = new Pair(
            amount(ChainId.ETH_MAINNET, tokenA, 1_000_000),
            amount(ChainId.ETH_MAINNET, tokenB, 1_000_000),
            local
        )
        const { pairAfter: afterOutput } = pair.getOutputAmount(amount(ChainId.ETH_MAINNET, tokenA, 1000))
        const { pairAfter: afterInput } = pair.getInputAmount(amount(ChainId.ETH_MAINNET, tokenB, 1000))
        expect(afterOutput.liquidityToken.address).toEqual(local)
        expect(afterInput.liquidityToken.address).toEqual(local)
    })
})
