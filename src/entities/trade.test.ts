import { describe, expect, it } from 'vitest'

import { ChainId } from '../constants'
import { TokenAmount } from './fractions'
import { Pair } from './pair'
import { Token } from './token'
import { Trade } from './trade'
import { getChainById } from './chainList'

// Pins the deprecated search over the global chain list: the same pairs give the same top trades.
const eth = getChainById(ChainId.ETH_MAINNET)!
const token = (address: `0x${string}`, decimals: number, symbol: string) =>
    new Token({ chainId: ChainId.ETH_MAINNET, address, decimals, symbol })
const weth = eth.wrappedGasToken!
const usdc = token('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC')
const dai = token('0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI')
const usdt = token('0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT')
const amount = (t: Token, raw: string) => new TokenAmount(t, raw)
const pairs = [
    new Pair(amount(weth, '1000000000000000000000'), amount(usdc, '3000000000000')),
    new Pair(amount(weth, '500000000000000000000'), amount(dai, '1510000000000000000000000')),
    new Pair(amount(dai, '2000000000000000000000000'), amount(usdc, '2001000000000')),
    new Pair(amount(usdt, '1000000000000'), amount(usdc, '1000500000000')),
    new Pair(amount(usdt, '0'), amount(dai, '0')),
]

const show = (trades: Trade[]) =>
    trades.map((trade) => ({
        path: trade.route.path.map((t) => t.symbol).join('>'),
        pairs: trade.route.pairs.map((pair) => pair.liquidityToken.address).join(','),
        in: `${trade.inputAmount.raw} ${trade.inputAmount.token.symbol}`,
        out: `${trade.outputAmount.raw} ${trade.outputAmount.token.symbol}`,
        impact: trade.priceImpact.toFixed(6),
        breakdown: (({ priceImpactWithoutFee, realizedLPFee }) =>
            `${priceImpactWithoutFee.toFixed(6)} ${realizedLPFee.raw}`)(trade.priceBreakdown(30)),
    }))

describe('Trade.bestTradeExactIn/Out (deprecated)', () => {
    it.each([
        [weth, '10000000000000000000', usdt],
        [eth.gasToken, '1000000000000000000', usdc],
        [usdt, '1000000000', eth.gasToken],
        [dai, '1000000000000000000000', usdt],
        [usdt, '1', usdc],
    ])('finds the same trades from %s', (from, raw, to) => {
        const { trades, errors } = Trade.bestTradeExactIn(pairs, amount(from, raw), to, {
            maxHops: 3,
            maxNumResults: 3,
        })
        expect({ trades: show(trades), errors: errors.map((e) => e.name) }).toMatchSnapshot()
    })

    it.each([
        [weth, usdt, '1000000000'],
        [eth.gasToken, usdc, '2000000000'],
        [usdt, eth.gasToken, '1000000000000000000'],
        [dai, usdt, '5000000'],
    ])('finds the same trades from %s to an exact %s', (from, to, raw) => {
        expect(
            show(Trade.bestTradeExactOut(pairs, from, amount(to, raw), { maxHops: 3, maxNumResults: 3 }))
        ).toMatchSnapshot()
    })
})
