import { ChainId } from '../constants'
import { CHAIN_DATA } from './chainData'
import type { EvmAddress } from './types'
import { GAS_TOKEN, Token, WETH } from '../entities'
import { chainEntries } from '../utils'

// a list of tokens by chain
type ChainTokensList = {
    readonly [chainId in ChainId]?: Token[]
}

export const WETH_ONLY: ChainTokensList = {
    [ChainId.ETH_MAINNET]: [WETH[ChainId.ETH_MAINNET]],
    [ChainId.ETH_RINKEBY]: [WETH[ChainId.ETH_RINKEBY]],
    [ChainId.ETH_KOVAN]: [WETH[ChainId.ETH_KOVAN]],
    [ChainId.BSC_MAINNET]: [WETH[ChainId.BSC_MAINNET]],
    [ChainId.BSC_TESTNET]: [WETH[ChainId.BSC_TESTNET]],
    [ChainId.MATIC_MAINNET]: [WETH[ChainId.MATIC_MAINNET]],
    [ChainId.MATIC_MUMBAI]: [WETH[ChainId.MATIC_MUMBAI]],
    [ChainId.AVAX_MAINNET]: [WETH[ChainId.AVAX_MAINNET]],
    [ChainId.AVAX_TESTNET]: [WETH[ChainId.AVAX_TESTNET]],
    [ChainId.HECO_MAINNET]: [WETH[ChainId.HECO_MAINNET]],
    [ChainId.HECO_TESTNET]: [WETH[ChainId.HECO_TESTNET]],
    [ChainId.OKEX_MAINNET]: [WETH[ChainId.OKEX_MAINNET]],
    [ChainId.OKEX_TESTNET]: [WETH[ChainId.OKEX_TESTNET]],
    [ChainId.BOBA_MAINNET]: [WETH[ChainId.BOBA_MAINNET]],
    [ChainId.BOBA_AVALANCHE]: [WETH[ChainId.BOBA_AVALANCHE]],
    [ChainId.SYMBIOSIS_TESTNET]: [WETH[ChainId.SYMBIOSIS_TESTNET]],
    [ChainId.SYMBIOSIS_MAINNET]: [WETH[ChainId.SYMBIOSIS_MAINNET]],
    [ChainId.BOBA_RINKEBY]: [WETH[ChainId.BOBA_RINKEBY]],
    [ChainId.MILKOMEDA_MAINNET]: [WETH[ChainId.MILKOMEDA_MAINNET]],
    [ChainId.MILKOMEDA_DEVNET]: [WETH[ChainId.MILKOMEDA_DEVNET]],
    [ChainId.AURORA_MAINNET]: [WETH[ChainId.AURORA_MAINNET]],
    [ChainId.AURORA_TESTNET]: [WETH[ChainId.AURORA_TESTNET]],
    [ChainId.TELOS_MAINNET]: [WETH[ChainId.TELOS_MAINNET]],
    [ChainId.TELOS_TESTNET]: [WETH[ChainId.TELOS_TESTNET]],
    [ChainId.SHARDEUM_TESTNET_2]: [WETH[ChainId.SHARDEUM_TESTNET_2]],
    [ChainId.SCROLL_SEPOLIA]: [WETH[ChainId.SCROLL_SEPOLIA]],
    [ChainId.ZKSYNC_MAINNET]: [WETH[ChainId.ZKSYNC_MAINNET]],
    [ChainId.ARBITRUM_MAINNET]: [WETH[ChainId.ARBITRUM_MAINNET]],
    [ChainId.OPTIMISM_MAINNET]: [WETH[ChainId.OPTIMISM_MAINNET]],
    [ChainId.LINEA_TESTNET]: [WETH[ChainId.LINEA_TESTNET]],
    [ChainId.LINEA_MAINNET]: [WETH[ChainId.LINEA_MAINNET]],
    [ChainId.MANTLE_MAINNET]: [WETH[ChainId.MANTLE_MAINNET]],
    [ChainId.MANTLE_TESTNET]: [WETH[ChainId.MANTLE_TESTNET]],
    [ChainId.BASE_MAINNET]: [WETH[ChainId.BASE_MAINNET]],
    [ChainId.TRON_MAINNET]: [WETH[ChainId.TRON_MAINNET]],
    [ChainId.TRON_TESTNET]: [WETH[ChainId.TRON_TESTNET]],
    [ChainId.SCROLL_MAINNET]: [WETH[ChainId.SCROLL_MAINNET]],
    [ChainId.MANTA_MAINNET]: [WETH[ChainId.MANTA_MAINNET]],
    [ChainId.METIS_MAINNET]: [WETH[ChainId.METIS_MAINNET]],
    [ChainId.OKX_X1_TESTNET]: [WETH[ChainId.OKX_X1_TESTNET]],
    [ChainId.MODE_MAINNET]: [WETH[ChainId.MODE_MAINNET]],
    [ChainId.RSK_MAINNET]: [WETH[ChainId.RSK_MAINNET]],
    [ChainId.MERLIN_MAINNET]: [WETH[ChainId.MERLIN_MAINNET]],
    [ChainId.SEPOLIA_TESTNET]: [WETH[ChainId.SEPOLIA_TESTNET]],
    [ChainId.TAIKO_MAINNET]: [WETH[ChainId.TAIKO_MAINNET]],
    [ChainId.SEI_EVM_MAINNET]: [WETH[ChainId.SEI_EVM_MAINNET]],
    [ChainId.CRONOS_MAINNET]: [WETH[ChainId.CRONOS_MAINNET]],
    [ChainId.FRAXTAL_MAINNET]: [WETH[ChainId.FRAXTAL_MAINNET]],
    [ChainId.BSQUARED_MAINNET]: [WETH[ChainId.BSQUARED_MAINNET]],
    [ChainId.CRONOS_ZK_MAINNET]: [WETH[ChainId.CRONOS_ZK_MAINNET]],
    [ChainId.SOLANA_MAINNET]: [WETH[ChainId.SOLANA_MAINNET]],
    [ChainId.GOAT_MAINNET]: [WETH[ChainId.GOAT_MAINNET]],
    [ChainId.SONIC_MAINNET]: [WETH[ChainId.SONIC_MAINNET]],
    [ChainId.ABSTRACT_MAINNET]: [WETH[ChainId.ABSTRACT_MAINNET]],
    [ChainId.GNOSIS_MAINNET]: [WETH[ChainId.GNOSIS_MAINNET]],
    [ChainId.BERACHAIN_MAINNET]: [WETH[ChainId.BERACHAIN_MAINNET]],
    [ChainId.UNICHAIN_MAINNET]: [WETH[ChainId.UNICHAIN_MAINNET]],
    [ChainId.SONEIUM_MAINNET]: [WETH[ChainId.SONEIUM_MAINNET]],
    [ChainId.OPBNB_MAINNET]: [WETH[ChainId.OPBNB_MAINNET]],
    [ChainId.HYPEREVM_MAINNET]: [WETH[ChainId.HYPEREVM_MAINNET]],
    [ChainId.KATANA_MAINNET]: [WETH[ChainId.KATANA_MAINNET]],
    [ChainId.APECHAIN_MAINNET]: [WETH[ChainId.APECHAIN_MAINNET]],
    [ChainId.PLASMA_MAINNET]: [WETH[ChainId.PLASMA_MAINNET]],
    [ChainId.MONAD_MAINNET]: [WETH[ChainId.MONAD_MAINNET]],
    [ChainId.CITREA_MAINNET]: [WETH[ChainId.CITREA_MAINNET]],
    [ChainId.QUAI_MAINNET]: [WETH[ChainId.QUAI_MAINNET]],
    [ChainId.TEMPO_MAINNET]: [WETH[ChainId.TEMPO_MAINNET]],
    [ChainId.ROBINHOOD_MAINNET]: [WETH[ChainId.ROBINHOOD_MAINNET]],
    [ChainId.STABLE_MAINNET]: [WETH[ChainId.STABLE_MAINNET]],
    [ChainId.ARC_MAINNET]: [WETH[ChainId.ARC_MAINNET]],
    [ChainId.X_LAYER_MAINNET]: [WETH[ChainId.X_LAYER_MAINNET]],
}

