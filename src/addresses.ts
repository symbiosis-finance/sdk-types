// The only module that makes an address type: its parsers (README, "Addresses").
import { getAddress } from '@ethersproject/address'
import { isHexString } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import invariant from 'tiny-invariant'
import { z } from 'zod'

import type { ChainId } from './constants'

declare const brand: unique symbol
/** A `T` that only a parser of this module makes. */
type Brand<T, B extends string> = T & { readonly [brand]: B }

/** An EVM address as data writes it, not yet parsed. */
export type EvmAddressText = `0x${string}`

/** An EVM address: 20 bytes in EIP-55 form, made only by the parsers (README, "Addresses"). */
export type EvmAddress = Brand<EvmAddressText, 'evm'>

/**
 * Returns the EIP-55 form of an address given all in lowercase or all in uppercase, with a valid EIP-55 checksum, or
 * with a valid EIP-1191 checksum for `eip1191ChainId` when that is given. Errors when the address is in none of these
 * forms.
 */
export function parseEvmAddress(address: string, eip1191ChainId?: ChainId): EvmAddress {
    const parsed = evmAddressOf(address, eip1191ChainId)
    invariant(parsed, notAnAddress(address))
    return parsed
}

// parseEvmAddress's result, or undefined where it errors.
function evmAddressOf(address: string, eip1191ChainId?: ChainId): EvmAddress | undefined {
    const input =
        eip1191ChainId !== undefined && hasEip1191Checksum(address, eip1191ChainId) ? address.toLowerCase() : address
    try {
        // getAddress gives an EIP-55 0x address or throws, but types it as a string.
        return getAddress(input) as EvmAddress
    } catch {
        return undefined
    }
}

const notAnAddress = (address: string) => `${address} is not a valid address.`

/** The zero address, which the data gives where a chain has no such contract. */
export const ZERO_EVM_ADDRESS = parseEvmAddress('0x0000000000000000000000000000000000000000')

/**
 * Checks whether the address has a valid EIP-1191 checksum for the chain id. EIP-1191 is EIP-55 with the chain id and
 * "0x" put before the lowercase address in the hashed text.
 */
function hasEip1191Checksum(address: string, chainId: ChainId): boolean {
    return isHexString(address, 20) && eip1191Spelling(address, chainId) === address
}

/** Returns the address in EIP-1191's spelling for the chain id, which a chain such as Rootstock shows. */
export function formatEip1191(address: EvmAddress, chainId: ChainId): string {
    return eip1191Spelling(address, chainId)
}

// The spelling of a 0x address of 20 bytes, given in any case, with the EIP-1191 checksum of the chain id.
function eip1191Spelling(address: string, chainId: ChainId): string {
    const lower = address.slice(2).toLowerCase()
    const hash = keccak256(toUtf8Bytes(`${chainId}0x${lower}`)).slice(2)
    return `0x${[...lower].map((char, i) => (parseInt(hash[i], 16) >= 8 ? char.toUpperCase() : char)).join('')}`
}

/**
 * Returns the id of the chain whose EIP-1191 checksum the chain's addresses take (`EvmChainData.addressChecksum`), or
 * undefined for a chain whose addresses take EIP-55 alone.
 */
export function eip1191ChainIdOf(data: {
    id?: ChainId
    kind?: string
    addressChecksum?: 'eip1191'
}): ChainId | undefined {
    return data.kind === 'evm' && data.addressChecksum === 'eip1191' ? data.id : undefined
}

/** Returns a schema that parses an EVM address's text with parseEvmAddress, and reports a zod issue when it fails. */
function evmAddressSchemaOn(eip1191ChainId?: ChainId) {
    return z
        .custom<EvmAddressText>((value) => typeof value === 'string' && value.startsWith('0x'), 'an EVM address')
        .transform((text, ctx) => {
            const parsed = evmAddressOf(text, eip1191ChainId)
            if (parsed) return parsed
            ctx.addIssue({ code: 'custom', message: notAnAddress(text) })
            return z.NEVER
        })
}

/** The schema of an EVM address in data: text in lowercase, in uppercase or in EIP-55, which it parses into EIP-55. */
export const evmAddressSchema = evmAddressSchemaOn()

/** The type of the address schemas, such as `evmAddressSchema`. */
export type EvmAddressSchema = typeof evmAddressSchema

/**
 * Returns the schema of one chain's data, whose EVM addresses also take that chain's own checksum. `schemaOf` builds
 * the data's schema from an address schema; `eip1191ChainIdOf` reads the chain from the data before it is checked.
 */
export function onChain<S extends z.ZodType>(
    schemaOf: (address: EvmAddressSchema) => S,
    eip1191ChainIdOf: (input: Partial<z.input<S>>) => ChainId | undefined
) {
    const schemas = new Map<ChainId | undefined, S>()
    const schemaOn = (chainId: ChainId | undefined): S => {
        let schema = schemas.get(chainId)
        if (!schema) {
            schema = schemaOf(chainId === undefined ? evmAddressSchema : evmAddressSchemaOn(chainId))
            schemas.set(chainId, schema)
        }
        return schema
    }
    return z
        .custom<z.input<S>>((value) => typeof value === 'object' && value !== null, 'an object')
        .transform((input, ctx): z.output<S> => {
            const parsed = schemaOn(eip1191ChainIdOf(input)).safeParse(input)
            if (parsed.success) return parsed.data
            for (const issue of parsed.error.issues) ctx.addIssue({ ...issue })
            return z.NEVER
        })
}
