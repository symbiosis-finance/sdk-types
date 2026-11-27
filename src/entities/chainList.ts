import type { ChainId } from '../constants'
import { CHAIN_DATA } from '../crosschain/chainData'
import { SdkError } from '../errors'
import { once } from '../utils'
import { Chain } from './chain'

// Built on first use, not when the module loads, because the modules that read it are in an import cycle with Chain
// and Token (svc-symbiosis-api task rdyrn, State).
const catalogue = once(() => {
    const list = CHAIN_DATA.map((data) => new Chain(data))
    return { list, byId: new Map(list.map((chain) => [chain.id, chain])) }
})
const all = (): Chain[] => catalogue().list
const readOnly = (): never => {
    throw new SdkError('The deprecated `chains` is read-only')
}

/**
 * Every chain sdk-types knows, in the order of CHAIN_DATA. Errors when a caller writes to it.
 * @deprecated Take the chain from a Deployment (`deployment.findChain(id)`), which returns undefined for a chain the
 * deployment lacks.
 */
export const chains: Chain[] = new Proxy([] as Chain[], {
    get: (_, key) => Reflect.get(all(), key),
    has: (_, key) => Reflect.has(all(), key),
    ownKeys: () => Reflect.ownKeys(all()),
    getOwnPropertyDescriptor: (_, key) => Reflect.getOwnPropertyDescriptor(all(), key),
    set: readOnly,
    deleteProperty: readOnly,
    defineProperty: readOnly,
})

/**
 * @deprecated Take the chain from a Deployment (`deployment.findChain(id)`), which returns undefined for a chain the
 * deployment lacks.
 */
export const getChainById = (chainId: ChainId | undefined): Chain | undefined => {
    if (!chainId) return undefined
    return catalogue().byId.get(chainId)
}

/** Returns the chain of `chainId` from the global chain list. Errors when sdk-types does not know the chain. */
export const requireChainById = (chainId: ChainId): Chain => {
    const chain = getChainById(chainId)
    if (!chain) throw new SdkError(`Chain ${chainId} is not known to sdk-types`)
    return chain
}