/** @deprecated Read `chainData(id).multicall` instead. */
export const MULTICALL_ADDRESSES: { [chainId in ChainId]?: EvmAddress } = Object.fromEntries(
    chainEntries(CHAIN_DATA, (data) => data.multicall || undefined)
)

/** @deprecated Read `chainData(id).uniswapV2.factory` instead. */
export const FACTORY_ADDRESS = Object.fromEntries(
    chainEntries(CHAIN_DATA, ({ uniswapV2 }) => ('factory' in uniswapV2 ? uniswapV2.factory : undefined))
) as Record<ChainId, EvmAddress>

/** @deprecated Read `chainData(id).uniswapV2.initCodeHash` instead. */
export const INIT_CODE_HASH = Object.fromEntries(
    chainEntries(CHAIN_DATA, ({ uniswapV2 }) => ('initCodeHash' in uniswapV2 ? uniswapV2.initCodeHash : undefined))
) as Record<ChainId, string>

// --- CoinGecko platform/gas-token maps ---

/** @deprecated Read `chainData(id).coinGecko?.platform` instead. */
export const COINGECKO_PLATFORMS = new Map<ChainId, string>(
    chainEntries(CHAIN_DATA, (data) => data.coinGecko?.platform)
)

/** @deprecated Read `chainData(id).coinGecko?.gasTokenId` instead. */
export const COINGECKO_GAS_TOKEN_IDS = new Map<ChainId, string>(
    chainEntries(CHAIN_DATA, (data) => data.coinGecko?.gasTokenId)
)

