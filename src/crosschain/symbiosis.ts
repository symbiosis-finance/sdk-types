import type { ChainId } from '../constants'
import type { Chain } from '../entities'
import { Token } from '../entities'
import { NoTransitTokenError, SdkError } from '../errors'
import { formatBytes32String } from '@ethersproject/strings'
import { Cache } from './cache'
import { CHAIN_DATA } from './chainData'
import { ConfigCache, type ConfigName, Deployment } from './deployment'
import type { Id, OmniPoolInfo, TokenInfo } from './config/cache/types'
import type { ChainConfig, Config, ConfigInput, EvmAddress, OmniPoolConfig, OverrideConfig } from './types'

export type TransitCombination = { transitTokenIn: Token; transitTokenOut: Token }

/**
 * @deprecated Use a Deployment instead: `Deployment.named(configName)`, or `new Deployment(config, cacheData)` for a
 * config of one's own (README, "Deployments and chains (0.1.0)").
 */
export class Symbiosis {
    public readonly configName: ConfigName
    public readonly cache: Cache
    public readonly configCache: ConfigCache
    public readonly clientId: string
    public readonly deployment: Deployment

    public constructor(configName: ConfigName, clientId: string, overrideConfig?: OverrideConfig) {
        this.configName = configName
        let config: ConfigInput
        if (overrideConfig?.config) {
            config = overrideConfig.config
        } else {
            config = structuredClone(Deployment.named(configName).config)

            // restore Token objects after structuredClone
            config.btcConfigs = config.btcConfigs.map((btcConfig) => {
                return { ...btcConfig, btc: new Token(btcConfig.btc) }
            })

            if (overrideConfig?.chains) {
                const { chains: overrideChains } = overrideConfig
                config.chains = config.chains.map((chainConfig) => {
                    const found = overrideChains.find((i) => i.id === chainConfig.id)
                    if (found) {
                        chainConfig.rpc = found.rpc
                        chainConfig.headers = found.headers
                        if (found.spareRpcs) {
                            chainConfig.spareRpcs = found.spareRpcs
                        }
                    }
                    return chainConfig
                })
            }
            if (overrideConfig?.limits) config.limits = overrideConfig.limits
            if (overrideConfig?.advisor) config.advisor = overrideConfig.advisor
            if (overrideConfig?.solver) config.solver = overrideConfig.solver
            if (overrideConfig?.perpbot) config.perpbot = overrideConfig.perpbot
            if (overrideConfig?.btcConfigs) config.btcConfigs = overrideConfig.btcConfigs
        }

        this.cache = overrideConfig?.cache || new Cache()
        this.deployment = new Deployment(config, overrideConfig?.configCache ?? Deployment.named(configName).cacheData)
        this.configCache = new ConfigCache(this.deployment)
        this.clientId = formatBytes32String(clientId)
    }

    public get config(): Config {
        return this.deployment.config
    }

    public getBtcConfig(btc: Token) {
        const config = this.config.btcConfigs.find((btcConfig) => btcConfig.btc.equals(btc))
        if (!config) {
            throw new SdkError('BTC config not found')
        }
        return config
    }

    /**
     * Returns the deployment's chains in the order of CHAIN_DATA, followed by any chain that CHAIN_DATA does not list.
     */
    public chains(): Chain[] {
        const listed = CHAIN_DATA.flatMap((data) => this.deployment.findChain(data.id) ?? [])
        const seen = new Set<Chain>(listed)
        return [...listed, ...this.deployment.chains().filter((chain) => !seen.has(chain))]
    }

    public chainConfig(chainId: ChainId): ChainConfig {
        return this.deployment.chain(chainId).config
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
        return this.tokens().find(
            (token) =>
                token.chainId === chainId &&
                token.address.toLowerCase() === address.toLowerCase() &&
                (chainFromId === undefined || token.chainFromId === chainFromId)
        )
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

    /** The chain's tokens, neither deprecated nor synthetic, that trade in the pool, in the order of the data. */
    public transitTokens(chainId: ChainId, omniPoolConfig: OmniPoolConfig): Token[] {
        const pool = this.configCache.getOmniPoolByConfig(omniPoolConfig)
        if (!pool) {
            throw new SdkError(`Cannot find omniPool for chainId ${omniPoolConfig.chainId}`)
        }
        return this.inPool(chainId, pool)
    }

    /**
     * Returns the chain's first token on the pool's own chain, whatever pool that token trades in, as 0.0.69 did. On
     * another chain, it returns the first of the chain's tokens that trade in the pool. `pool.transitToken(chainId)`
     * has no such exception. Errors with NoTransitTokenError when there is no such token.
     */
    public transitToken(chainId: ChainId, omniPoolConfig: OmniPoolConfig): Token {
        const pool = this.configCache.getOmniPoolByConfig(omniPoolConfig)
        if (!pool) {
            throw new NoTransitTokenError(
                `Cannot find omniPool ${omniPoolConfig.address} on chain ${omniPoolConfig.chainId}`
            )
        }
        const tokens = this.ownTokens(chainId)
        if (tokens.length === 0) {
            throw new NoTransitTokenError(`Cannot find token for chain ${chainId}`)
        }
        if (chainId === pool.chainId) return tokens[0]
        const transitToken = this.inPool(chainId, pool)[0]
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
    }): TransitCombination[] {
        const ins = this.transitTokens(tokenIn.chainId, poolConfig)
        const outs = this.transitTokens(tokenOut.chainId, poolConfig)
        return ins.flatMap((transitTokenIn) =>
            outs
                .filter(
                    (transitTokenOut) =>
                        !transitTokenIn.equals(transitTokenOut) &&
                        (!disableSrcChainRouting || transitTokenIn.equals(tokenIn.wrapped)) &&
                        (!disableDstChainRouting || transitTokenOut.equals(tokenOut.wrapped))
                )
                .map((transitTokenOut) => ({ transitTokenIn, transitTokenOut }))
        )
    }

    getRevertableAddress(chainId: ChainId): EvmAddress {
        return this.config.revertableAddress[chainId] ?? this.config.revertableAddress.default
    }

    private inPool(chainId: ChainId, pool: OmniPoolInfo): Token[] {
        return this.ownTokens(chainId).filter((token) => this.configCache.getOmniPoolByToken(token) === pool)
    }

    private ownTokens(chainId: ChainId): Token[] {
        const tokens = this.deployment.findChain(chainId)?.tokens() ?? []
        return tokens.filter((token) => token.canTransit)
    }
}
