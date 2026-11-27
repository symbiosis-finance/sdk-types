import { z } from 'zod'

import {
    eip1191ChainIdOf,
    type EvmAddress,
    type EvmAddressSchema,
    type EvmAddressText,
    evmAddressSchema,
    onChain,
} from '../addresses'
import { ChainId, type Icons } from '../constants'
import type { Percent, ProfilerItem, Token, TokenAmount, TokenConstructor } from '../entities'
import type { Cache } from './cache'
import type { TronTransactionData } from './tronTypes'
import type { ConfigCacheData } from './config/cache/types'
import type { SwapLabel } from './labels'
import { TradeProvider } from './tradeType'
import type { OneInchProtocols } from './tradeType'

// Structural stand-ins for the ethers types, defined locally (erased at build).
export type BytesLike = string | ArrayLike<number>
export type BigNumber = { _hex: string; _isBigNumber: boolean }
export type TransactionRequest = {
    to?: string
    from?: string
    data?: BytesLike
    value?: BigNumber | string | number
    chainId?: number
    gasLimit?: BigNumber | string | number
    gasPrice?: BigNumber | string | number
    [key: string]: unknown
}

export type { TronTransactionData }
export { TradeProvider }
export type { OneInchProtocols }
export type { SwapLabel }

// Opaque placeholders for class refs sdk-types never instantiates — used only in type
// positions and erased at runtime.
/** Opaque alias used by SwapExactInParams — avoids a circular import with Symbiosis. */
type Symbiosis = unknown
export type PartnerFeeCollector = unknown
/**
 * Opaque placeholder for the SymbiosisTrade class. SwapExactInResult.tradeA/tradeC reference it,
 * but consumers only read them opaquely. Minimal structural shape so `trade.tradeType` compiles.
 */
export interface SymbiosisTrade {
    readonly tradeType?: TradeProvider
    [k: string]: unknown
}

export enum Field {
    INPUT = 'INPUT',
    OUTPUT = 'OUTPUT',
}

export { evmAddressSchema, parseEvmAddress, ZERO_EVM_ADDRESS } from '../addresses'
export type { EvmAddress, EvmAddressText } from '../addresses'
export type TronAddress = `T${string}`
export type TonBounceableAddress = `E${string}`
export type TonNonbounceableAddress = `U${string}`
export type TonAddress = TonBounceableAddress | TonNonbounceableAddress
export type BtcAddress = `bc1${string}` | `1${string}` | `3${string}`
export type EmptyAddress = ''
export type NonEmptyAddress = EvmAddressText | TronAddress | TonAddress | BtcAddress
/** An address of any kind as it is written, not yet parsed (README, "Addresses"). */
export type Address = NonEmptyAddress | EmptyAddress
/**
 * The address of a token's contract in EIP-55 form, converted to EVM form on Tron (README, "Deployments and chains").
 * A native gas token (`Token.isNative`) has the empty address.
 */
export type TokenAddress = EvmAddress | EmptyAddress

export interface VolumeFeeCollector {
    chainId: ChainId
    address: Address
    feeRate: string
    eligibleChains: ChainId[]
    default?: boolean
}

export type BridgeDirection = 'burn' | 'mint' | 'v2'

// The data's types are written once, generic in the type of their EVM addresses `A`: `…Of<EvmAddressText>` is the
// data as written (the `…Input` types), and `…Of<EvmAddress>` is the data parsed, which code reads (README,
// "Addresses"). Each type's schema below parses the one into the other, and is checked against both.

export type PriceEstimationConfig = {
    enabled: boolean
    slippageMax: number // Maximum slippage - used for tokenAmountOutMin calculation and delayed solving.
    slippageNorm: number // Normal slippage - used for tokenAmountOut calculation and immetiate solving.
}

// Addresses of Intent contracts (intent-based swap protocol)
export type IntentConfigOf<A extends EvmAddressText> = {
    depositorySrc: A // Depository contract on the src chain
    depositoryDst: A // Depository contract on the dst chain
    deadlineUnlocker: A // DeadlineUnlocker contract on the src chain
    bridge: A
}
export type IntentConfig = IntentConfigOf<EvmAddress>
export type IntentConfigInput = IntentConfigOf<EvmAddressText>

