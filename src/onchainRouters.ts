import { ChainId } from './constants'
import { shippedChainConfigs } from './crosschain/config'
import type { EvmAddress, GatewayRouter } from './crosschain/types'
import { chainEntries } from './utils'

/**
 * @deprecated Read `onchainSwapRouter` from the chain's config (`deployment.chain(id).config`) instead. The table holds
 * every shipped deployment's routers, and mainnet's where several have the chain.
 */
export const ONCHAIN_SWAP_ROUTERS: Partial<Record<ChainId, GatewayRouter>> = Object.fromEntries(
    chainEntries(shippedChainConfigs, (chainConfig) => chainConfig.onchainSwapRouter)
)

/** @deprecated Read `onchainSwapRouter` from the deployment's chain config (`deployment.chain(id).config`) instead. */
export function getOnchainSwapRouter(chainId: ChainId): GatewayRouter | undefined {
    return ONCHAIN_SWAP_ROUTERS[chainId]
}

/**
 * @deprecated Read `onchainZeroFeeSwapRouter` from the chain's config (`deployment.chain(id).config`) instead. The
 * table holds every shipped deployment's routers, and mainnet's where several have the chain.
 */
export const ONCHAIN_ZERO_FEE_SWAP_ROUTERS: Partial<Record<ChainId, GatewayRouter>> = Object.fromEntries(
    chainEntries(shippedChainConfigs, (chainConfig) => chainConfig.onchainZeroFeeSwapRouter)
)

/** @deprecated Read `onchainZeroFeeSwapRouter` from the deployment's chain config (`deployment.chain(id).config`) instead. */
export function getOnchainZeroFeeSwapRouter(chainId: ChainId): GatewayRouter | undefined {
    return ONCHAIN_ZERO_FEE_SWAP_ROUTERS[chainId]
}

/**
 * @deprecated Read `legacyZeroFeeCollector` from the chain's config (`deployment.chain(id).config`) instead. The table
 * holds every shipped deployment's addresses, and mainnet's where several have the chain.
 */
export const LEGACY_ZERO_FEE_COLLECTOR_ADDRESSES: Partial<Record<ChainId, EvmAddress>> = Object.fromEntries(
    chainEntries(shippedChainConfigs, (chainConfig) => chainConfig.legacyZeroFeeCollector)
)

/**
 * @deprecated Read `legacyFeeCollector` from the chain's config (`deployment.chain(id).config`) instead. The table
 * holds every shipped deployment's addresses, and mainnet's where several have the chain.
 */
export const LEGACY_FEE_COLLECTOR_ADDRESSES: Partial<Record<ChainId, EvmAddress>> = Object.fromEntries(
    chainEntries(shippedChainConfigs, (chainConfig) => chainConfig.legacyFeeCollector)
)

/**
 * @deprecated Read `legacyFeeCollector` (or `legacyZeroFeeCollector`) from the chain's config
 * (`deployment.chain(id).config`) instead.
 */
export function getLegacyFeeCollector(chainId: ChainId, zeroFee = false): EvmAddress | undefined {
    return zeroFee ? LEGACY_ZERO_FEE_COLLECTOR_ADDRESSES[chainId] : LEGACY_FEE_COLLECTOR_ADDRESSES[chainId]
}

/**
 * @deprecated Read `multicallRouterV2` from the chain's config (`deployment.chain(id).config`) instead. The table
 * holds every shipped deployment's addresses, and mainnet's where several have the chain.
 */
export const MULTICALL_ROUTER_V2: Partial<Record<ChainId, EvmAddress>> = Object.fromEntries(
    chainEntries(shippedChainConfigs, (chainConfig) => chainConfig.multicallRouterV2)
)
