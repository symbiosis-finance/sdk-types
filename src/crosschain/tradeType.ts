/**
 * Real canonical enum copied verbatim from js-sdk 3.11.60
 * (js-sdk/src/crosschain/trade/symbiosisTrade.ts — the rest of that file is web3-heavy).
 * Zero web3 imports — pure value type.
 *
 * NOTE: in 3.11.60 the enum was renamed from `SymbiosisTradeType` to `TradeProvider`
 * and gained CHANGELLY / UNI_V4 / KYBER_SWAP / ZERO_X / INTENT_SOLVER.
 */
export enum TradeProvider {
    UNI_V2 = 'uni-v2',
    UNI_V3 = 'uni-v3',
    ONE_INCH = '1inch',
    OPEN_OCEAN = 'open-ocean',
    WRAP = 'wrap',
    IZUMI = 'izumi',
    OCTOPOOL = 'octopool',
    SYMBIOSIS = 'symbiosis',
    THORCHAIN_BRIDGE = 'thorchain-bridge',
    CHAINFLIP_BRIDGE = 'chainflip-bridge',
    RAYDIUM = 'raydium',
    STONFI = 'stonfi',
    DEDUST = 'dedust',
    JUPITER = 'jupiter',
    DEPOSITORY = 'depository',
    CHANGELLY = 'changelly',
    UNI_V4 = 'uni-v4',
    KYBER_SWAP = 'kyber-swap',
    ZERO_X = '0x',
    INTENT_SOLVER = 'intent-solver',
}

export const FILTERABLE_PROVIDERS: TradeProvider[] = [
    TradeProvider.ONE_INCH,
    TradeProvider.OPEN_OCEAN,
    TradeProvider.UNI_V2,
    TradeProvider.UNI_V3,
    TradeProvider.IZUMI,
    TradeProvider.THORCHAIN_BRIDGE,
    TradeProvider.CHAINFLIP_BRIDGE,
    TradeProvider.RAYDIUM,
    TradeProvider.JUPITER,
    TradeProvider.STONFI,
    TradeProvider.DEDUST,
    TradeProvider.CHANGELLY,
    TradeProvider.UNI_V4,
    TradeProvider.KYBER_SWAP,
    TradeProvider.ZERO_X,
    TradeProvider.INTENT_SOLVER,
]

/**
 * Real type copied from js-sdk/src/crosschain/trade/oneInchTrade.ts.
 * `export type OneInchProtocols = string[]`
 */
export type OneInchProtocols = string[]
