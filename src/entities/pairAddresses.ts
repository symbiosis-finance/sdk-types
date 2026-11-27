import { getCreate2Address as getEvmCreate2Address } from '@ethersproject/address'
import { concat, hexDataSlice, hexZeroPad } from '@ethersproject/bytes'
import { keccak256 as keccak256Bytes } from '@ethersproject/keccak256'
import { keccak256, pack } from '@ethersproject/solidity'
import { toUtf8Bytes } from '@ethersproject/strings'

import { type EvmAddress, parseEvmAddress } from '../addresses'
import { ChainId } from '../constants'
import type { BytesLike, ChainData, TokenAddress } from '../crosschain/types'
import { memoize2 } from '../utils'

/**
 * Returns the address of a chain's Uniswap V2 pair of two tokens. token0 is the address that sorts first
 * (Token.sortsBefore).
 */
export type PairAddressOf = (token0: TokenAddress, token1: TokenAddress) => EvmAddress

/**
 * Returns the function that gives a chain's Uniswap V2 pair addresses: the pairs its data lists, or its factory's
 * CREATE2 addresses (svc-symbiosis-api task rdyrn, State). On a chain whose data lists its pairs, the function errors
 * for a pair it does not list.
 */
export function pairAddressesOf(data: ChainData): PairAddressOf {
    const { uniswapV2 } = data
    if ('pairs' in uniswapV2) {
        return (token0, token1) => {
            const found = uniswapV2.pairs.find((pair) => {
                const tokens: TokenAddress[] = [pair.token0, pair.token1]
                return tokens.includes(token0) && tokens.includes(token1)
            })
            if (!found) throw new Error(`no Uniswap V2 pair of ${token0} and ${token1} on chain ${data.id}`)
            return found.pair
        }
    }
    const create2 =
        data.kind === 'tron'
            ? getTronCreate2Address
            : data.id === ChainId.CRONOS_ZK_MAINNET
              ? getZkCreate2Address
              : (from: EvmAddress, salt: BytesLike, initCodeHash: BytesLike) =>
                    parseEvmAddress(getEvmCreate2Address(from, salt, initCodeHash))
    return memoize2((token0: TokenAddress, token1: TokenAddress) =>
        create2(
            uniswapV2.factory,
            keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
            uniswapV2.initCodeHash
        )
    )
}

function addressOfHash(parts: BytesLike[]): EvmAddress {
    return parseEvmAddress(hexDataSlice(keccak256Bytes(concat(parts)), 12))
}

// zkSync Era's CREATE2: keccak256(keccak256("zksyncCreate2") ‖ sender ‖ salt ‖ bytecodeHash ‖
// keccak256(constructor input))[12:].
const ZKSYNC_CREATE2_PREFIX = keccak256Bytes(toUtf8Bytes('zksyncCreate2'))
const EMPTY_INPUT_HASH = keccak256Bytes('0x')

/**
 * Returns the zkSync Era CREATE2 address of a contract whose constructor takes no input. initCodeHash is the
 * contract's bytecode hash.
 */
export function getZkCreate2Address(from: EvmAddress, salt: BytesLike, initCodeHash: BytesLike): EvmAddress {
    return addressOfHash([ZKSYNC_CREATE2_PREFIX, hexZeroPad(from, 32), salt, initCodeHash, EMPTY_INPUT_HASH])
}

/** Returns Tron's CREATE2 address, which hashes 0x41 in front of the sender. */
function getTronCreate2Address(from: EvmAddress, salt: BytesLike, initCodeHash: BytesLike): EvmAddress {
    return addressOfHash(['0x41', from, salt, initCodeHash])
}