// Addresses of Depository contracts
export type DepositoryConfigOf<A extends EvmAddressText> = {
    depository: A
    withdrawUnlocker: A
    branchedUnlocker: A
    timedUnlocker: A
    timedSwapUnlocker: A
    btcRefundUnlocker?: A
    priceEstimation: PriceEstimationConfig
    refundDelay?: number // Minimal delay before refund
    withdrawDelay: number // Minimal delay before withdraw
    minAmountDelay: number // Minimal delay before swap with minimal amount
}
export type DepositoryConfig = DepositoryConfigOf<EvmAddress>
export type DepositoryConfigInput = DepositoryConfigOf<EvmAddressText>

/**
 * The data of a chain that is the same in every deployment. A deployment's setup on the chain is its ChainConfig
 * (README, "Deployments and chains").
 */
export type ChainDataOf<A extends EvmAddressText> =
    EvmChainDataOf<A> | BtcChainDataOf<A> | (ChainDataBaseOf<A> & { kind: Exclude<ChainKind, 'evm' | 'btc'> })
export type ChainData = ChainDataOf<EvmAddress>
export type ChainDataInput = ChainDataOf<EvmAddressText>

export type EvmChainDataOf<A extends EvmAddressText> = ChainDataBaseOf<A> & {
    kind: 'evm'
    /** The checksum of mixed-case addresses on this chain, when it is not EIP-55 (README, "Addresses"). */
    addressChecksum?: 'eip1191'
}
export type EvmChainData = EvmChainDataOf<EvmAddress>
export type EvmChainDataInput = EvmChainDataOf<EvmAddressText>

export type BtcChainDataOf<A extends EvmAddressText> = ChainDataBaseOf<A> & {
    kind: 'btc'
    /** The address format of a Bitcoin chain. */
    btcNetwork: 'bitcoin' | 'testnet' | 'regtest'
}
export type BtcChainData = BtcChainDataOf<EvmAddress>
export type BtcChainDataInput = BtcChainDataOf<EvmAddressText>

type ChainDataBaseOf<A extends EvmAddressText> = {
    id: ChainId
    name: string
    explorer: string
    icons: Icons
    gasToken: TokenConstructor
    /** The wrapped gas token, such as WETH, WBNB or WTRX. */
    wrappedGasToken?: TokenConstructor
    multicall?: A
    /** The Uniswap V2 factory whose pair addresses are derived (CREATE2), or the pairs' addresses themselves. */
    uniswapV2: { factory: A; initCodeHash: string } | { pairs: UniV2PairAddressOf<A>[] }
    coinGecko?: { platform?: string; gasTokenId?: string }
}

/**
 * The kind of a chain. It decides the chain's address format and how a transfer to it is built. A `perp` chain is a
 * perp venue (Hyperliquid, Lighter). It is a deposit destination only, and its balances come from the venue's API, not
 * from an RPC. An `other` chain is one that only partners (Changelly, THORChain) reach.
 */
export type ChainKind = 'evm' | 'btc' | 'tron' | 'ton' | 'solana' | 'quai' | 'perp' | 'other'

/** A Uniswap V2 pair's address. The order of the two tokens does not matter. */
export type UniV2PairAddressOf<A extends EvmAddressText> = {
    token0: A
    token1: A
    pair: A
}
export type UniV2PairAddress = UniV2PairAddressOf<EvmAddress>
export type UniV2PairAddressInput = UniV2PairAddressOf<EvmAddressText>

/**
 * A router that takes both the approval and the call at `gateway`. Users never approve `executor`, which runs the inner
 * DEX swaps.
 */
export type GatewayRouterOf<A extends EvmAddressText> = {
    gateway: A
    executor: A
}
export type GatewayRouter = GatewayRouterOf<EvmAddress>
export type GatewayRouterInput = GatewayRouterOf<EvmAddressText>

/** @deprecated Use `GatewayRouter`. */
export type ApprovableMetaRouter = GatewayRouter

/** @deprecated Use `GatewayRouter`. */
export type OnchainSwapRouter = GatewayRouter