// --- Changelly constants + chain predicates ---

// All non-native chains supported by Changelly where SDK builds a transfer tx
const CHANGELLY_TRADE_CHAIN_IDS = new Set<ChainId>([
    // EVM
    ChainId.ETH_MAINNET,
    ChainId.BSC_MAINNET,
    ChainId.BASE_MAINNET,
    ChainId.ARBITRUM_MAINNET,
    ChainId.OPTIMISM_MAINNET,
    ChainId.MATIC_MAINNET,
    ChainId.AVAX_MAINNET,
    ChainId.LINEA_MAINNET,
    ChainId.ZKSYNC_MAINNET,
    ChainId.BERACHAIN_MAINNET,
    ChainId.SONIC_MAINNET,
    ChainId.MANTA_MAINNET,
    ChainId.TAIKO_MAINNET,
    ChainId.PLASMA_MAINNET,
    ChainId.MONAD_MAINNET,
    ChainId.ROBINHOOD_MAINNET,
    // Non EVM
    ChainId.TON_MAINNET,
    ChainId.TRON_MAINNET,
    ChainId.SOLANA_MAINNET,
])

// Changelly-exclusive native chains — no token registry exists, so metadata is defined here.
export const CHANGELLY_NATIVE_CHAINS = [
    // { chainId: ChainId.XLM_MAINNET, ticker: 'xlm', symbol: 'XLM', name: 'Stellar', decimals: 7 },
    // { chainId: ChainId.XRP_MAINNET, ticker: 'xrp', symbol: 'XRP', name: 'XRP', decimals: 6 },
    // { chainId: ChainId.ADA_MAINNET, ticker: 'ada', symbol: 'ADA', name: 'Cardano', decimals: 6 },
    // { chainId: ChainId.BCH_MAINNET, ticker: 'bch', symbol: 'BCH', name: 'Bitcoin Cash', decimals: 8 },
    // { chainId: ChainId.SUI_MAINNET, ticker: 'sui', symbol: 'SUI', name: 'Sui', decimals: 9 },
    // { chainId: ChainId.CANTON_MAINNET, ticker: 'cc', symbol: 'CC', name: 'Canton Coin', decimals: 10 },
    // { chainId: ChainId.DOGE_MAINNET, ticker: 'doge', symbol: 'DOGE', name: 'Dogecoin', decimals: 8 },
    // { chainId: ChainId.LTC_MAINNET, ticker: 'ltc', symbol: 'LTC', name: 'Litecoin', decimals: 8 },
    { chainId: ChainId.XMR_MAINNET, ticker: 'xmr', symbol: 'XMR', name: 'Monero', decimals: 12 },
    { chainId: ChainId.ZCASH_MAINNET, ticker: 'zec', symbol: 'ZEC', name: 'Zcash', decimals: 8 },
] as const

