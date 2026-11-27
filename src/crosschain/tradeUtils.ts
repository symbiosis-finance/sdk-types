import JSBI from 'jsbi'

import type { BigintIsh } from '../constants'
import { ONE } from '../constants'
import type { PriceBreakdown, Trade } from '../entities'
import { basisPointsToPercent, Fraction } from '../entities'

export function getMinAmount(slippage: number, amount: BigintIsh): JSBI {
    const slippageTolerance = basisPointsToPercent(slippage)
    return new Fraction(ONE).subtract(slippageTolerance).multiply(amount).quotient
}

/** @deprecated Use `trade.priceBreakdown(dexFee)` (Trade) instead. */
export function computeTradePriceBreakdown(trade: Trade, dexFee: number): PriceBreakdown {
    return trade.priceBreakdown(dexFee)
}