/** A deployment's setup on one chain (README, "Deployments and chains"). */
export type ChainConfigOf<A extends EvmAddressText> = {
    /** The chain's parsed data: `chainData(id)` for a chain sdk-types knows, else `chainDataSchema.parse(data)`. */
    chain: ChainData
    /** Equals chain.id. A Deployment errors otherwise. */
    id: ChainId
    rpc: string
    headers?: Record<string, string>
    spareRpcs?: string[]
    dexFee: number
    filterBlockOffset: number
    stables: TokenConstructor[]
    metaRouter: A
    metaRouterGateway: A
    // Inner-swap executor for the legacy scheme. Only needed on new-metaRouter-only chains where
    // metaRouter points at the new gateway (which delegates inner swaps to a dedicated executor
    // instead of running them itself). When absent, the legacy scheme executes via metaRouter.
    metaRouterExecutor?: A
    multicallRouter: A
    router: A
    bridge: A
    synthesis: A
    portal: A
    pauser?: A
    fabric: A
    tonPortal?: string
    partnerFeeCollector?: A
    depository?: DepositoryConfigOf<A>
    intentConfig?: IntentConfigOf<A>
    multicallRouterV2?: A
    /** The Symbiosis fee of a swap through this router is read from its gateway contract, not from the config. */
    onchainSwapRouter?: GatewayRouterOf<A>
    /** The zero-fee router for on-chain zaps into Bitcoin. A chain without one uses `onchainSwapRouter`. */
    onchainZeroFeeSwapRouter?: GatewayRouterOf<A>
    /** A legacy FeeCollector, for partners that whitelisted it in their contracts. */
    legacyFeeCollector?: A
    /**
     * A zero-fee legacy FeeCollector for on-chain zaps into Bitcoin, for partners that whitelisted it in their
     * contracts.
     */
    legacyZeroFeeCollector?: A
    approvableMetaRouter?: GatewayRouterOf<A>
    /** The Unwrapper (core-contracts periphery/Unwrapper.sol), which pays out in the gas token. */
    unwrapper?: A
}
export type ChainConfig = ChainConfigOf<EvmAddress>
export type ChainConfigInput = ChainConfigOf<EvmAddressText>

export type AdvisorConfig = {
    url: string
}

// Solver service base URL (intent-based swaps)
export type SolverConfig = {
    url: string
}

// Perpbot aggregator base URL (perp deposit zaps into Hyperliquid/Lighter)
export type PerpbotConfig = {
    url: string
}

/** The omni pool contract on the host chain. It swaps between the synthetics of one asset's tokens. */
export type OmniPoolConfigOf<A extends EvmAddressText> = {
    /** The chain the pool's contract is on (the deployment's host chain). */
    chainId: ChainId
    address: A
    /** The address of the pool's oracle contract (`OmniPoolOracle`), which quotes swaps through the pool. */
    oracle: A
    /**
     * True if a route may swap on its source or destination chain to reach this pool's tokens (USDC, WETH on mainnet).
     * False if a route through the pool carries only the pool's own asset.
     */
    generalPurpose: boolean
    /** The CoinGecko id of the asset that the pool holds. It also names the pool. */
    coinGeckoId: OmniPoolCoinGeckoId
}
export type OmniPoolConfig = OmniPoolConfigOf<EvmAddress>
export type OmniPoolConfigInput = OmniPoolConfigOf<EvmAddressText>

export const OMNI_POOL_COIN_GECKO_IDS = [
    'usd-coin',
    'weth',
    'bitcoin',
    'g-token',
    'binancecoin',
    'symbiosis-finance',
    'apecoin',
    'evaa-protocol',
    'dropee',
] as const

export type OmniPoolCoinGeckoId = (typeof OMNI_POOL_COIN_GECKO_IDS)[number]

export type SwapLimit = {
    chainId: ChainId
    address: string
    min: string
    max: string
}

