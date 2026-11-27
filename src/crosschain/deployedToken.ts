import { getAddress } from '@ethersproject/address'

import type { ChainId } from '../constants'
import { Token } from '../entities'
import type { DeployedChain } from './deployment'
import { NoTransitTokenError, SdkError } from '../errors'
import type { OmniPoolInfo, OmniPoolTokenIndex, TokenInfo } from './config/cache/types'
import type { EvmAddress, OmniPoolCoinGeckoId, OmniPoolConfig } from './types'

let addSynthetic: (original: DeployedToken, synthetic: SyntheticToken) => void

/**
 * A token does not refer to the pools that hold it, to avoid a cycle. Deployment.omniPoolOf finds its pool
 * (svc-symbiosis-api task rdyrn, State).
 */
export class DeployedToken extends Token<DeployedChain> {
    // Not serialized: it is the deployment's data.
    readonly #info: TokenInfo
    readonly #synthetics: SyntheticToken[] = []

    static {
        addSynthetic = (original, synthetic) => original.#synthetics.push(synthetic)
    }

    /** @internal Built by its Deployment. */
    public constructor(chain: DeployedChain, info: TokenInfo) {
        super(chain, info)
        this.#info = info
    }

    /** @internal The token's entry in its deployment's data. */
    public get info(): TokenInfo {
        return this.#info
    }

    /**
     * The token's synthetics on other chains. A synthetic can have synthetics of its own (svc-symbiosis-api task
     * rdyrn, State).
     */
    public get synthetics(): SyntheticToken[] {
        return [...this.#synthetics]
    }

    /** Returns the token's synthetic on the given chain. */
    public syntheticOn(chainId: ChainId): SyntheticToken | undefined {
        return this.#synthetics.find((synth) => synth.chainId === chainId)
    }

    /**
     * The token this one stands for where it is minted from: a synthetic's original, one step back; any other token,
     * itself.
     */
    public get underlying(): DeployedToken {
        return this
    }

    /** Checks whether the token can enter an omni pool from its chain. A deprecated or synthetic token cannot. */
    public get canTransit(): boolean {
        return !this.isSynthetic && !this.deprecated
    }
}

/** A synthetic token: one minted on its chain for its original on another (`chainFromId`). */
export class SyntheticToken extends DeployedToken {
    readonly #original: DeployedToken

    /**
     * @internal Built by its Deployment, after its original, to whose synthetics it adds itself. Errors when the
     * original is not on its chainFromId.
     */
    public constructor(chain: DeployedChain, info: TokenInfo, original: DeployedToken) {
        super(chain, info)
        if (original.chainId !== this.chainFromId) {
            throw new SdkError(
                `Synthetic token ${this.address} of chain ${this.chainFromId} has an original on another`
            )
        }
        this.#original = original
        addSynthetic(original, this)
    }

    /** The token this one is minted for, on `chainFromId`. */
    public get original(): DeployedToken {
        return this.#original
    }

    public override get underlying(): DeployedToken {
        return this.#original
    }
}

/**
 * An omni pool built from a deployment's data. It is an OmniPoolConfig, so code that takes a pool's config takes it
 * whole (svc-symbiosis-api task rdyrn, State).
 */
export class OmniPool implements OmniPoolConfig {
    public readonly chainId: ChainId
    public readonly address: EvmAddress
    public readonly oracle: EvmAddress
    public readonly generalPurpose: boolean
    public readonly coinGeckoId: OmniPoolCoinGeckoId
    readonly #info: OmniPoolInfo
    // Each token's index in the pool contract.
    readonly #indexes = new Map<DeployedToken, OmniPoolTokenIndex>()

    /** @internal Built by its Deployment. */
    public constructor(info: OmniPoolInfo, tokens: { index: OmniPoolTokenIndex; token: DeployedToken }[]) {
        this.chainId = info.chainId
        this.address = info.address
        this.oracle = info.oracle
        this.generalPurpose = info.generalPurpose
        this.coinGeckoId = info.coinGeckoId
        this.#info = info
        for (const { index, token } of [...tokens].sort((a, b) => a.index - b.index)) this.#indexes.set(token, index)
    }

    /** @internal The pool's entry in its deployment's data. */
    public get info(): OmniPoolInfo {
        return this.#info
    }

    /** The pool's tokens, in the order of their indexes. */
    public get tokens(): DeployedToken[] {
        return [...this.#indexes.keys()]
    }

    /** Whether the pool holds `token`. */
    public has(token: DeployedToken): boolean {
        return this.#indexes.has(token)
    }

    /**
     * Checks whether the token trades in the pool. A synthetic trades in the pool that holds it. Another token trades
     * in the pool that holds it or one of its synthetics.
     */
    public trades(token: DeployedToken): boolean {
        return this.has(token) || (!token.isSynthetic && token.synthetics.some((synthetic) => this.has(synthetic)))
    }

    /** Checks whether the given config is this pool's. The config's address can be in any case. */
    public is(config: OmniPoolConfig): boolean {
        return config.chainId === this.chainId && getAddress(config.address) === this.address
    }

    /** Returns the token's index in the pool. Errors with NoTransitTokenError when the pool does not hold the token. */
    public indexOf(token: DeployedToken): OmniPoolTokenIndex {
        const index = this.#indexes.get(token)
        if (index === undefined) {
            throw new NoTransitTokenError(`There is no token ${token.info.address} in omniPool ${this.address}`)
        }
        return index
    }

    /**
     * Returns the tokens that can transit into the pool from the given chain. These are the originals on that chain of
     * the synthetics that the pool holds, and the pool's own tokens on that chain.
     */
    public transitTokens(chainId: ChainId): DeployedToken[] {
        return [...new Set(this.tokens.map((token) => token.underlying))].filter(
            (token) => token.chainId === chainId && token.canTransit
        )
    }

    /**
     * Returns the token that enters the pool from the given chain. Errors with NoTransitTokenError when no token enters
     * the pool from the chain, and with SdkError when several do.
     */
    public transitToken(chainId: ChainId): DeployedToken {
        const tokens = this.transitTokens(chainId)
        if (tokens.length === 0) {
            throw new NoTransitTokenError(`Cannot find transitToken for chain ${chainId}. Pool: ${this.address}`)
        }
        if (tokens.length > 1) {
            const symbols = tokens.map((token) => token.symbol).join(', ')
            throw new SdkError(
                `Chain ${chainId} has ${tokens.length} transit tokens for pool ${this.address}: ${symbols}`
            )
        }
        return tokens[0]
    }
}
