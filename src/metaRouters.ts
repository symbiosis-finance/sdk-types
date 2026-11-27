import { ChainId } from './constants'
import { shippedChainConfigs } from './crosschain/config'
import type { GatewayRouter } from './crosschain/types'
import { chainEntries } from './utils'

const APPROVABLE_METAROUTERS: Partial<Record<ChainId, GatewayRouter>> = Object.fromEntries(
    chainEntries(shippedChainConfigs, (chainConfig) => chainConfig.approvableMetaRouter)
)

/** @deprecated Read `approvableMetaRouter` from the deployment's chain config (`deployment.chain(id).config`) instead. */
export function getApprovableMetaRouter(chainId: ChainId): GatewayRouter | undefined {
    return APPROVABLE_METAROUTERS[chainId]
}
