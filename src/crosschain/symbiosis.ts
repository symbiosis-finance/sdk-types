import type { ChainId } from '../constants'
import type { Chain } from '../entities'
import { chains, Token, wrappedToken } from '../entities'
import { formatBytes32String } from '@ethersproject/strings'
import { NoTransitTokenError, SdkError } from '../sdkError'
import { Cache } from './cache'
import { ConfigCache } from './config/cache/cache'
import type { Id, OmniPoolInfo, TokenInfo } from './config/cache/types'
import { config as beta } from './config/beta'
import { config as dev } from './config/dev'
import { config as mainnet } from './config/mainnet'
import { config as testnet } from './config/testnet'
import type { ChainConfig, Config, ConfigName, EvmAddress, OmniPoolConfig, OverrideConfig } from './types'

export type { ConfigName } from './types'

/**
 * Lightweight, web3-free Symbiosis client.
 * Holds config + cache + clientId and exposes pure lookups only.
 * Routing/swapping/contract/provider/tracking logic lives in the api (js-sdk retired).
 */
export class Symbiosis {
    public readonly configName: ConfigName
    public readonly config: Config
    public readonly cache: Cache
    public readonly configCache: ConfigCache
    public readonly clientId: string

    public constructor(configName: ConfigName, clientId: string, overrideConfig?: OverrideConfig) {
        this.configName = configName
        if (overrideConfig?.config) {
            this.config = overrideConfig.config
        } else {
            if (configName === 'mainnet') {
                this.config = structuredClone(mainnet)
            } else if (configName === 'testnet') {
                this.config = structuredClone(testnet)
            } else if (configName === 'dev') {
                this.config = structuredClone(dev)
            } else if (configName === 'beta') {
                this.config = structuredClone(beta)
            } else {
                throw new SdkError('Unknown config name')
            }

            // restore Token objects after structuredClone
            this.config.btcConfigs = this.config.btcConfigs.map((btcConfig) => {
                return { ...btcConfig, btc: new Token(btcConfig.btc) }
            })

            if (overrideConfig?.chains) {
                const { chains: overrideChains } = overrideConfig
                this.config.chains = this.config.chains.map((chainConfig) => {
                    const found = overrideChains.find((i) => i.id === chainConfig.id)
                    if (found) {
                        chainConfig.rpc = found.rpc
                        chainConfig.headers = found.headers
                    }
                    return chainConfig
                })
            }
            if (overrideConfig?.limits) this.config.limits = overrideConfig.limits
            if (overrideConfig?.advisor) this.config.advisor = overrideConfig.advisor
            if (overrideConfig?.btcConfigs) this.config.btcConfigs = overrideConfig.btcConfigs
        }

        this.cache = overrideConfig?.cache || new Cache()
        this.configCache = new ConfigCache(overrideConfig?.configCache || configName)
        this.clientId = formatBytes32String(clientId)
    }

    public getBtcConfig(btc: Token) {
        const config = this.config.btcConfigs.find((i) => i.btc.equals(btc))
        if (!config) {
            throw new SdkError('BTC config not found')
        }
        return config
    }

    public chains(): Chain[] {
        const ids = this.config.chains.map((i) => i.id)
        return chains.filter((chain) => ids.includes(chain.id))
    }

    public chainConfig(chainId: ChainId): ChainConfig {
        const config = this.config.chains.find((item) => {
            return item.id === chainId
        })
        if (!config) {
            throw new SdkError(`Could not config by given chainId: ${chainId}`)
        }
        return config
    }

    public dexFee(chainId: ChainId): number {
        return this.chainConfig(chainId).dexFee
    }

    public filterBlockOffset(chainId: ChainId): number {
        return this.chainConfig(chainId).filterBlockOffset
    }

    public tokens(): Token[] {
        return this.configCache.tokens()
    }

    public findToken(address: string, chainId: ChainId, chainFromId?: ChainId): Token | undefined {
        return this.tokens().find((token) => {
            const condition = token.address.toLowerCase() === address.toLowerCase() && token.chainId === chainId

            if (chainFromId === undefined) return condition

            return condition && token.chainFromId === chainFromId
        })
    }