const CHANGELLY_NATIVE_CHAIN_IDS = new Set<ChainId>(CHANGELLY_NATIVE_CHAINS.map(({ chainId }) => chainId))

// Native L1 chains reachable as THORChain swap destinations.
export const THORCHAIN_L1_DEST_CHAIN_IDS: ChainId[] = [
    ChainId.BTC_MAINNET,
    ChainId.LTC_MAINNET,
    ChainId.BCH_MAINNET,
    ChainId.XRP_MAINNET,
    ChainId.DOGE_MAINNET,
]

// --- Chain detection ---

export function isChangellyNativeChainId(chainId: ChainId | undefined): boolean {
    if (chainId === undefined) return false
    return CHANGELLY_NATIVE_CHAIN_IDS.has(chainId)
}

export function isThorChainL1DestChainId(chainId: ChainId | undefined): boolean {
    if (chainId === undefined) return false
    return THORCHAIN_L1_DEST_CHAIN_IDS.includes(chainId)
}

export function isChangellyTradeChainId(chainId: ChainId): boolean {
    return CHANGELLY_TRADE_CHAIN_IDS.has(chainId)
}

export function isChangellySupportedChainId(chainId: ChainId | undefined): boolean {
    if (chainId === undefined) return false
    return CHANGELLY_NATIVE_CHAIN_IDS.has(chainId) || CHANGELLY_TRADE_CHAIN_IDS.has(chainId)
}

// Maps a Changelly `blockchain` string (from getCurrenciesFull) to our ChainId.
// Changelly's 'cronos' and 'sei' are the Cosmos chains (Cronos POS, Sei Cosmos), not
// our Cronos EVM and Sei EVM, so they are deliberately left out.
export const CHANGELLY_BLOCKCHAIN_TO_CHAIN_ID: Record<string, ChainId> = {
    // EVM
    ethereum: ChainId.ETH_MAINNET,
    binance_smart_chain: ChainId.BSC_MAINNET,
    BASE: ChainId.BASE_MAINNET,
    arbitrum: ChainId.ARBITRUM_MAINNET,
    optimism: ChainId.OPTIMISM_MAINNET,
    polygon: ChainId.MATIC_MAINNET,
    avaxc: ChainId.AVAX_MAINNET,
    LINEA: ChainId.LINEA_MAINNET,
    ZKSYNC: ChainId.ZKSYNC_MAINNET,
    bera: ChainId.BERACHAIN_MAINNET,
    sonic: ChainId.SONIC_MAINNET,
    manta: ChainId.MANTA_MAINNET,
    TAIKO: ChainId.TAIKO_MAINNET,
    plasma: ChainId.PLASMA_MAINNET,
    mon: ChainId.MONAD_MAINNET,
    robinhood: ChainId.ROBINHOOD_MAINNET,
    rootstock: ChainId.RSK_MAINNET,
    hyperevm: ChainId.HYPEREVM_MAINNET,
    stable: ChainId.STABLE_MAINNET,
    'Metis Andromeda': ChainId.METIS_MAINNET,
    MERL: ChainId.MERLIN_MAINNET,
    // Non-EVM trade chains
    tron: ChainId.TRON_MAINNET,
    solana: ChainId.SOLANA_MAINNET,
    ton: ChainId.TON_MAINNET,
    bitcoin: ChainId.BTC_MAINNET,
    // Changelly-native chains
    litecoin: ChainId.LTC_MAINNET,
    doge: ChainId.DOGE_MAINNET,
    monero: ChainId.XMR_MAINNET,
    ripple: ChainId.XRP_MAINNET,
    stellar: ChainId.XLM_MAINNET,
    cardano: ChainId.ADA_MAINNET,
    bitcoin_cash: ChainId.BCH_MAINNET,
    sui: ChainId.SUI_MAINNET,
    cc: ChainId.CANTON_MAINNET,
    zcash: ChainId.ZCASH_MAINNET,
}