export type BtcConfigOf<A extends EvmAddressText> = {
    btc: Token
    // The SymBtc helper contract, not the symBTC token: it packs the wrap tail
    // and computes BTC external IDs. chainId is where the portal mints symBTC.
    symBtcHelper: {
        address: A
        chainId: ChainId
        // The portal's own Synthesis and Fabric on symBtcHelper.chainId, when they
        // differ from the chain's general ones in ChainConfig.
        synthesis?: A
        fabric?: A
    }
    forwarderUrl: string
}
export type BtcConfig = BtcConfigOf<EvmAddress>
export type BtcConfigInput = BtcConfigOf<EvmAddressText>

export type CoinGeckoConfig = {
    url: string
}

/** A deployment's config (README, "Deployments and chains"). */
export type ConfigOf<A extends EvmAddressText> = {
    advisor: AdvisorConfig
    coinGecko?: CoinGeckoConfig
    omniPools: OmniPoolConfigOf<A>[]
    revertableAddress: Partial<Record<ChainId, A>> & { default: A }
    limits: SwapLimit[]
    chains: ChainConfigOf<A>[]
    fallbackReceiver: A
    btcConfigs: BtcConfigOf<A>[]
    solver?: SolverConfig
    perpbot?: PerpbotConfig
}
export type Config = ConfigOf<EvmAddress>
export type ConfigInput = ConfigOf<EvmAddressText>

// The schemas. A type with an `…On` schema builder is part of one chain's data, whose addresses also take that chain's
// own checksum (`onChain`).

/** The schema of a chain id. It checks only that the id is an integer. */
export const chainIdSchema = z.custom<ChainId>((value) => Number.isInteger(value), 'a chain id')

// An object schema's shape that names each field of T and no other, which `satisfies z.ZodType` alone does not check
// for optional fields.
type Fields<T> = Record<keyof T, unknown>

// A value that is not checked here, such as a token's data, which `new Token` checks.
const unchecked = <T>(what: string) => z.custom<T>((value) => typeof value === 'object' && value !== null, what)

const tokenConstructorSchema = unchecked<TokenConstructor>('a token')
const urlSchema = z.object({ url: z.string() })

export const priceEstimationConfigSchema = z.object({
    enabled: z.boolean(),
    slippageMax: z.number(),
    slippageNorm: z.number(),
} satisfies Fields<PriceEstimationConfig>) satisfies z.ZodType<PriceEstimationConfig, PriceEstimationConfig>

const intentConfigOn = (address: EvmAddressSchema) =>
    z.object({
        depositorySrc: address,
        depositoryDst: address,
        deadlineUnlocker: address,
        bridge: address,
    } satisfies Fields<IntentConfig>) satisfies z.ZodType<IntentConfig, IntentConfigInput>
export const intentConfigSchema = intentConfigOn(evmAddressSchema)

const depositoryConfigOn = (address: EvmAddressSchema) =>
    z.object({
        depository: address,
        withdrawUnlocker: address,
        branchedUnlocker: address,
        timedUnlocker: address,
        timedSwapUnlocker: address,
        btcRefundUnlocker: address.optional(),
        priceEstimation: priceEstimationConfigSchema,
        refundDelay: z.number().optional(),
        withdrawDelay: z.number(),
        minAmountDelay: z.number(),
    } satisfies Fields<DepositoryConfig>) satisfies z.ZodType<DepositoryConfig, DepositoryConfigInput>
export const depositoryConfigSchema = depositoryConfigOn(evmAddressSchema)

const uniV2PairAddressOn = (address: EvmAddressSchema) =>
    z.object({
        token0: address,
        token1: address,
        pair: address,
    } satisfies Fields<UniV2PairAddress>) satisfies z.ZodType<UniV2PairAddress, UniV2PairAddressInput>
export const uniV2PairAddressSchema = uniV2PairAddressOn(evmAddressSchema)

const chainDataBaseOn = (address: EvmAddressSchema) => ({
    id: chainIdSchema,
    name: z.string(),
    explorer: z.string(),
    icons: z.object({ large: z.string().optional(), small: z.string().optional() }),
    gasToken: tokenConstructorSchema,
    wrappedGasToken: tokenConstructorSchema.optional(),
    multicall: address.optional(),
    uniswapV2: z.union([
        z.object({ factory: address, initCodeHash: z.string() }),
        z.object({ pairs: z.array(uniV2PairAddressOn(address)) }),
    ]),
    coinGecko: z.object({ platform: z.string().optional(), gasTokenId: z.string().optional() }).optional(),
})

