import invariant from 'tiny-invariant'

import { TradeType } from '../constants'
import { InsufficientInputAmountError, InsufficientReservesError } from '../errors'
import { bestOf } from '../utils'
import type { Chain } from './chain'
import type { TokenAmount } from './fractions'
import type { Pair } from './pair'
import { Route } from './route'
import type { Token } from './token'
import { Trade, tradeComparator } from './trade'

export interface BestTradeOptions {
    /** The number of trades to return, at most. Defaults to 3. */
    maxNumResults?: number
    /** The number of pairs a trade goes through, at most. Defaults to 3. */
    maxHops?: number
}

export type SwapError = InsufficientInputAmountError | InsufficientReservesError

/** The best trades a search found, and why the amount could not start through some pairs. */
export interface BestTrades {
    /** Best first, as tradeComparator ranks them. */
    trades: Trade[]
    /**
     * The error of each pair that holds the exact amount's token and has both reserves, but cannot swap the amount.
     * That token is the input of an exact-in search and the output of an exact-out one.
     */
    errors: SwapError[]
}

/**
 * Uniswap V2 pairs on one chain, searched for the best trades between two tokens. The graph only finds routes, and each
 * Trade does its own swaps (svc-symbiosis-api task rdyrn, State). A trade takes one route, so a split among routes
 * could do better.
 */
export class PairGraph {
    public constructor(
        public readonly chain: Chain,
        public readonly pairs: readonly Pair[]
    ) {
        invariant(
            pairs.every((pair) => pair.chainId === chain.id),
            'CHAIN_IDS'
        )
    }

    /** Returns the best trades from the exact `amountIn` to `tokenOut`. */
    public bestTradesExactIn(amountIn: TokenAmount, tokenOut: Token, options: BestTradeOptions = {}): BestTrades {
        return this.bestTrades(amountIn.token, tokenOut, amountIn, TradeType.EXACT_INPUT, options)
    }

    /** Returns the best trades from `tokenIn` to the exact `amountOut`. */
    public bestTradesExactOut(tokenIn: Token, amountOut: TokenAmount, options: BestTradeOptions = {}): BestTrades {
        return this.bestTrades(tokenIn, amountOut.token, amountOut, TradeType.EXACT_OUTPUT, options)
    }

    private bestTrades(
        input: Token,
        output: Token,
        amount: TokenAmount,
        type: TradeType,
        { maxNumResults = 3, maxHops = 3 }: BestTradeOptions
    ): BestTrades {
        invariant(maxHops > 0, 'MAX_HOPS')
        invariant(maxNumResults > 0, 'MAX_NUM_RESULTS')
        const trade = (route: Route) => tryTrade(route, amount, type)
        const routes = Array.from(
            paths(this.pairs, input.wrapped, output.wrapped, maxHops),
            (path) => new Route(this.chain, path, input, output)
        )
        return {
            trades: bestOf(routes.map(trade).filter(isTrade), maxNumResults, tradeComparator),
            errors: this.firstHops(input, output, amount, type).map(trade).filter(isError),
        }
    }

    private firstHops(input: Token, output: Token, amount: TokenAmount, type: TradeType): Route[] {
        const exact = amount.token.wrapped
        return this.pairs
            .filter((pair) => holds(pair, exact))
            .map((pair) => {
                const other = pair.otherToken(exact)
                const [from, to] = type === TradeType.EXACT_INPUT ? [input, other] : [other, output]
                return new Route(this.chain, [pair], from, to)
            })
    }
}

// Each path from `from` to `to` through `pairs`, each pair at most once, of at most `hops` pairs, in the order of
// the search, which ranks equal trades.
function* paths(pairs: readonly Pair[], from: Token, to: Token, hops: number): Generator<Pair[]> {
    for (const [i, pair] of pairs.entries()) {
        if (!pair.involvesToken(from)) continue
        const next = pair.otherToken(from)
        if (next.equals(to)) {
            yield [pair]
        } else if (hops > 1 && pairs.length > 1) {
            const others = pairs.slice(0, i).concat(pairs.slice(i + 1))
            for (const path of paths(others, next, to, hops - 1)) yield [pair, ...path]
        }
    }
}

// Whether a swap can start through `pair` from `token`: it holds the token, and neither reserve is empty.
function holds(pair: Pair, token: Token): boolean {
    return pair.involvesToken(token) && !pair.isEmpty
}

// The trade along `route`, or the error when a pair on it cannot take the amount.
function tryTrade(route: Route, amount: TokenAmount, type: TradeType): Trade | SwapError {
    try {
        return new Trade(route, amount, type)
    } catch (error) {
        if (error instanceof InsufficientInputAmountError || error instanceof InsufficientReservesError) return error
        throw error
    }
}

function isTrade(tried: Trade | SwapError): tried is Trade {
    return tried instanceof Trade
}

function isError(tried: Trade | SwapError): tried is SwapError {
    return !(tried instanceof Trade)
}
