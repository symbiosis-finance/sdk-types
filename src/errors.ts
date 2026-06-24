// Errors shared with the client: entity (AMM) errors thrown by Pair/Trade, and the SdkError
// subtypes the app maps to user-facing messages. Backend-only routing/trade errors live in
// the api core (crosschain/sdkError.ts).

// --- Entity (AMM math) errors — extend the plain `Error`. Thrown by Pair/Trade ---

/**
 * Indicates that the pair has insufficient reserves for a desired output amount. I.e. the amount of output cannot be
 * obtained by sending any amount of input.
 */
export class InsufficientReservesError extends Error {
    public constructor() {
        super()
        this.name = this.constructor.name
    }
}

/**
 * Indicates that the input amount is too small to produce any amount of output. I.e. the amount of input sent is less
 * than the price of a single unit of output after fees.
 */
export class InsufficientInputAmountError extends Error {
    public constructor() {
        super()
        this.name = this.constructor.name
    }
}

// --- SDK error base machinery. `SdkError` adds `[ClassName] message` formatting and cause chaining ---

function unwrapErrorMessage(error: unknown): string {
    if (error instanceof AggregateSdkError) {
        if (error.formatted) {
            return error.message
        }
    }
    if (error instanceof AggregateError) {
        const errors = error.errors
            .map((e: unknown) => {
                return unwrapErrorMessage(e)
            })
            .join(', ')
        return `${error.message} [${errors}]`
    } else if (error instanceof Error) {
        return error.message
    } else if (typeof error === 'string' && error.length > 0) {
        return error
    } else if (typeof error === 'number') {
        return `${error}`
    } else if (typeof error === 'object') {
        return JSON.stringify(error)
    } else {
        return `${error}`
    }
}

export class AggregateSdkError extends AggregateError {
    public readonly formatted: boolean = false
    constructor(errors: unknown[], message?: string) {
        super(errors, message)
        this.message = unwrapErrorMessage(this)
        this.formatted = true
    }
}

export class SdkError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message)

        this.message = `[${this.constructor.name}] ${message}`
        this.name = this.constructor.name

        if (cause) {
            this.message = `${this.message}. Cause: ${unwrapErrorMessage(cause)}`
        }
    }
}

// --- Input errors. The app's client-side error->text mapping matches the Amount* subtypes ---
export class InputError extends SdkError {}

export class LimitError extends InputError {}
export class AmountTooLowError extends LimitError {}
export class AmountTooHighError extends LimitError {}
export class AmountLessThanFeeError extends LimitError {}

// --- Routing error thrown by the slim Symbiosis/Cache config lookups ---
export class RoutingError extends SdkError {}
export class NoTransitTokenError extends RoutingError {}

// --- Advisor error matched by the app's client-side error->text mapping ---
export class AdvisorError extends SdkError {}
