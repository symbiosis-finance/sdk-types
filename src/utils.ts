import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { parseEvmAddress } from './addresses'
import type { BigintIsh, ChainId } from './constants'
import { ONE, SOLIDITY_TYPE_MAXIMA, SolidityType, THREE, TWO, ZERO } from './constants'
import type { TokenAddress } from './crosschain/types'

export function validateSolidityTypeInstance(value: JSBI, solidityType: SolidityType): void {
    invariant(JSBI.greaterThanOrEqual(value, ZERO), `${value} is not a ${solidityType}.`)
    invariant(JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]), `${value} is not a ${solidityType}.`)
}

/**
 * Returns the address in EIP-55 form, or the empty address (a gas token's) unchanged. Errors when the address is
 * neither.
 */
export function validateAndParseAddress(address: string): TokenAddress {
    return address === '' ? address : parseEvmAddress(address)
}

export function parseBigintIsh(bigintIsh: BigintIsh): JSBI {
    return bigintIsh instanceof JSBI
        ? bigintIsh
        : typeof bigintIsh === 'bigint'
          ? JSBI.BigInt(bigintIsh.toString())
          : JSBI.BigInt(bigintIsh)
}

// mock the on-chain sqrt function
export function sqrt(y: JSBI): JSBI {
    validateSolidityTypeInstance(y, SolidityType.uint256)
    let z: JSBI = ZERO
    let x: JSBI
    if (JSBI.greaterThan(y, THREE)) {
        z = y
        x = JSBI.add(JSBI.divide(y, TWO), ONE)
        while (JSBI.lessThan(x, z)) {
            z = x
            x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO)
        }
    } else if (JSBI.notEqual(y, ZERO)) {
        z = ONE
    }
    return z
}

/** Returns `compute`, remembering its result for each pair of arguments, which are compared as Map keys. */
export function memoize2<A, B, V>(compute: (a: A, b: B) => V): (a: A, b: B) => V {
    const values = new Map<A, Map<B, V>>()
    return (a, b) => {
        let withA = values.get(a)
        if (!withA) {
            withA = new Map()
            values.set(a, withA)
        }
        if (!withA.has(b)) withA.set(b, compute(a, b))
        return withA.get(b) as V
    }
}

/** Returns a function that runs `compute` at most once and returns its value on every call. */
export function once<T>(compute: () => T): () => T {
    let computed: { value: T } | undefined
    return () => (computed ??= { value: compute() }).value
}

/** Returns the first `n` of `items` in the order of `comparator`. Of equal items, the earlier one comes first. */
export function bestOf<T>(items: Iterable<T>, n: number, comparator: (a: T, b: T) => number): T[] {
    const best: T[] = []
    for (const item of items) sortedInsert(best, item, n, comparator)
    return best
}

/**
 * Returns each row's chain id paired with what `pick` takes from the row, in the order of the rows. A row where `pick`
 * returns undefined is left out.
 */
export function chainEntries<R extends { id: ChainId }, V>(
    rows: readonly R[],
    pick: (row: R) => V | undefined
): [ChainId, V][] {
    return rows.flatMap((row) => {
        const value = pick(row)
        return value === undefined ? [] : [[row.id, value]]
    })
}

/**
 * Inserts `add` into `items`, which are sorted by `comparator`, after any equal items, and keeps at most `maxSize`
 * items. Returns the item that no longer fits, which can be `add` itself, or null when every item fits. Errors when
 * `maxSize` is not positive or `items` already holds more than `maxSize` items.
 */
export function sortedInsert<T>(items: T[], add: T, maxSize: number, comparator: (a: T, b: T) => number): T | null {
    invariant(maxSize > 0, 'MAX_SIZE_ZERO')
    // this is an invariant because the interface cannot return multiple removed items if items.length exceeds maxSize
    invariant(items.length <= maxSize, 'ITEMS_SIZE')

    if (items.length === 0) {
        items.push(add)
        return null
    } else {
        const isFull = items.length === maxSize
        if (isFull && comparator(items[items.length - 1], add) <= 0) {
            return add
        }

        let lo = 0,
            hi = items.length

        while (lo < hi) {
            const mid = (lo + hi) >>> 1
            if (comparator(items[mid], add) <= 0) {
                lo = mid + 1
            } else {
                hi = mid
            }
        }
        items.splice(lo, 0, add)
        return isFull ? items.pop()! : null
    }
}
