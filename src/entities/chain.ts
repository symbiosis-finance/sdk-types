import invariant from 'tiny-invariant'

import { eip1191ChainIdOf, type EvmAddress, formatEip1191, parseEvmAddress } from '../addresses'
import { ChainId, type Icons } from '../constants'
import type { ChainData, ChainKind } from '../crosschain/types'
import { type PairAddressOf, pairAddressesOf } from './pairAddresses'
import { Token } from './token'

/**
 * A chain over its own data (ChainData), which is the same in every deployment. A deployment's setup on the chain is on
 * DeployedChain (README.md, "Deployments and chains").
 */
export class Chain {
    public readonly id: ChainId
    public readonly name: string
    /** The base URL of the chain's block explorer, such as `https://etherscan.io`. */
    public readonly explorer: string
    public readonly icons: Icons
    public readonly kind: ChainKind
    /**
     * @deprecated Always false. Whether an app shows a chain as out of service is the app's to keep, in its own chain
     * type (svc-symbiosis-api task rdyrn, State).
     */
    public readonly disabled: boolean = false
    /**
     * @deprecated Always true. Whether an app offers a chain for swaps is the app's to keep, in its own chain type
     * (svc-symbiosis-api task rdyrn, State).
     */
    public readonly swappable: boolean = true

    /**
     * The token that pays for gas, such as ETH or BNB. Its address is empty unless the gas token is also a contract,
     * such as Metis's.
     */
    public readonly gasToken: Token<this>
    /** The wrapped gas token, such as WETH, WBNB or WTRX. */
    public readonly wrappedGasToken?: Token<this>
    private readonly pairAddressOf: PairAddressOf

    public constructor(public readonly data: ChainData) {
        this.id = data.id
        this.name = data.name
        this.explorer = data.explorer
        this.icons = data.icons
        this.kind = data.kind
        this.gasToken = new Token(this, data.gasToken)
        this.wrappedGasToken = data.wrappedGasToken && new Token(this, data.wrappedGasToken)
        this.pairAddressOf = pairAddressesOf(data)
    }

    /**
     * Returns the EIP-55 form of an address given all in lowercase or all in uppercase, in EIP-55, or in the chain's
     * own checksum (`EvmChainData.addressChecksum`; README, "Deployments and chains"). Errors when the address is empty
     * or in none of these forms.
     */
    public parseAddress(address: string): EvmAddress {
        return parseEvmAddress(address, eip1191ChainIdOf(this.data))
    }

    /**
     * Returns the address in the chain's own spelling, for display: EIP-1191 on a chain whose addresses take it
     * (`EvmChainData.addressChecksum`), else EIP-55 (README, "Addresses").
     */
    public formatAddress(address: EvmAddress): string {
        const eip1191ChainId = eip1191ChainIdOf(this.data)
        return eip1191ChainId === undefined ? address : formatEip1191(address, eip1191ChainId)
    }

    /**
     * Returns the address of this chain's Uniswap V2 pair of the two tokens, in either order. Errors when either token
     * is on another chain, or when the two have the same address. On a chain whose data lists its pairs, it also errors
     * when the list has no pair of these two.
     */
    public pairAddress(tokenA: Token, tokenB: Token): EvmAddress {
        invariant(tokenA.chainId === this.id, 'CHAIN_ID')
        const [token0, token1] = Token.sorted(tokenA, tokenB)
        return this.pairAddressOf(token0.address, token1.address)
    }
}

/**
 * The type of an app's plain copy of a chain, such as `{ ...chain, disabled: true }`, which is no longer a Chain
 * (README.md, "Upgrading from 0.0.x").
 */
export type ChainMetadata = Pick<Chain, 'id' | 'name' | 'explorer' | 'icons' | 'kind' | 'disabled' | 'swappable'>
