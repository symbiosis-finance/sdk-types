/**
 * Pure trade math helpers extracted from js-sdk 3.11.60 (crosschain/chainUtils/evm.ts).
 * Only the zero-web3 functions are ported here; the rest of evm.ts is web3-heavy.
 *
 * EXCLUDED (web3): calculateGasMargin (uses @ethersproject BigNumber), getInternalId,
 * computeSlippageAdjustedAmounts (uses Field/Trade only — but lives next to web3 code; pure
 * variant getMinAmount is ported below), and all RPC/provider helpers.
 */
import JSBI from 'jsbi'

import type { BigintIsh } from '../constants'
import { ONE } from '../constants'
import type { Trade } from '../entities'
import { Fraction, Percent, TokenAmount } from '../entities'

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
    return new Percent(JSBI.BigInt(Math.floor(num)), JSBI.BigInt(10000))
}

export function getMinAmount(slippage: number, amount: BigintIsh): JSBI {
    const slippageTolerance = basisPointsToPercent(slippage)
    return new Fraction(ONE).subtract(slippageTolerance).multiply(amount).quotient
}

// computes price breakdown for the trade
export function computeTradePriceBreakdown(
    trade?: Trade,
    dexFee?: number
): {
    priceImpactWithoutFee?: Percent
    realizedLPFee?: TokenAmount
} {
    const BASE_FEE = new Percent(JSBI.BigInt(dexFee || 30), JSBI.BigInt(10000))
    const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
    const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

    // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
    // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
    const realizedLPFee = !trade
        ? undefined
        : ONE_HUNDRED_PERCENT.subtract(
              trade.route.pairs.reduce<Fraction>(
                  (currentFee: Fraction): Fraction => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
                  ONE_HUNDRED_PERCENT
              )
          )

    // remove lp fees from price impact
    const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined

    // the x*y=k impact
    const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
        ? new Percent(
              JSBI.multiply(priceImpactWithoutFeeFraction?.numerator, JSBI.BigInt('-1')),
              priceImpactWithoutFeeFraction?.denominator
          )
        : undefined

    // the amount of the input that accrues to LPs
    const realizedLPFeeAmount =
        realizedLPFee &&
        trade &&
        new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
    return {
        priceImpactWithoutFee: priceImpactWithoutFeePercent,
        realizedLPFee: realizedLPFeeAmount,
    }
}
