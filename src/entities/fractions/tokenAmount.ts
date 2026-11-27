import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import type { BigintIsh } from '../../constants'
import { Rounding, SolidityType, TEN } from '../../constants'
import { parseBigintIsh, validateSolidityTypeInstance } from '../../utils'
import type { Token } from '../token'
import { Fraction } from './fraction'

/** An amount of a token. `T` is the token's type, so that the amount keeps what is known of its token (Token). */
export class TokenAmount<T extends Token = Token> extends Fraction {
    public readonly token: T

    public constructor(token: T, amount: BigintIsh) {
        const parsedAmount = parseBigintIsh(amount)
        validateSolidityTypeInstance(parsedAmount, SolidityType.uint256)

        super(parsedAmount, JSBI.exponentiate(TEN, JSBI.BigInt(token.decimals)))
        this.token = token
    }

    /** The same amount of the token that pools hold for this one (Token.wrapped). */
    public get wrapped(): TokenAmount<T['wrapped']> {
        const token = this.token.wrapped
        return token === this.token ? this : new TokenAmount(token, this.raw)
    }

    public toString(): string {
        return `${this.toFixed()} ${this.token}`
    }

    public get raw(): JSBI {
        return this.numerator
    }

    public add(other: TokenAmount): TokenAmount<T> {
        invariant(this.token.equals(other.token), 'TOKEN')
        return new TokenAmount(this.token, JSBI.add(this.raw, other.raw))
    }

    public subtract(other: TokenAmount): TokenAmount<T> {
        invariant(this.token.equals(other.token), 'TOKEN')
        return new TokenAmount(this.token, JSBI.subtract(this.raw, other.raw))
    }

    public greaterThanOrEqual(amount: JSBI): boolean {
        return JSBI.greaterThanOrEqual(this.raw, amount)
    }

    public toSignificant(significantDigits = 6, format?: object, rounding: Rounding = Rounding.ROUND_DOWN): string {
        return super.toSignificant(significantDigits, format, rounding)
    }

    public toFixed(
        decimalPlaces: number = this.token.decimals,
        format?: object,
        rounding: Rounding = Rounding.ROUND_DOWN
    ): string {
        invariant(decimalPlaces <= this.token.decimals, 'DECIMALS')
        return super.toFixed(decimalPlaces, format, rounding)
    }

    public toExact(decimalPlaces: number = this.token.decimals, format: object = { groupSeparator: '' }): string {
        return super.toExact(decimalPlaces, format)
    }

    public toBigInt(): bigint {
        return BigInt(this.raw.toString())
    }
}
