import { describe, expect, it } from 'vitest'

import { parseEvmAddress } from '../addresses'
import { InsufficientInputAmountError, InsufficientReservesError } from '../errors'
import { hardhatAddresses, LOCAL, localChainData } from '../testing/localChain.fixture'
import { Chain } from './chain'
import { TokenAmount } from './fractions'
import { Pair } from './pair'
import { PairGraph } from './pairGraph'
import { Token } from './token'

const [, usdAddress, daiAddress, btcAddress] = hardhatAddresses
const chain = new Chain(localChainData())
const weth = chain.wrappedGasToken!
const usd = new Token(chain, { chainId: LOCAL, address: usdAddress, decimals: 6, symbol: 'USD' })
const dai = new Token(chain, { chainId: LOCAL, address: daiAddress, decimals: 18, symbol: 'DAI' })
const btc = new Token(chain, { chainId: LOCAL, address: btcAddress, decimals: 8, symbol: 'BTC' })
const amount = (token: Token, raw: string) => new TokenAmount(token, raw)
const pair = (a: TokenAmount, b: TokenAmount, n: number) =>
    new Pair(a, b, parseEvmAddress(`0x${n.toString(16).padStart(40, '0')}`))
// ETH -> USD only through DAI
const ethDai = pair(amount(weth, '1000000000000000000000'), amount(dai, '2000000000000000000000000'), 1)
const daiUsd = pair(amount(dai, '1000000000000000000000000'), amount(usd, '1000000000000'), 2)
const graph = new PairGraph(chain, [ethDai, daiUsd])

describe('PairGraph', () => {
    it('finds a trade of several hops, from and to the gas token', () => {
        const { trades, errors } = graph.bestTradesExactIn(amount(chain.gasToken, '1000000000000000000'), usd)
        expect(errors).toEqual([])
        expect(trades).toHaveLength(1)
        expect(trades[0].route.path.map((token) => token.symbol)).toEqual(['WETH', 'DAI', 'USD'])
        expect(trades[0].inputAmount.token).toBe(chain.gasToken)

        const [exactOut] = graph.bestTradesExactOut(chain.gasToken, amount(usd, '1000000')).trades
        expect(exactOut.route.path.map((token) => token.symbol)).toEqual(['WETH', 'DAI', 'USD'])
        expect(exactOut.outputAmount.raw.toString()).toBe('1000000')
    })

    it('rejects a search for no trades, even when no route exists', () => {
        expect(() => graph.bestTradesExactIn(amount(usd, '1'), usd, { maxNumResults: 0 })).toThrow('MAX_NUM_RESULTS')
    })

    it('takes no more hops than allowed', () => {
        expect(graph.bestTradesExactIn(amount(weth, '1000000000000000000'), usd, { maxHops: 1 }).trades).toEqual([])
    })

    it('says why the amount cannot start through a pair: too little in, or more out than it holds', () => {
        // one wei of DAI is worth less than a unit of either other token
        const exactIn = graph.bestTradesExactIn(amount(dai, '1'), usd)
        expect(exactIn.trades).toEqual([])
        expect(exactIn.errors).toHaveLength(2)
        for (const error of exactIn.errors) expect(error).toBeInstanceOf(InsufficientInputAmountError)

        const exactOut = graph.bestTradesExactOut(weth, amount(usd, '1000000000000'))
        expect(exactOut.trades).toEqual([])
        expect(exactOut.errors[0]).toBeInstanceOf(InsufficientReservesError)
    })
})

// several routes between each two tokens, through pairs of different depth and price
const web = new PairGraph(chain, [
    ethDai,
    daiUsd,
    pair(amount(weth, '500000000000000000000'), amount(usd, '1010000000000'), 3),
    pair(amount(weth, '2000000000000000000000'), amount(btc, '10000000000'), 4),
    pair(amount(btc, '1000000000'), amount(usd, '1000000000000'), 5),
    pair(amount(dai, '3000000000000000000000000'), amount(btc, '3000000000'), 6),
    pair(amount(usd, '1'), amount(dai, '1'), 7),
])
const summary = ({ trades, errors }: ReturnType<PairGraph['bestTradesExactIn']>) => ({
    trades: trades.map((trade) => [
        trade.route.path.map((token) => token.symbol).join('>'),
        trade.inputAmount.raw.toString(),
        trade.outputAmount.raw.toString(),
    ]),
    errors: errors.map((error) => error.constructor.name),
})

