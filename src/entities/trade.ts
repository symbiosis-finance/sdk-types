import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { ONE, TradeType, ZERO } from '../constants'
import { Fraction } from './fractions/fraction'
import { basisPointsToPercent, Percent } from './fractions/percent'
import { Price } from './fractions/price'
import { TokenAmount } from './fractions/tokenAmount'
import type { Pair } from './pair'
import { type BestTradeOptions, type BestTrades, PairGraph } from './pairGraph'
import { Route } from './route'
import type { Token } from './token'
import { WETH } from './token'

/**
 * Returns the percent difference between the mid price and the execution price, i.e. price impact.
 * @param midPrice mid price before the trade
 * @param inputAmount the input amount of the trade
 * @param outputAmount the output amount of the trade
 */
function computePriceImpact(midPrice: Price, inputAmount: TokenAmount, outputAmount: TokenAmount): Percent {
    const exactQuote = midPrice.raw.multiply(inputAmount.raw)
    // calculate slippage := (exactQuote - outputAmount) / exactQuote
    const slippage = exactQuote.subtract(outputAmount.raw).divide(exactQuote)
    return new Percent(slippage.numerator, slippage.denominator)
}

// minimal interface so the input output comparator may be shared across types
interface InputOutput {
    readonly inputAmount: TokenAmount
    readonly outputAmount: TokenAmount
}

// comparator function that allows sorting trades by their output amounts, in decreasing order, and then input amounts
// in increasing order. i.e. the best trades have the most outputs for the least inputs and are sorted first
export function inputOutputComparator(a: InputOutput, b: InputOutput): number {
    // must have same input and output token for comparison
    invariant(a.inputAmount.token.equals(b.inputAmount.token), 'INPUT_CURRENCY')
    invariant(a.outputAmount.token.equals(b.outputAmount.token), 'OUTPUT_CURRENCY')
    if (a.outputAmount.equalTo(b.outputAmount)) {
        if (a.inputAmount.equalTo(b.inputAmount)) {
            return 0
        }
        // trade A requires less input than trade B, so A should come first
        if (a.inputAmount.lessThan(b.inputAmount)) {
            return -1
        } else {
            return 1
        }
    } else {
        // tradeA has less output than trade B, so should come second
        if (a.outputAmount.lessThan(b.outputAmount)) {
            return 1
        } else {
            return -1
        }
    }
}

// extension of the input output comparator that also considers other dimensions of the trade in ranking them
export function tradeComparator(a: Trade, b: Trade) {
    const ioComp = inputOutputComparator(a, b)
    if (ioComp !== 0) {
        return ioComp
    }

    // consider lowest slippage next, since these are less likely to fail
    if (a.priceImpact.lessThan(b.priceImpact)) {
        return -1
    } else if (a.priceImpact.greaterThan(b.priceImpact)) {
        return 1
    }

    // finally consider the number of hops since each hop costs gas
    return a.route.path.length - b.route.path.length
}

/**
 * @deprecated Use the amount's `wrapped` (TokenAmount) instead. On a chain without a wrapped gas token, this function
 * gives an amount of WETH's placeholder token, while `wrapped` keeps the gas token.
 */
export function wrappedAmount(tokenAmount: TokenAmount): TokenAmount {
    return tokenAmount.token.isNative ? new TokenAmount(wrappedToken(tokenAmount.token), tokenAmount.raw) : tokenAmount
}

/**
 * @deprecated Use the token's `wrapped` (Token) instead. On a chain without a wrapped gas token, this function gives
 * WETH's placeholder token, while `wrapped` keeps the gas token.
 */
export function wrappedToken(token: Token): Token {
    return token.isNative ? WETH[token.chainId] : token
}

