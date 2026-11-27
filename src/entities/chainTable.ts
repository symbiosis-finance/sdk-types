import type { ChainId } from '../constants'
import { CHAIN_DATA } from '../crosschain/chainData'
import type { Chain } from './chain'
import { requireChainById } from './chainList'

/**
 * Returns a table by chain id of what `read` gives for each chain sdk-types knows. An entry is computed when it is
 * first read, so a table can be declared while the modules load.
 */
export function chainTable<T>(read: (chain: Chain) => T): Record<ChainId, T> {
    const table = {} as Record<ChainId, T>
    for (const { id } of CHAIN_DATA) {
        Object.defineProperty(table, id, {
            get() {
                const value = read(requireChainById(id))
                Object.defineProperty(table, id, { value, enumerable: true })
                return value
            },
            enumerable: true,
            configurable: true,
        })
    }
    return table
}
