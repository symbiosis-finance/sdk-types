import { AddressZero } from '@ethersproject/constants'

import type { ChainId } from '../constants'
import { Chain, Token } from '../entities'
import { SdkError } from '../errors'
import { config as beta } from './config/beta'
import { chainData } from './chainData'
import betaCache from './config/cache/beta.json' with { type: 'json' }
import devCache from './config/cache/dev.json' with { type: 'json' }
import mainnetCache from './config/cache/mainnet.json' with { type: 'json' }
import testnetCache from './config/cache/testnet.json' with { type: 'json' }
import { type Id, type OmniPoolInfo, parseConfigCacheData, type TokenId, type TokenInfo } from './config/cache/types'
import { config as dev } from './config/dev'
import { config as mainnet } from './config/mainnet'
import { config as testnet } from './config/testnet'
import { DeployedToken, OmniPool, SyntheticToken } from './deployedToken'
import {
    type ChainConfig,
    type ChainConfigInput,
    type Config,
    type ConfigCacheData,
    type ConfigInput,
    configSchema,
    type OmniPoolConfig,
    type TokenAddress,
} from './types'

let setTokens: (chain: DeployedChain, tokens: DeployedToken[]) => void

/**
 * A chain with one deployment's setup on it. It does not refer back to its deployment (svc-symbiosis-api task rdyrn,
 * State).
 */
export class DeployedChain extends Chain {
    public constructor(public readonly config: ChainConfig) {
        if (config.id !== config.chain.id) {
            throw new SdkError(`chain config ${config.id} holds the data of chain ${config.chain.id}`)
        }
        super(config.chain)
    }

    #tokens: DeployedToken[] = []
    // By address. Some addresses have several tokens, one per chainFromId, and the data lists a few tokens twice. A
    // lookup gives the first (svc-symbiosis-api task rdyrn, State).
    #tokensByAddress = new Map<TokenAddress, DeployedToken[]>()

    static {
        setTokens = (chain, tokens) => {
            chain.#tokens = tokens
            chain.#tokensByAddress = Map.groupBy(tokens, (token) => token.address)
        }
    }

    /** The deployment's tokens on this chain, in the order of its data. */
    public tokens(): DeployedToken[] {
        return [...this.#tokens]
    }

    /**
     * @internal Returns the chain's token with the address and chainFromId of the given token. Deployment.token also
     * falls back to the wrapped gas token.
     */
    public token(token: Token): DeployedToken | undefined {
        return this.#tokensByAddress.get(token.address)?.find((other) => other.chainFromId === token.chainFromId)
    }
}

/**
 * One Symbiosis deployment's objects, built from its plain data, which stays as it is (svc-symbiosis-api task rdyrn,
 * Decisions; README, Deployments and chains).
 */
export class Deployment {
    private readonly chainsById: Map<ChainId, DeployedChain>
    readonly #tokens: DeployedToken[]
    // In the order of the data.
    readonly #pools: OmniPool[]

    /** The config, parsed (README, "Addresses"). */
    public readonly config: Config