// --- ChainFlip token/config data ---
// Chain/asset ids are plain strings here, not @chainflip/sdk types.
export enum ChainFlipChainId {
    Ethereum = 1,
    Polkadot = 2,
    Bitcoin = 3,
    Arbitrum = 4,
    Solana = 5,
    Tron = 7,
}

export enum ChainFlipAssetId {
    ETH = 1,
    FLIP = 2,
    USDC = 3,
    DOT = 4,
    BTC = 5,
    arbETH = 6,
    arbUSDC = 7,
    USDT = 8,
    SOL = 9,
    solUSDC = 10,
    Trx = 17,
    TrxUsdt = 18,
}

export interface ChainFlipToken {
    chainId: ChainFlipChainId
    assetId: ChainFlipAssetId
    chain: string
    asset: string
    token: Token
}

export interface ChainFlipConfig {
    src: ChainFlipToken
    dst: ChainFlipToken
}

const CF_SOL_USDC_TOKEN = new Token({
    name: 'USDC',
    symbol: 'USDC',
    address: '0x0000000000000000000000000000000000000003',
    chainId: ChainId.SOLANA_MAINNET,
    decimals: 6,
    icons: {
        large: `https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png`,
        small: `https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png`,
    },
    attributes: {
        solana: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    },
})

const CF_ARB_USDC_TOKEN = new Token({
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    chainId: ChainId.ARBITRUM_MAINNET,
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
    icons: {
        large: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png',
        small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png',
    },
})

const CF_ETH_USDC_TOKEN = new Token({
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    chainId: ChainId.ETH_MAINNET,
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
    icons: {
        large: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png',
        small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png',
    },
})

export const TRON_USDT = new Token({
    name: 'Tether USDt',
    symbol: 'USDT',
    address: '0xa614f803b6fd780986a42c78ec9c7f77e6ded13c',
    chainId: ChainId.TRON_MAINNET,
    decimals: 6,
    icons: {
        large: 'https://s3.openocean.finance/token_logos/logos/1642600369413_5107823985163122.jpg',
        small: 'https://s3.openocean.finance/token_logos/logos/1642600369413_5107823985163122.jpg',
    },
})

export const CF_BTC_BTC: ChainFlipToken = {
    chainId: ChainFlipChainId.Bitcoin,
    assetId: ChainFlipAssetId.BTC,
    chain: 'Bitcoin',
    asset: 'BTC',
    token: GAS_TOKEN[ChainId.BTC_MAINNET],
}

export const CF_ETH_ETH: ChainFlipToken = {
    chainId: ChainFlipChainId.Ethereum,
    assetId: ChainFlipAssetId.ETH,
    chain: 'Ethereum',
    asset: 'ETH',
    token: GAS_TOKEN[ChainId.ETH_MAINNET],
}

export const CF_ETH_USDC: ChainFlipToken = {
    chainId: ChainFlipChainId.Ethereum,
    assetId: ChainFlipAssetId.USDC,
    chain: 'Ethereum',
    asset: 'USDC',
    token: CF_ETH_USDC_TOKEN,
}

export const CF_ARB_ETH: ChainFlipToken = {
    chainId: ChainFlipChainId.Arbitrum,
    assetId: ChainFlipAssetId.arbETH,
    chain: 'Arbitrum',
    asset: 'ETH',
    token: GAS_TOKEN[ChainId.ARBITRUM_MAINNET],
}

export const CF_ARB_USDC: ChainFlipToken = {
    chainId: ChainFlipChainId.Arbitrum,
    assetId: ChainFlipAssetId.arbUSDC,
    chain: 'Arbitrum',
    asset: 'USDC',
    token: CF_ARB_USDC_TOKEN,
}