const chainDataOn = (address: EvmAddressSchema): z.ZodType<ChainData, ChainDataInput> =>
    z.discriminatedUnion('kind', [
        z.object({
            ...chainDataBaseOn(address),
            kind: z.literal('evm'),
            addressChecksum: z.literal('eip1191').optional(),
        } satisfies Fields<EvmChainData>) satisfies z.ZodType<EvmChainData, EvmChainDataInput>,
        z.object({
            ...chainDataBaseOn(address),
            kind: z.literal('btc'),
            btcNetwork: z.enum(['bitcoin', 'testnet', 'regtest']),
        } satisfies Fields<BtcChainData>) satisfies z.ZodType<BtcChainData, BtcChainDataInput>,
        z.object({
            ...chainDataBaseOn(address),
            kind: z.enum(['tron', 'ton', 'solana', 'quai', 'perp', 'other'] satisfies Exclude<
                ChainKind,
                'evm' | 'btc'
            >[]),
        }),
    ]) satisfies z.ZodType<ChainData, ChainDataInput>

/** The schema of a chain's data. Its addresses also take the chain's own checksum (`addressChecksum`). */
export const chainDataSchema = onChain(chainDataOn, eip1191ChainIdOf) satisfies z.ZodType<ChainData, ChainDataInput>

const gatewayRouterOn = (address: EvmAddressSchema) =>
    z.object({ gateway: address, executor: address } satisfies Fields<GatewayRouter>) satisfies z.ZodType<
        GatewayRouter,
        GatewayRouterInput
    >
export const gatewayRouterSchema = gatewayRouterOn(evmAddressSchema)

const chainConfigOn = (address: EvmAddressSchema): z.ZodType<ChainConfig, ChainConfigInput> =>
    z.object({
        chain: unchecked<ChainData>("a chain's data"),
        id: chainIdSchema,
        rpc: z.string(),
        headers: z.record(z.string(), z.string()).optional(),
        spareRpcs: z.array(z.string()).optional(),
        dexFee: z.number(),
        filterBlockOffset: z.number(),
        stables: z.array(tokenConstructorSchema),
        metaRouter: address,
        metaRouterGateway: address,
        metaRouterExecutor: address.optional(),
        multicallRouter: address,
        router: address,
        bridge: address,
        synthesis: address,
        portal: address,
        pauser: address.optional(),
        fabric: address,
        tonPortal: z.string().optional(),
        partnerFeeCollector: address.optional(),
        depository: depositoryConfigOn(address).optional(),
        intentConfig: intentConfigOn(address).optional(),
        multicallRouterV2: address.optional(),
        onchainSwapRouter: gatewayRouterOn(address).optional(),
        onchainZeroFeeSwapRouter: gatewayRouterOn(address).optional(),
        legacyFeeCollector: address.optional(),
        legacyZeroFeeCollector: address.optional(),
        approvableMetaRouter: gatewayRouterOn(address).optional(),
        unwrapper: address.optional(),
    } satisfies Fields<ChainConfig>) satisfies z.ZodType<ChainConfig, ChainConfigInput>

/** The schema of a chain config. Its addresses also take its chain's own checksum. */
export const chainConfigSchema = onChain(
    chainConfigOn,
    ({ chain }) => chain && eip1191ChainIdOf(chain)
) satisfies z.ZodType<ChainConfig, ChainConfigInput>

export const omniPoolConfigSchema = z.object({
    chainId: chainIdSchema,
    address: evmAddressSchema,
    oracle: evmAddressSchema,
    generalPurpose: z.boolean(),
    coinGeckoId: z.enum(OMNI_POOL_COIN_GECKO_IDS),
} satisfies Fields<OmniPoolConfig>) satisfies z.ZodType<OmniPoolConfig, OmniPoolConfigInput>

export const btcConfigSchema = z.object({
    btc: unchecked<Token>('a token'),
    symBtcHelper: z.object({
        address: evmAddressSchema,
        chainId: chainIdSchema,
        synthesis: evmAddressSchema.optional(),
        fabric: evmAddressSchema.optional(),
    }),
    forwarderUrl: z.string(),
} satisfies Fields<BtcConfig>) satisfies z.ZodType<BtcConfig, BtcConfigInput>

