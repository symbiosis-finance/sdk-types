import JSBI from 'jsbi'

import type { BigintIsh, Rounding } from '../../constants'
import { _100 } from '../../constants'
import { Fraction } from './fraction'

const _100_PERCENT = new Fraction(_100)

export class Percent extends Fraction {
    public add(other: Fraction | BigintIsh): Percent {
        const result = super.add(other)
        return new Percent(result.numerator, result.denominator)
    }

    public toSignificant(significantDigits = 5, format?: object, rounding?: Rounding): string {
        return this.multiply(_100_PERCENT).toSignificant(significantDigits, format, rounding)
    }

    public toFixed(decimalPlaces = 2, format?: object, rounding?: Rounding): string {
        return this.multiply(_100_PERCENT).toFixed(decimalPlaces, format, rounding)
    }
}

/** Returns `bps` basis points as a Percent, rounded down to a whole basis point. */
export function basisPointsToPercent(bps: number): Percent {
    return new Percent(JSBI.BigInt(Math.floor(bps)), JSBI.BigInt(10000))
}
