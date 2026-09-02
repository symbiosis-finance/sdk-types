import type { Provider } from '@ethersproject/providers'

import type { ChainId } from '../../src/constants'
import { MULTICALL_ADDRESSES } from '../../src/crosschain/constants'
import type { Multicall } from './contracts'
import { Multicall__factory } from './contracts'

export class NoMulticallAddressError extends Error {
    public constructor(chainId: ChainId) {
        super(
            `Failed to create Multicall instance. We do not know the multicall address on this network. ChainId: ${chainId}`
        )
    }
}

export async function getMulticall(provider: Provider): Promise<Multicall> {
    const { chainId } = await provider.getNetwork()

    const address = MULTICALL_ADDRESSES[chainId as ChainId]

    if (!address) {
        throw new NoMulticallAddressError(chainId)
    }

    return Multicall__factory.connect(address, provider)
}

export type MulticallCall = { target: string; callData: string }
export type MulticallResult = { success: boolean; returnData: string }

const DEFAULT_CHUNK_SIZE = 50

// Some RPCs (e.g. Rootstock) reject large request bodies with HTTP 413,
// so split the aggregate call into smaller batches.
export async function tryAggregateChunked(
    multicall: Multicall,
    calls: MulticallCall[],
    chunkSize = DEFAULT_CHUNK_SIZE
): Promise<MulticallResult[]> {
    const results: MulticallResult[] = []
    for (let i = 0; i < calls.length; i += chunkSize) {
        const chunk = calls.slice(i, i + chunkSize)
        const chunkResults = await multicall.callStatic.tryAggregate(false, chunk)
        results.push(...chunkResults)
    }
    return results
}
