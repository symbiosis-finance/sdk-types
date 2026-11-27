import { z } from 'zod'

import { evmAddressSchema } from '../../../addresses'
import type { TokenConstructor } from '../../../entities'
import { type Address, chainIdSchema, type OmniPoolConfig, omniPoolConfigSchema } from '../../types'

// The parse checksums EVM addresses, so the objects compare them exactly (svc-symbiosis-api task rdyrn, State).

// A schema for each field of T. An object schema whose shape `satisfies` it reads all of T's fields and no others, so a
// field added to T does not compile until the schema reads it too.
type Shape<T> = { [K in keyof T]-?: z.core.$ZodType<T[K]> }

// A token's address: an EVM address, another chain's address (Tron, TON, Bitcoin) as it is, or empty for a gas token.
const addressSchema = z.union([
    evmAddressSchema,
    z.custom<Address>(
        (value) => typeof value === 'string' && /^(T\w+|[EU]Q[\w-]+|bc1\w+|[13]\w+|)$/.test(value),
        'an address'
    ),
])

/**
 * A token's id in a deployment's data. The objects refer to each other directly (svc-symbiosis-api task rdyrn,
 * State).
 */
export const tokenIdSchema = z.number().int().nonnegative().brand<'TokenId'>()
export type TokenId = z.infer<typeof tokenIdSchema>

/** An omni pool's id in a deployment's data. */
export const omniPoolIdSchema = z.number().int().nonnegative().brand<'OmniPoolId'>()
export type OmniPoolId = z.infer<typeof omniPoolIdSchema>

/**
 * A token's index in an omni pool contract, as its swap and `indexToAsset` take it. Not a position in a list: the
 * indexes have gaps where a token left the pool. Get one from the pool (`OmniPool.indexOf`).
 */
export const omniPoolTokenIndexSchema = z.number().int().nonnegative().brand<'OmniPoolTokenIndex'>()
export type OmniPoolTokenIndex = z.infer<typeof omniPoolTokenIndexSchema>

/** @deprecated The data's ids are TokenId and OmniPoolId. */
export type Id = number

export type TokenInfo = TokenConstructor & {
    id: TokenId
    originalId?: TokenId
}

export const tokenInfoSchema = z
    .object({
        id: tokenIdSchema,
        originalId: tokenIdSchema.optional(),
        name: z.string().optional(),
        symbol: z.string().optional(),
        address: addressSchema,
        decimals: z.number().int().min(0).max(255),
        chainId: chainIdSchema,
        chainFromId: chainIdSchema.optional(),
        icons: z.object({ large: z.string().optional(), small: z.string().optional() }).optional(),
        userToken: z.boolean().optional(),
        deprecated: z.boolean().optional(),
        origin: z.string().optional(),
        attributes: z.object({ solana: z.string().optional(), ton: z.string().optional() }).optional(),
    } satisfies Shape<TokenInfo>)
    .superRefine((info, ctx) => {
        if ((info.originalId === undefined) !== (info.chainFromId === undefined)) {
            ctx.addIssue({
                code: 'custom',
                message: `Token ${info.address} on chain ${info.chainId} has only one of originalId and chainFromId`,
            })
        }
    })

export const omniPoolTokenSchema = z.object({
    index: omniPoolTokenIndexSchema,
    tokenId: tokenIdSchema,
})
export type OmniPoolToken = z.infer<typeof omniPoolTokenSchema>

export type OmniPoolInfo = OmniPoolConfig & {
    id: OmniPoolId
    tokens: OmniPoolToken[]
}

export const omniPoolInfoSchema = omniPoolConfigSchema.extend({
    id: omniPoolIdSchema,
    tokens: z
        .array(omniPoolTokenSchema)
        .refine((tokens) => unique(tokens.map((token) => token.tokenId)), 'unique token ids'),
}) satisfies z.ZodType<OmniPoolInfo>

export type ConfigCacheData = {
    tokens: TokenInfo[]
    omniPools: OmniPoolInfo[]
}

export const configCacheDataSchema = z.object({
    tokens: z.array(tokenInfoSchema).refine((tokens) => unique(tokens.map((token) => token.id)), 'unique token ids'),
    omniPools: z.array(omniPoolInfoSchema),
} satisfies Shape<ConfigCacheData>)

function unique(values: unknown[]): boolean {
    return new Set(values).size === values.length
}

/** Reads a deployment's config cache data from JSON. Errors listing what does not match. */
export function parseConfigCacheData(json: unknown): ConfigCacheData {
    return configCacheDataSchema.parse(json)
}