export const CF_SOL_SOL: ChainFlipToken = {
    chainId: ChainFlipChainId.Solana,
    assetId: ChainFlipAssetId.SOL,
    chain: 'Solana',
    asset: 'SOL',
    token: GAS_TOKEN[ChainId.SOLANA_MAINNET],
}

export const CF_SOL_USDC: ChainFlipToken = {
    chainId: ChainFlipChainId.Solana,
    assetId: ChainFlipAssetId.solUSDC,
    chain: 'Solana',
    asset: 'USDC',
    token: CF_SOL_USDC_TOKEN,
}

export const CF_TRON_USDT: ChainFlipToken = {
    chainId: ChainFlipChainId.Tron,
    assetId: ChainFlipAssetId.TrxUsdt,
    chain: 'Tron',
    asset: 'USDT',
    token: TRON_USDT,
}

export const CF_TRON_TRX: ChainFlipToken = {
    chainId: ChainFlipChainId.Tron,
    assetId: ChainFlipAssetId.Trx,
    chain: 'Tron',
    asset: 'TRX',
    token: GAS_TOKEN[ChainId.TRON_MAINNET],
}

export const CHAIN_FLIP_TOKENS: ChainFlipToken[] = [
    CF_BTC_BTC,
    CF_ETH_ETH,
    CF_ETH_USDC,
    CF_ARB_ETH,
    CF_ARB_USDC,
    CF_SOL_SOL,
    CF_SOL_USDC,
    CF_TRON_USDT,
    CF_TRON_TRX,
]

const CHAIN_FLIP_TO_BTC_CONFIGS: ChainFlipConfig[] = [
    { src: CF_ARB_USDC, dst: CF_BTC_BTC },
    { src: CF_ETH_USDC, dst: CF_BTC_BTC },
]
export const CHAIN_FLIP_TO_BTC_TOKENS_IN = CHAIN_FLIP_TO_BTC_CONFIGS.map((i) => i.src.token)

const CHAIN_FLIP_TO_SOLANA_CONFIGS: ChainFlipConfig[] = [
    { src: CF_ARB_USDC, dst: CF_SOL_SOL },
    { src: CF_ARB_USDC, dst: CF_SOL_USDC },
    { src: CF_ETH_USDC, dst: CF_SOL_SOL },
    { src: CF_ETH_USDC, dst: CF_SOL_USDC },
]
export const CHAIN_FLIP_TO_SOLANA_TOKENS_IN = CHAIN_FLIP_TO_SOLANA_CONFIGS.map((i) => i.src.token)

const CHAIN_FLIP_FROM_SOLANA_CONFIGS: ChainFlipConfig[] = [
    { src: CF_SOL_SOL, dst: CF_BTC_BTC },
    { src: CF_SOL_SOL, dst: CF_ETH_ETH },
    { src: CF_SOL_SOL, dst: CF_ETH_USDC },
    { src: CF_SOL_SOL, dst: CF_ARB_ETH },
    { src: CF_SOL_SOL, dst: CF_ARB_USDC },
    { src: CF_SOL_USDC, dst: CF_BTC_BTC },
    { src: CF_SOL_USDC, dst: CF_ETH_ETH },
    { src: CF_SOL_USDC, dst: CF_ETH_USDC },
    { src: CF_SOL_USDC, dst: CF_ARB_ETH },
    { src: CF_SOL_USDC, dst: CF_ARB_USDC },
    { src: CF_SOL_SOL, dst: CF_TRON_USDT },
    { src: CF_SOL_USDC, dst: CF_TRON_USDT },
    { src: CF_SOL_SOL, dst: CF_TRON_TRX },
    { src: CF_SOL_USDC, dst: CF_TRON_TRX },
]
export const CHAIN_FLIP_FROM_SOLANA_TOKENS_OUT = CHAIN_FLIP_FROM_SOLANA_CONFIGS.map((c) => c.dst.token)
