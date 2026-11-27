import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import type { Address, TokenAddress } from '..'
import { parseEvmAddress } from '../addresses'
import type { Icons } from '../constants'
import { ChainId, SolidityType } from '../constants'
import { tronAddressToEvm } from '../crypto/tronAddress'
import { validateSolidityTypeInstance } from '../utils'
import type { Chain } from './chain'
import { getChainById } from './chainList'
import { chainTable } from './chainTable'

export type TokenConstructor = {
    name?: string
    symbol?: string
    address: Address
    decimals: number
    chainId: ChainId
    chainFromId?: ChainId
    icons?: Icons
    userToken?: boolean
    deprecated?: boolean
    origin?: string
    attributes?: {
        solana?: string
        ton?: string
    }
}

/**
 * A fungible token on its chain. `C` is what is known of the chain: a token built on a chain (`new Token(chain, params)`)
 * is a `Token<Chain>` or a `Token<DeployedChain>`, whose `chain` is always there; a plain `Token` is any token, and its
 * chain may be unknown (svc-symbiosis-api task rdyrn, step 2d).
 */
export class Token<C extends Chain | undefined = Chain | undefined> {
    public readonly decimals: number
    public readonly symbol?: string
    public readonly name?: string
    public readonly chainId: ChainId
    public readonly address: TokenAddress
    public readonly icons?: Icons
    public readonly chainFromId?: ChainId
    public readonly userToken?: boolean
    public readonly deprecated: boolean
    public readonly attributes?: {
        solana?: string
        ton?: string
    }

    // A chain holds its tokens, and each token holds its chain. The field is private so that copies and JSON leave
    // this cycle out.
    readonly #chain: C

    /** A token of `chain`. Errors when `params.chainId` is not `chain.id`. */
    constructor(chain: C, params: TokenConstructor)
    /**
     * @deprecated Pass the token's chain (`new Token(chain, params)`). Without it, the token takes its chain from the
     * global chain list (getChainById).
     */
    constructor(params: TokenConstructor)
    constructor(...args: [C, TokenConstructor] | [TokenConstructor]) {
        const [chain, params] = args.length === 2 ? args : [undefined, args[0]]
        // Without a chain, C is the default, which allows undefined.
        this.#chain = tokenChain(chain, params) as C
        validateSolidityTypeInstance(JSBI.BigInt(params.decimals), SolidityType.uint8)

        this.decimals = params.decimals
        this.symbol = params.symbol
        this.name = params.name
        this.chainId = params.chainId
        this.icons = params.icons
        this.chainFromId = params.chainFromId
        this.userToken = params.userToken
        this.deprecated = !!params.deprecated
        this.attributes = params.attributes

        this.address = tokenAddress(this.#chain, params.address)
    }

    public toString(): string {
        return `${this.symbol || this.name || this.address}@${this.chainId}`
    }

    public get isNative(): boolean {
        return this.address === '' && !this.attributes?.ton && !this.attributes?.solana
    }

    /**
     * Returns the token that pools hold for this one. That is the chain's wrapped gas token when this token is native
     * (`isNative`) and the chain has one. Otherwise it is the token itself, such as Metis's gas token, which is a
     * contract.
     */
    public get wrapped(): Token<C> {
        // A chain builds its wrapped gas token on itself, so it is a Token<C>. TypeScript keeps that (Chain's
        // `Token<this>`) only through a chain type without undefined; the cast goes with `new Token(params)` (rdyrn,
        // step 5).
        return ((this.isNative && this.#chain?.wrappedGasToken) || this) as Token<C>
    }

    /** Returns true if the two tokens have the same chain id and address. */
    public equals(other: Token): boolean {
        if (this === other) {
            return true
        }
        return this.chainId === other.chainId && this.address === other.address
    }

    /**
     * Checks whether this token's address sorts before the other's. Errors when the tokens have the same address or
     * are on different chains.
     */
    public sortsBefore(other: Token): boolean {
        invariant(this.chainId === other.chainId, 'CHAIN_IDS')
        invariant(this.address !== other.address, 'ADDRESSES')
        return this.address.toLowerCase() < other.address.toLowerCase()
    }

    /**
     * Returns the two tokens, or the two amounts of tokens, sorted by the tokens' addresses (sortsBefore). Errors when
     * the tokens have the same address or are on different chains.
     */
    public static sorted<T extends Token | { readonly token: Token }>(a: T, b: T): [T, T] {
        const tokenOf = (x: T): Token => (x instanceof Token ? x : (x as { readonly token: Token }).token)
        return tokenOf(a).sortsBefore(tokenOf(b)) ? [a, b] : [b, a]
    }

    get isSynthetic() {
        return !!this.chainFromId
    }

    /** The token's chain; undefined only for a token built without one (deprecated) on a chain sdk-types does not know. */
    get chain(): C {
        return this.#chain
    }

    /**
     * @deprecated Take the chain from a Deployment (`deployment.findChain(chainFromId)` for a synthetic), or use the
     * synthetic's `original` (SyntheticToken).
     */
    get chainFrom(): Chain | undefined {
        return getChainById(this.chainFromId)
    }

    get tonAddress(): string {
        if (!this.attributes?.ton) {
            throw new Error(`${this.name} has no ton address`)
        }
        return this.attributes.ton
    }

    get solAddress(): string {
        if (!this.attributes?.solana) {
            throw new Error(`${this.name} has no solana address`)
        }
        return this.attributes.solana
    }
}

function tokenChain(chain: Chain | undefined, params: TokenConstructor): Chain | undefined {
    if (!chain) return getChainById(params.chainId)
    if (chain.id !== params.chainId) throw new Error(`a token of chain ${params.chainId} given chain ${chain.id}`)
    return chain
}

/**
 * Returns a token's address parsed by `chain.parseAddress`, or by EIP-55 alone when sdk-types does not know the chain,
 * and keeps a gas token's empty address (README, "Deployments and chains"). Errors when that parse refuses the address.
 */
function tokenAddress(chain: Chain | undefined, address: Address): TokenAddress {
    if (address === '') return address
    const evm = chain?.kind === 'tron' ? tronAddressToEvm(address) : address
    return chain ? chain.parseAddress(evm) : parseEvmAddress(evm)
}

/** @deprecated Use `token.equals(other)`. */
export function tokenEquals(tokenA: Token, tokenB: Token): boolean {
    return tokenA.equals(tokenB)
}

/** @deprecated Use the chain's kind instead (`token.chain?.kind === 'tron'`). */
export function isTronToken(token: Token): boolean {
    return token.chain?.kind === 'tron'
}

/**
 * Checks whether a chain sdk-types knows has no wrapped gas token (its WETH entry is a placeholder). False for a chain
 * it does not know.
 * @deprecated Use the chain's `wrappedGasToken`, which is undefined on a chain without one.
 */
export function isFakeWETH(chainId: ChainId): boolean {
    const chain = getChainById(chainId)
    return chain !== undefined && chain.wrappedGasToken === undefined
}

/**
 * On a chain without a wrapped gas token, the entry is a placeholder token with no address and no decimals.
 * @deprecated Use the chain's `wrappedGasToken` (Chain) instead.
 */
export const WETH = chainTable(
    (chain) => chain.wrappedGasToken ?? new Token(chain, { chainId: chain.id, address: '', decimals: 0 })
)
