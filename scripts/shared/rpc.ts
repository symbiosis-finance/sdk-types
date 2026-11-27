import type { ChainConfig } from '../../src/crosschain/types'

/** Returns the URL of the chain's EVM JSON-RPC endpoint. On a Tron chain, it is the chain's `rpc` plus `/jsonrpc`. */
export function evmRpcUrl(chainConfig: ChainConfig): string {
    return chainConfig.chain.kind === 'tron' ? `${chainConfig.rpc}/jsonrpc` : chainConfig.rpc
}