    /**
     * Errors when the config does not fit `configSchema`, a chain config holds another chain's data, a token or pool is
     * on a chain the config lacks, an id names no token, a synthetic's original is not on its chainFromId, originals
     * form a loop, a pool is listed twice, a token trades in two pools, or the config's pools are not the data's.
     */
    public constructor(
        config: ConfigInput,
        public readonly cacheData: ConfigCacheData
    ) {
        this.config = configSchema.parse(config)
        this.chainsById = new Map(
            this.config.chains.map((chainConfig) => [chainConfig.id, new DeployedChain(chainConfig)])
        )
        this.#tokens = buildTokens(cacheData.tokens, this.chainsById)
        const tokensOfChain = Map.groupBy(this.#tokens, (token) => token.chainId)
        for (const chain of this.chainsById.values()) setTokens(chain, tokensOfChain.get(chain.id) ?? [])
        this.#pools = buildPools(cacheData.omniPools, this.#tokens, this.chainsById)
        this.checkConfigPools()
        this.checkOnePoolPerToken()
    }

    // A config that lists pools lists the data's, in their order. Otherwise the data is stale (svc-symbiosis-api task
    // rdyrn, State).
    private checkConfigPools(): void {
        const configured = this.config.omniPools
        if (configured.length === 0) return
        const same =
            configured.length === this.#pools.length && configured.every((config, i) => this.#pools[i].is(config))
        if (!same) {
            const list = (pools: OmniPoolConfig[]) => pools.map((pool) => `${pool.chainId}:${pool.address}`).join(', ')
            throw new SdkError(
                `The config's omni pools (${list(configured)}) are not the data's (${list(this.#pools)})`
            )
        }
    }

    // A token trades in one pool at most, which omniPoolOf relies on.
    private checkOnePoolPerToken(): void {
        for (const token of this.#tokens) {
            const pools = this.#pools.filter((pool) => pool.trades(token))
            if (pools.length > 1) {
                const addresses = pools.map((pool) => pool.address).join(', ')
                throw new SdkError(`Token ${token.address} on chain ${token.chainId} trades in omni pools ${addresses}`)
            }
        }
    }

    /** Returns the shipped deployment with the given name. Errors when the name is not a shipped deployment's. */
    public static named(name: ConfigName): Deployment {
        if (!Object.hasOwn(shipped, name)) throw new SdkError('Unknown config name')
        return shipped[name]
    }

    /** Errors when the deployment has no such chain. */
    public chain(chainId: ChainId): DeployedChain {
        const chain = this.findChain(chainId)
        if (!chain) throw new SdkError(`The deployment has no chain ${chainId}`)
        return chain
    }

    public findChain(chainId: ChainId): DeployedChain | undefined {
        return this.chainsById.get(chainId)
    }

    public chains(): DeployedChain[] {
        return [...this.chainsById.values()]
    }

    public tokens(): DeployedToken[] {
        return [...this.#tokens]
    }

    /**
     * Returns the deployment's token with the chain, address and chainFromId of the given token. For a gas token that
     * the data does not list, returns the chain's wrapped gas token.
     */
    public token(token: Token): DeployedToken | undefined {
        const chain = this.findChain(token.chainId)
        return chain?.token(token) ?? chain?.token(token.wrapped)
    }

    /** The deployment's omni pools, in the order of its data. */
    public omniPools(): OmniPool[] {
        return [...this.#pools]
    }

    /** Returns the omni pool that the token trades in (see OmniPool.trades). */
    public omniPoolOf(token: DeployedToken): OmniPool | undefined {
        return this.#pools.find((pool) => pool.trades(token))
    }
}

const shipped = {
    mainnet: new Deployment(mainnet, parseConfigCacheData(mainnetCache)),
    beta: new Deployment(beta, parseConfigCacheData(betaCache)),
    testnet: new Deployment(testnet, parseConfigCacheData(testnetCache)),
    dev: new Deployment(dev, parseConfigCacheData(devCache)),
}

export type ConfigName = keyof typeof shipped

// Returns the deployment's tokens in the order of the data. Each is built after its original, so that a synthetic gets
// its original in its constructor.
function buildTokens(infos: TokenInfo[], chains: ReadonlyMap<ChainId, DeployedChain>): DeployedToken[] {
    const infoById = new Map(infos.map((info) => [info.id, info]))
    const built = new Map<TokenInfo, DeployedToken>()
    const building = new Set<TokenInfo>()
    const build = (info: TokenInfo): DeployedToken => {
        const done = built.get(info)
        if (done) return done
        if (building.has(info)) {
            throw new SdkError(`The originals of token ${info.address} on chain ${info.chainId} form a loop`)
        }
        building.add(info)
        const chain = configuredChain(chains, `Token ${info.address}`, info.chainId)
        const referrer = `Token ${info.address} on chain ${info.chainId} names original`
        const token =
            info.originalId === undefined
                ? new DeployedToken(chain, info)
                : new SyntheticToken(chain, info, build(tokenOfId(infoById, info.originalId, referrer)))
        built.set(info, token)
        return token
    }
    return infos.map(build)
}

// Returns the deployment's omni pools in the order of the data.
function buildPools(
    infos: OmniPoolInfo[],
    tokens: DeployedToken[],
    chains: ReadonlyMap<ChainId, DeployedChain>
): OmniPool[] {
    const tokenById = new Map(tokens.map((token) => [token.info.id, token]))
    const pools: OmniPool[] = []
    for (const info of infos) {
        configuredChain(chains, `Omni pool ${info.address}`, info.chainId)
        if (pools.some((pool) => pool.is(info))) {
            throw new SdkError(`The data lists omni pool ${info.address} on chain ${info.chainId} twice`)
        }
        const referrer = `Omni pool ${info.address} on chain ${info.chainId} lists token`
        const entries = info.tokens.map(({ index, tokenId }) => ({
            index,
            token: tokenOfId(tokenById, tokenId, referrer),
        }))
        pools.push(new OmniPool(info, entries))
    }
    return pools
}

function configuredChain(chains: ReadonlyMap<ChainId, DeployedChain>, what: string, chainId: ChainId): DeployedChain {
    const chain = chains.get(chainId)
    if (!chain) throw new SdkError(`${what} is on chain ${chainId}, which the deployment has no config for`)
    return chain
}

function tokenOfId<T>(byId: ReadonlyMap<TokenId, T>, id: TokenId, referrer: string): T {
    const found = byId.get(id)
    if (found === undefined) throw new SdkError(`${referrer} #${id}, which the data does not list`)
    return found
}

// Returns a config for the given data. Each chain gets its shipped config, or a minimal one with no contracts.
function configOf(data: ConfigCacheData): ConfigInput {
    const chainIds = [
        ...new Set([...data.tokens.map((token) => token.chainId), ...data.omniPools.map((pool) => pool.chainId)]),
    ]
    return {
        advisor: { url: '' },
        omniPools: data.omniPools,
        revertableAddress: { default: AddressZero },
        limits: [],
        fallbackReceiver: AddressZero,
        btcConfigs: [],
        chains: chainIds.map(
            (chainId): ChainConfigInput =>
                [mainnet, beta, testnet, dev]
                    .flatMap((config) => config.chains)
                    .find((config) => config.id === chainId) ?? {
                    id: chainId,
                    chain: chainData(chainId),
                    rpc: '',
                    dexFee: 0,
                    filterBlockOffset: 0,
                    stables: [],
                    metaRouter: AddressZero,
                    metaRouterGateway: AddressZero,
                    multicallRouter: AddressZero,
                    router: AddressZero,
                    bridge: AddressZero,
                    synthesis: AddressZero,
                    portal: AddressZero,
                    fabric: AddressZero,
                }
        ),
    }
}

/**
 * @deprecated Use a Deployment instead: `Deployment.named('mainnet').token(token)?.syntheticOn(chainId)`,
 * `omniPool.tokens`.
 */
export class ConfigCache {
    private readonly deployment: Deployment

    /** Errors when the data has a chain that sdk-types has no data of. */
    public constructor(source: ConfigName | ConfigCacheData | Deployment) {
        this.deployment =
            source instanceof Deployment
                ? source
                : typeof source === 'string'
                  ? Deployment.named(source)
                  : new Deployment(configOf(source), source)
    }

    public tokens(): Token[] {
        return this.deployment.tokens()
    }

    /**
     * Returns the original of a synthetic when the original is on the given chain. For any other token, returns its
     * synthetic on the given chain. Errors when the deployment does not have the token.
     */
    public getRepresentation(token: Token, chainId: ChainId): Token | undefined {
        const deployed = this.requireToken(token.wrapped)
        if (deployed instanceof SyntheticToken) {
            return deployed.original.chainId === chainId ? deployed.original : undefined
        }
        return deployed.syntheticOn(chainId)
    }

    public getOmniPoolByConfig(omniPoolConfig: OmniPoolConfig): OmniPoolInfo | undefined {
        return this.omniPool(omniPoolConfig)?.info
    }

    public getOmniPoolById(id: Id): OmniPoolInfo | undefined {
        return this.deployment.omniPools().find((pool) => pool.info.id === id)?.info
    }

    /**
     * Returns the omni pool that the token's wrapped form trades in (see OmniPool.trades). Errors when the deployment
     * does not have the token.
     */
    public getOmniPoolByToken(token: Token): OmniPoolInfo | undefined {
        return this.deployment.omniPoolOf(this.requireToken(token.wrapped))?.info
    }

    public getOmniPoolTokenIndex(omniPoolConfig: OmniPoolConfig, token: Token): number {
        return this.requirePool(omniPoolConfig).indexOf(this.requireToken(token))
    }

    public getOmniPoolTokens(omniPoolConfig: OmniPoolConfig): Token[] {
        return this.requirePool(omniPoolConfig).tokens
    }

    public getTokenInfoById(id: Id): TokenInfo {
        const token = this.deployment.tokens().find((candidate) => candidate.info.id === id)
        if (!token) throw new SdkError(`Can't get tokenInfo for id ${id}`)
        return token.info
    }

    // Returns the deployment's token with the chain, address and chainFromId of the given token. Unlike
    // Deployment.token, it does not fall back to the wrapped gas token.
    private requireToken(token: Token): DeployedToken {
        const found = this.deployment.findChain(token.chainId)?.token(token)
        if (!found) throw new SdkError(`Can't get tokenInfo by token ${token.address} ${token.chainId}`)
        return found
    }

    private omniPool(config: OmniPoolConfig): OmniPool | undefined {
        return this.deployment.omniPools().find((pool) => pool.is(config))
    }

    private requirePool(config: OmniPoolConfig): OmniPool {
        const pool = this.omniPool(config)
        if (!pool) throw new SdkError(`The deployment has no omni pool ${config.chainId}:${config.address}`)
        return pool
    }
}