/** The schema of a deployment's config. `new Deployment` parses its config with it. */
export const configSchema = z.object({
    advisor: urlSchema,
    coinGecko: urlSchema.optional(),
    omniPools: z.array(omniPoolConfigSchema),
    revertableAddress: z.object({ default: evmAddressSchema }).and(z.partialRecord(z.enum(ChainId), evmAddressSchema)),
    limits: z.array(unchecked<SwapLimit>('a swap limit')),
    chains: z.array(chainConfigSchema),
    fallbackReceiver: evmAddressSchema,
    btcConfigs: z.array(btcConfigSchema),
    solver: urlSchema.optional(),
    perpbot: urlSchema.optional(),
} satisfies Fields<Config>) satisfies z.ZodType<Config, ConfigInput>

export type OverrideChainConfig = {
    id: ChainId
    rpc: string
    headers?: Record<string, string>
    spareRpcs?: string[]
}
export type FeeConfig = {
    token: Token
    value: string
}

export type ApiConfig = {
    apiUrl: string
    apiKeys: string[]
}

export type ChangellyConfig = {
    apiUrl: string
    publicSwapPk: string
    privateSwapPk?: string
    privateSwapRefundAddress?: string
}

export type {
    ConfigCacheData,
    Id,
    OmniPoolId,
    OmniPoolInfo,
    OmniPoolToken,
    OmniPoolTokenIndex,
    TokenId,
    TokenInfo,
} from './config/cache/types'

export interface Logger {
    error(message: string, ...args: unknown[]): void
    warn(message: string, ...args: unknown[]): void
    info(message: string, ...args: unknown[]): void
    debug(message: string, ...args: unknown[]): void
}

export type OverrideConfig = {
    btcConfigs?: BtcConfigInput[]
    chains?: OverrideChainConfig[]
    limits?: SwapLimit[]
    fetch?: typeof fetch
    advisor?: AdvisorConfig
    solver?: SolverConfig
    perpbot?: PerpbotConfig
    oneInchConfig?: Partial<ApiConfig>
    openOceanConfig?: Partial<ApiConfig>
    zeroXConfig?: Partial<ApiConfig>
    changellyConfig?: Partial<ChangellyConfig>
    volumeFeeCollectors?: VolumeFeeCollector[]
    cache?: Cache
    config?: ConfigInput
    configCache?: ConfigCacheData
    logger?: Logger
}

export interface RevertableAddress {
    chainId: ChainId
    address: string
}

export type TradeAContext = 'metaRouter' | 'multicallRouter'

export interface SwapExactInParams {
    symbiosis: Symbiosis
    tokenAmountIn: TokenAmount
    tokenAmountInMin?: TokenAmount
    tokenOut: Token
    from: Address
    origin?: Address // in terms of 1inch it's a sender of the tx
    to: Address
    slippage: number
    deadline: number
    oneInchProtocols?: OneInchProtocols
    revertableAddresses?: RevertableAddress[]
    tradeAContext?: TradeAContext
    partnerAddress?: EvmAddress
    refundAddress?: Address
    fallbackReceiver?: EvmAddress
    generateDepositAddress?: boolean
    disableSrcChainRouting?: boolean
    disableDstChainRouting?: boolean
    depositoryEnabled?: boolean
    disabledProviders?: TradeProvider[]
    changellyExtraIdTo?: string // destination tag (XRP) or memo (XLM) for payout address
    // Route the swap privately through Monero (XMR) via Changelly. Default false.
    private?: boolean
    // EIP-712 signature for VotingEscrow gas discount.
    // undefined = fall back to legacy Symbiosis.setSignature() field; null = explicitly no signature.
    signature?: string | null
    // Per-call swap amount limits override.
    // undefined = fall back to legacy Symbiosis instance config.limits; null = no limits.
    limits?: SwapLimit[] | null
}

export type BtcTransactionData = {
    depositAddress: string
    validUntil: string
    tokenAmountOut: TokenAmount
}

export type TonTransactionData = {
    validUntil: number
    messages: {
        address: string
        amount: string
        payload?: string
    }[]
}