describe('PairGraph search', () => {
    it('keeps its results over several routes', () => {
        expect({
            in: summary(web.bestTradesExactIn(amount(weth, '1000000000000000000'), usd)),
            inAll: summary(web.bestTradesExactIn(amount(usd, '1000000000'), weth, { maxNumResults: 10 })),
            inOneHop: summary(web.bestTradesExactIn(amount(dai, '1000000000000000000000'), btc, { maxHops: 1 })),
            inTwoHops: summary(
                web.bestTradesExactIn(amount(chain.gasToken, '3000000000000000000'), dai, {
                    maxHops: 2,
                    maxNumResults: 5,
                })
            ),
            inTiny: summary(web.bestTradesExactIn(amount(usd, '1'), btc, { maxNumResults: 10 })),
            out: summary(web.bestTradesExactOut(weth, amount(usd, '1000000'))),
            outAll: summary(web.bestTradesExactOut(btc, amount(dai, '1000000000000000000'), { maxNumResults: 10 })),
            outTwoHops: summary(
                web.bestTradesExactOut(usd, amount(chain.gasToken, '1000000000000000'), { maxHops: 2 })
            ),
            outHuge: summary(web.bestTradesExactOut(weth, amount(usd, '2000000000000'), { maxNumResults: 10 })),
        }).toMatchInlineSnapshot(`
          {
            "in": {
              "errors": [],
              "trades": [
                [
                  "WETH>BTC>USD",
                  "1000000000000000000",
                  "4943013693",
                ],
                [
                  "WETH>BTC>DAI>USD",
                  "1000000000000000000",
                  "4920150822",
                ],
                [
                  "WETH>USD",
                  "1000000000000000000",
                  "2009932195",
                ],
              ],
            },
            "inAll": {
              "errors": [
                "InsufficientInputAmountError",
              ],
              "trades": [
                [
                  "USD>DAI>WETH",
                  "1000000000",
                  "496263080724214160",
                ],
                [
                  "USD>BTC>DAI>WETH",
                  "1000000000",
                  "494610902829445159",
                ],
                [
                  "USD>WETH",
                  "1000000000",
                  "493077625353982257",
                ],
                [
                  "USD>BTC>WETH",
                  "1000000000",
                  "198583876663953742",
                ],
                [
                  "USD>DAI>BTC>WETH",
                  "1000000000",
                  "197922797344624905",
                ],
              ],
            },
            "inOneHop": {
              "errors": [
                "InsufficientInputAmountError",
              ],
              "trades": [
                [
                  "DAI>BTC",
                  "1000000000000000000000",
                  "996668",
                ],
              ],
            },
            "inTiny": {
              "errors": [
                "InsufficientInputAmountError",
                "InsufficientInputAmountError",
              ],
              "trades": [],
            },
            "inTwoHops": {
              "errors": [],
              "trades": [
                [
                  "WETH>BTC>DAI",
                  "3000000000000000000",
                  "14814351947377484857435",
                ],
                [
                  "WETH>DAI",
                  "3000000000000000000",
                  "5964161193869137410006",
                ],
                [
                  "WETH>USD>DAI",
                  "3000000000000000000",
                  "5952233838138319111699",
                ],
              ],
            },
            "out": {
              "errors": [
                "InsufficientReservesError",
              ],
              "trades": [
                [
                  "WETH>BTC>USD",
                  "201404232858899",
                  "1000000",
                ],
                [
                  "WETH>BTC>DAI>USD",
                  "202006038396171",
                  "1000000",
                ],
                [
                  "WETH>USD",
                  "496539613940828",
                  "1000000",
                ],
              ],
            },
            "outAll": {
              "errors": [
                "InsufficientReservesError",
              ],
              "trades": [
                [
                  "BTC>DAI",
                  "1004",
                  "1000000000000000000",
                ],
                [
                  "BTC>USD>DAI",
                  "1007",
                  "1000000000000000000",
                ],
                [
                  "BTC>USD>WETH>DAI",
                  "1020",
                  "1000000000000000000",
                ],
                [
                  "BTC>WETH>USD>DAI",
                  "2498",
                  "1000000000000000000",
                ],
                [
                  "BTC>WETH>DAI",
                  "2516",
                  "1000000000000000000",
                ],
              ],
            },
            "outHuge": {
              "errors": [
                "InsufficientReservesError",
                "InsufficientReservesError",
                "InsufficientReservesError",
                "InsufficientReservesError",
              ],
              "trades": [],
            },
            "outTwoHops": {
              "errors": [],
              "trades": [
                [
                  "USD>DAI>WETH",
                  "2012061",
                  "1000000000000000",
                ],
                [
                  "USD>WETH",
                  "2026083",
                  "1000000000000000",
                ],
                [
                  "USD>BTC>WETH",
                  "5031119",
                  "1000000000000000",
                ],
              ],
            },
          }
        `)
    })
})
