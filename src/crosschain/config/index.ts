import { Deployment } from '../deployment'
import { config as beta } from './beta'
import { config as dev } from './dev'
import { config as mainnet } from './mainnet'
import { config as testnet } from './testnet'

export { beta, dev, mainnet, testnet }

/**
 * The parsed chain configs of every shipped deployment. Where several shipped deployments have a chain, mainnet's config comes
 * last, so it wins in a table by chain id.
 */
export const shippedChainConfigs = (['dev', 'testnet', 'beta', 'mainnet'] as const).flatMap(
    (name) => Deployment.named(name).config.chains
)