    public getRepresentation(token: Token, chainId: ChainId): Token | undefined {
        return this.configCache.getRepresentation(token, chainId)
    }

    public getOmniPoolByConfig(config: OmniPoolConfig): OmniPoolInfo | undefined {
        return this.configCache.getOmniPoolByConfig(config)
    }

    public getOmniPoolByToken(token: Token): OmniPoolInfo | undefined {
        return this.configCache.getOmniPoolByToken(token)
    }

    public getOmniPoolTokens(omniPoolConfig: OmniPoolConfig): Token[] {
        return this.configCache.getOmniPoolTokens(omniPoolConfig)
    }

    public getOmniPoolTokenIndex(omniPoolConfig: OmniPoolConfig, token: Token): number {
        return this.configCache.getOmniPoolTokenIndex(omniPoolConfig, token)
    }

    public getTokenInfoById(tokenId: Id): TokenInfo {
        return this.configCache.getTokenInfoById(tokenId)
    }

    public transitTokens(chainId: ChainId, omniPoolConfig: OmniPoolConfig): Token[] {
        const pool = this.configCache.getOmniPoolByConfig(omniPoolConfig)
        if (!pool) {
            throw new SdkError(`Cannot find omniPool for chainId ${omniPoolConfig.chainId}`)
        }

        const tokens = this.configCache.tokens().filter((token) => {
            return token.chainId === chainId && !token.deprecated && !token.isSynthetic
        })

        return tokens.filter((token) => {
            const tokenPool = this.getOmniPoolByToken(token)
            return pool.id === tokenPool?.id
        })
    }

    public transitToken(chainId: ChainId, omniPoolConfig: OmniPoolConfig): Token {
        const pool = this.configCache.getOmniPoolByConfig(omniPoolConfig)
        if (!pool) {
            throw new NoTransitTokenError(`Cannot find omniPool ${pool}`)
        }
        const tokens = this.configCache.tokens().filter((token) => {
            return token.chainId === chainId && !token.deprecated && !token.isSynthetic
        })
        if (tokens.length === 0) {
            throw new NoTransitTokenError(`Cannot find token for chain ${chainId}`)
        }

        // if the token is from the manager chain (token's chainIs equals to pool chainId)
        if (chainId === pool.chainId) {
            return tokens[0]
        }

        // find the FIRST suitable token from the token list
        // e.g., the first token has priority
        const transitToken = tokens.find((token) => {
            return this.getOmniPoolByToken(token)?.id === pool.id
        })

        if (!transitToken) {
            throw new NoTransitTokenError(`Cannot find transitToken for chain ${chainId}. Pool: ${pool.id}`)
        }
        return transitToken
    }

    public getTransitCombinations({
        poolConfig,
        tokenIn,
        tokenOut,
        disableSrcChainRouting,
        disableDstChainRouting,
    }: {
        poolConfig: OmniPoolConfig
        tokenIn: Token
        tokenOut: Token
        disableSrcChainRouting?: boolean
        disableDstChainRouting?: boolean
    }) {
        const transitTokensIn = this.transitTokens(tokenIn.chainId, poolConfig)
        const transitTokensOut = this.transitTokens(tokenOut.chainId, poolConfig)

        const combinations: { transitTokenIn: Token; transitTokenOut: Token }[] = []

        transitTokensIn.forEach((transitTokenIn) => {
            transitTokensOut.forEach((transitTokenOut) => {
                if (transitTokenIn.equals(transitTokenOut)) {
                    return
                }
                if (disableSrcChainRouting) {
                    if (!transitTokenIn.equals(wrappedToken(tokenIn))) {
                        return
                    }
                }
                if (disableDstChainRouting) {
                    if (!transitTokenOut.equals(wrappedToken(tokenOut))) {
                        return
                    }
                }
                combinations.push({ transitTokenIn, transitTokenOut })
            })
        })

        return combinations
    }

    getRevertableAddress(chainId: ChainId): EvmAddress {
        const address = this.config.revertableAddress[chainId]

        if (address) {
            return address
        }

        return this.config.revertableAddress.default
    }

    // NOTE: validateLimits is BLOCKED — it calls parseUnits from @ethersproject/units
    // which is forbidden by the zero-web3 dep audit. Excluded from the slim class.
}