export type SolanaTransactionData = {
    instructions: string
}

export type ChangellyTransactionData = {
    changellyTxId: string
    depositAddress: string
    depositExtraId?: string
    amountExpectedFrom: string
    amountExpectedTo: string
    networkFee: string
    validUntil: number
    currencyFrom: string
    currencyTo: string
    refundAddress?: string
    refundExtraId?: string
}

export type SwapExactInTransactionPayload =
    | {
          transactionType: 'evm'
          transactionRequest: TransactionRequest
      }
    | {
          transactionType: 'tron'
          transactionRequest: TronTransactionData
      }
    | {
          transactionType: 'btc'
          transactionRequest: BtcTransactionData
      }
    | {
          transactionType: 'ton'
          transactionRequest: TonTransactionData
      }
    | {
          transactionType: 'solana'
          transactionRequest: SolanaTransactionData
      }
    | {
          transactionType: 'changelly'
          transactionRequest: ChangellyTransactionData
      }

export type RouteItem = {
    provider: TradeProvider
    tokens: Token[]
}

export type FeeItem = {
    provider: TradeProvider
    value: TokenAmount
    save?: TokenAmount
    description?: string
}

export type OperationType =
    | 'onchain-swap'
    | 'crosschain-swap'
    | 'wrap'
    | 'unwrap'
    | 'bridge'
    | 'from-btc-swap'
    | 'changelly-trade'
    | 'changelly-deposit'
    | 'private-swap'
    | 'intent-swap'

export type PrivateSwapData = {
    tradeATxId: string
    tradeBTxId: string
}

// Result of swapExactIn() method.
export type SwapExactInResult = SwapExactInTransactionPayload & {
    operationType: OperationType
    tokenAmountOut: TokenAmount
    tokenAmountOutMin: TokenAmount
    priceImpact: Percent
    approveTo: string
    routes: RouteItem[]
    fees: FeeItem[]
    labels: SwapLabel[]

    amountInUsd?: TokenAmount
    timeLog?: ProfilerItem[]
    routeType?: string
    poolAddress?: string
    tradeA?: SymbiosisTrade
    tradeC?: SymbiosisTrade
    changellyData?: ChangellyTransactionData
    privateSwap?: PrivateSwapData
    permit2Approve?: { to: string; callData: string }
}

export type MulticallV2Item = {
    data: BytesLike
    to: string
    path: string
    offset: number
    isNative: boolean
}

export interface MultiCallItem {
    to: string
    data: BytesLike
    offset: number
    value: string
    amountIn: TokenAmount // is used as approveToken as well
    amountOut: TokenAmount
    amountOutMin: TokenAmount
    priceImpact: Percent
    fees: FeeItem[]
    routes: RouteItem[]
}

export type PartnerFeeCallParams = {
    partnerAddress: string
    partnerFeeCollector: PartnerFeeCollector
    feeRate: BigNumber
    fixedFee: BigNumber
}

export type MetricParams = {
    operation: string
    kind: string
    tokenIn?: Token
    tokenOut?: Token
}

export type AggregatorErrorCounterParams = {
    provider: string
    reason: string
    chain_id: string
}

export type PriceImpactCounterParams = {
    poolConfig: OmniPoolConfig
    tokenAmountFrom: TokenAmount
    tokenTo: Token
    priceImpact: Percent
}

export interface DiscountTier {
    amount: string
    discount: number
}

export enum PendingRequestState {
    Default = 0,
    Sent,
    Reverted,
}

export type PendingRequestType = 'burn' | 'synthesize' | 'burn-v2' | 'burn-v2-revert' | 'synthesize-v2'

export interface PendingRequest {
    originalFromTokenAmount: TokenAmount
    fromTokenAmount: TokenAmount
    transactionHash: string
    state: PendingRequestState
    internalId: string
    externalId: string
    type: PendingRequestType
    from: string
    to: string
    revertableAddress: string
    chainIdFrom: ChainId
    chainIdTo: ChainId
    revertChainId: ChainId
}

export interface BtcDepositAcceptedResult {
    commitTx: string
    btcConfig: BtcConfig
}