/** A trade's price impact, split into the pools' fee and the rest. */
export interface PriceBreakdown {
    /**
     * The price impact of the constant product formula alone (x * y = k), without the fee. It is negative for a loss,
     * the opposite sign of Trade.priceImpact.
     */
    priceImpactWithoutFee: Percent
    /** The fee the trade pays the liquidity providers, in the input token. */
    realizedLPFee: TokenAmount
}

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class Trade {
    /**
     * The route of the trade, i.e. which pairs the trade goes through.
     */
    public readonly route: Route
    /**
     * The type of the trade, either exact in or exact out.
     */
    public readonly tradeType: TradeType
    /**
     * The input amount for the trade assuming no slippage.
     */
    public readonly inputAmount: TokenAmount
    /**
     * The output amount for the trade assuming no slippage.
     */
    public readonly outputAmount: TokenAmount
    /**
     * The price expressed in terms of output amount/input amount.
     */
    public readonly executionPrice: Price
    /**
     * The mid price after the trade executes assuming no slippage.
     */
    public readonly nextMidPrice: Price
    /**
     * The percent difference between the mid price before the trade and the trade execution price.
     */
    public readonly priceImpact: Percent

    /**
     * Constructs an exact in trade with the given amount in and route
     * @param route route of the exact in trade
     * @param amountIn the amount being passed in
     */
    public static exactIn(route: Route, amountIn: TokenAmount): Trade {
        return new Trade(route, amountIn, TradeType.EXACT_INPUT)
    }

    /**
     * Constructs an exact out trade with the given amount out and route
     * @param route route of the exact out trade
     * @param amountOut the amount returned by the trade
     */
    public static exactOut(route: Route, amountOut: TokenAmount): Trade {
        return new Trade(route, amountOut, TradeType.EXACT_OUTPUT)
    }

    public constructor(route: Route, amount: TokenAmount, tradeType: TradeType) {
        const amounts: TokenAmount[] = new Array(route.path.length)
        const nextPairs: Pair[] = new Array(route.pairs.length)
        if (tradeType === TradeType.EXACT_INPUT) {
            invariant(amount.token.equals(route.input), 'INPUT')
            amounts[0] = amount.wrapped
            for (let i = 0; i < route.path.length - 1; i++) {
                const pair = route.pairs[i]
                const swap = pair.getOutputAmount(amounts[i])
                amounts[i + 1] = swap.amount
                nextPairs[i] = swap.pairAfter
            }
        } else {
            invariant(amount.token.equals(route.output), 'OUTPUT')
            amounts[amounts.length - 1] = amount.wrapped
            for (let i = route.path.length - 1; i > 0; i--) {
                const pair = route.pairs[i - 1]
                const swap = pair.getInputAmount(amounts[i])
                amounts[i - 1] = swap.amount
                nextPairs[i - 1] = swap.pairAfter
            }
        }

        this.route = route
        this.tradeType = tradeType
        this.inputAmount = tradeType === TradeType.EXACT_INPUT ? amount : new TokenAmount(route.input, amounts[0].raw)
        this.outputAmount =
            tradeType === TradeType.EXACT_OUTPUT
                ? amount
                : new TokenAmount(route.output, amounts[amounts.length - 1].raw)
        this.executionPrice = new Price(
            this.inputAmount.token,
            this.outputAmount.token,
            this.inputAmount.raw,
            this.outputAmount.raw
        )
        this.nextMidPrice = Price.fromRoute(new Route(route.chain, nextPairs, route.input, route.output))
        this.priceImpact = computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount)
    }

    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    public minimumAmountOut(slippageTolerance: Percent): TokenAmount {
        invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
        if (this.tradeType === TradeType.EXACT_OUTPUT) {
            return this.outputAmount
        } else {
            const slippageAdjustedAmountOut = new Fraction(ONE)
                .add(slippageTolerance)
                .invert()
                .multiply(this.outputAmount.raw).quotient
            return new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
        }
    }

    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    public maximumAmountIn(slippageTolerance: Percent): TokenAmount {
        invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
        if (this.tradeType === TradeType.EXACT_INPUT) {
            return this.inputAmount
        } else {
            const slippageAdjustedAmountIn = new Fraction(ONE)
                .add(slippageTolerance)
                .multiply(this.inputAmount.raw).quotient
            return new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        }
    }

    /**
     * Returns the trade's price impact split into the fee and the rest, at `dexFee`. `dexFee` is the fee of each hop, in
     * basis points (ChainConfig.dexFee).
     */
    public priceBreakdown(dexFee: number): PriceBreakdown {
        const baseFee = basisPointsToPercent(dexFee)
        const oneHundredPercent = basisPointsToPercent(10000)
        const inputFractionAfterFee = oneHundredPercent.subtract(baseFee)

        // each hop takes its fee off what passes through it: for 2 hops at 0.3%, 1 - (1 - 0.003) * (1 - 0.003)
        const realizedLPFee = oneHundredPercent.subtract(
            this.route.pairs.reduce<Fraction>(
                (currentFee: Fraction): Fraction => currentFee.multiply(inputFractionAfterFee),
                oneHundredPercent
            )
        )
        const priceImpactWithoutFee = this.priceImpact.subtract(realizedLPFee)
        return {
            priceImpactWithoutFee: new Percent(
                JSBI.multiply(priceImpactWithoutFee.numerator, JSBI.BigInt('-1')),
                priceImpactWithoutFee.denominator
            ),
            realizedLPFee: new TokenAmount(
                this.inputAmount.token,
                realizedLPFee.multiply(this.inputAmount.raw).quotient
            ),
        }
    }

    /** @deprecated Use a PairGraph of the pairs' chain (`new PairGraph(chain, pairs).bestTradesExactIn(…)`) instead. */
    public static bestTradeExactIn(
        pairs: Pair[],
        tokenAmountIn: TokenAmount,
        tokenOut: Token,
        options: BestTradeOptions = {}
    ): BestTrades {
        invariant(pairs.length > 0, 'PAIRS')
        return new PairGraph(pairs[0].requiredChain, pairs).bestTradesExactIn(tokenAmountIn, tokenOut, options)
    }

    /** @deprecated Use a PairGraph of the pairs' chain (`new PairGraph(chain, pairs).bestTradesExactOut(…)`) instead. */
    public static bestTradeExactOut(
        pairs: Pair[],
        tokenIn: Token,
        tokenAmountOut: TokenAmount,
        options: BestTradeOptions = {}
    ): Trade[] {
        invariant(pairs.length > 0, 'PAIRS')
        return new PairGraph(pairs[0].requiredChain, pairs).bestTradesExactOut(tokenIn, tokenAmountOut, options).trades
    }
}
