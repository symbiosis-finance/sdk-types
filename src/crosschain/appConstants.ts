// Pure data constants extracted from js-sdk 3.11.60 (zero web3).
// Sources: crosschain/constants.ts (WETH_ONLY, MULTICALL_ADDRESSES), coingecko/constants.ts,
// tronAbis/tronTRC20Abi.ts, swapExactIn/changellySwap/constants.ts, swapExactIn/chainFlipSwap/*.
import { ChainId, isBtcChainId, isQuaiChainId, isSolanaChainId, isTonChainId, isTronChainId } from '../constants'
import type { EvmAddress } from './types'
import type { TokenConstructor } from '../entities'
import { GAS_TOKEN, Token, WETH } from '../entities'

// AddressZero inlined to keep the package web3-free (was @ethersproject/constants in js-sdk).
const AddressZero = '0x0000000000000000000000000000000000000000' as EvmAddress

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
    [ChainId.KAVA_MAINNET]: [WETH[ChainId.KAVA_MAINNET]],
    [ChainId.SCROLL_SEPOLIA]: [WETH[ChainId.SCROLL_SEPOLIA]],
    [ChainId.ZKSYNC_MAINNET]: [WETH[ChainId.ZKSYNC_MAINNET]],
    [ChainId.ARBITRUM_MAINNET]: [WETH[ChainId.ARBITRUM_MAINNET]],
    [ChainId.ARBITRUM_NOVA]: [WETH[ChainId.ARBITRUM_NOVA]],
    [ChainId.OPTIMISM_MAINNET]: [WETH[ChainId.OPTIMISM_MAINNET]],
    [ChainId.ZETACHAIN_ATHENS_2]: [WETH[ChainId.ZETACHAIN_ATHENS_2]],
    [ChainId.POLYGON_ZK]: [WETH[ChainId.POLYGON_ZK]],
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
    [ChainId.BAHAMUT_MAINNET]: [WETH[ChainId.BAHAMUT_MAINNET]],
    [ChainId.MODE_MAINNET]: [WETH[ChainId.MODE_MAINNET]],
    [ChainId.RSK_MAINNET]: [WETH[ChainId.RSK_MAINNET]],
    [ChainId.BLAST_MAINNET]: [WETH[ChainId.BLAST_MAINNET]],
    [ChainId.MERLIN_MAINNET]: [WETH[ChainId.MERLIN_MAINNET]],
    [ChainId.ZKLINK_MAINNET]: [WETH[ChainId.ZKLINK_MAINNET]],
    [ChainId.CORE_MAINNET]: [WETH[ChainId.CORE_MAINNET]],
    [ChainId.SEPOLIA_TESTNET]: [WETH[ChainId.SEPOLIA_TESTNET]],
    [ChainId.TAIKO_MAINNET]: [WETH[ChainId.TAIKO_MAINNET]],
    [ChainId.SEI_EVM_MAINNET]: [WETH[ChainId.SEI_EVM_MAINNET]],
    [ChainId.ZETACHAIN_MAINNET]: [WETH[ChainId.ZETACHAIN_MAINNET]],
    [ChainId.CRONOS_MAINNET]: [WETH[ChainId.CRONOS_MAINNET]],
    [ChainId.FRAXTAL_MAINNET]: [WETH[ChainId.FRAXTAL_MAINNET]],
    [ChainId.GRAVITY_MAINNET]: [WETH[ChainId.GRAVITY_MAINNET]],
    [ChainId.BSQUARED_MAINNET]: [WETH[ChainId.BSQUARED_MAINNET]],
    [ChainId.CRONOS_ZK_MAINNET]: [WETH[ChainId.CRONOS_ZK_MAINNET]],
    [ChainId.MORPH_MAINNET]: [WETH[ChainId.MORPH_MAINNET]],
    [ChainId.SOLANA_MAINNET]: [WETH[ChainId.SOLANA_MAINNET]],
    [ChainId.GOAT_MAINNET]: [WETH[ChainId.GOAT_MAINNET]],
    [ChainId.SONIC_MAINNET]: [WETH[ChainId.SONIC_MAINNET]],
    [ChainId.ABSTRACT_MAINNET]: [WETH[ChainId.ABSTRACT_MAINNET]],
    [ChainId.GNOSIS_MAINNET]: [WETH[ChainId.GNOSIS_MAINNET]],
    [ChainId.BERACHAIN_MAINNET]: [WETH[ChainId.BERACHAIN_MAINNET]],
    [ChainId.UNICHAIN_MAINNET]: [WETH[ChainId.UNICHAIN_MAINNET]],
    [ChainId.SONEIUM_MAINNET]: [WETH[ChainId.SONEIUM_MAINNET]],
    [ChainId.OPBNB_MAINNET]: [WETH[ChainId.OPBNB_MAINNET]],
    [ChainId.HYPERLIQUID_MAINNET]: [WETH[ChainId.HYPERLIQUID_MAINNET]],
    [ChainId.KATANA_MAINNET]: [WETH[ChainId.KATANA_MAINNET]],
    [ChainId.APECHAIN_MAINNET]: [WETH[ChainId.APECHAIN_MAINNET]],
    [ChainId.PLASMA_MAINNET]: [WETH[ChainId.PLASMA_MAINNET]],
    [ChainId.MONAD_MAINNET]: [WETH[ChainId.MONAD_MAINNET]],
    [ChainId.CITREA_MAINNET]: [WETH[ChainId.CITREA_MAINNET]],
    [ChainId.QUAI_MAINNET]: [WETH[ChainId.QUAI_MAINNET]],
    [ChainId.TEMPO_MAINNET]: [WETH[ChainId.TEMPO_MAINNET]],
}

export const MULTICALL_ADDRESSES: { [chainId in ChainId]?: EvmAddress } = {
    [ChainId.ETH_MAINNET]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    [ChainId.ETH_RINKEBY]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    [ChainId.ETH_KOVAN]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    [ChainId.BSC_MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    [ChainId.BSC_TESTNET]: '0xbC4F726A6dB460DcFE49E6a56886470B94Dfc302',
    [ChainId.MATIC_MAINNET]: '0x275617327c958bD06b5D6b871E7f491D76113dd8',
    [ChainId.MATIC_MUMBAI]: '0xe9939e7Ea7D7fb619Ac57f648Da7B1D425832631',
    [ChainId.AVAX_MAINNET]: '0x29b6603d17b9d8f021ecb8845b6fd06e1adf89de',
    [ChainId.AVAX_TESTNET]: '0x9A9b5Ef5CeAbaC69d3B4A71c4da782554A35B638',
    [ChainId.HECO_MAINNET]: AddressZero,
    [ChainId.HECO_TESTNET]: '0x9a9b5ef5ceabac69d3b4a71c4da782554a35b638',
    [ChainId.OKEX_MAINNET]: AddressZero,
    [ChainId.OKEX_TESTNET]: '0x9A9b5Ef5CeAbaC69d3B4A71c4da782554A35B638',
    [ChainId.BOBA_MAINNET]: '0xaeD5b25BE1c3163c907a471082640450F928DDFE',
    [ChainId.BOBA_AVALANCHE]: '0x92C5b5B66988E6B8931a8CD3faa418b42003DF2F',
    [ChainId.SYMBIOSIS_TESTNET]: '0x7F373f8033D64Abd491ceBeAc2dE070050F97229',
    [ChainId.SYMBIOSIS_MAINNET]: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
    [ChainId.BOBA_RINKEBY]: '0x773ccf8ba321c9f96a100b4b0fa1ecf7046645f5',
    [ChainId.MILKOMEDA_MAINNET]: '0xa46157Cda2D019Ba4cDcd8cE12A04760c15C355b',
    [ChainId.MILKOMEDA_DEVNET]: '0x41b5984f45AfB2560a0ED72bB69A98E8b32B3cCA',
    [ChainId.AURORA_MAINNET]: '0xbf69a56d35b8d6f5a8e0e96b245a72f735751e54',
    [ChainId.AURORA_TESTNET]: '0x4a5143B13C84DB00E6d8c19b9EA00f3b91416d20',
    [ChainId.TELOS_MAINNET]: '0x53dC7535028e2fcaCa0d847AD108b9240C0801b1',
    [ChainId.TELOS_TESTNET]: '0x9a01bf917477dd9f5d715d188618fc8b7350cd22',
    [ChainId.SHARDEUM_TESTNET_2]: '0x41b5984f45AfB2560a0ED72bB69A98E8b32B3cCA',
    [ChainId.KAVA_MAINNET]: '0x30A62aA52Fa099C4B227869EB6aeaDEda054d121',
    [ChainId.SCROLL_SEPOLIA]: '0xF3Cfa393be621097669BcD2bD4923CEC347E1210',
    [ChainId.ZKSYNC_MAINNET]: '0x52192C3De01535a9Ad2743A5Fe4f774868103C20',
    [ChainId.ARBITRUM_MAINNET]: '0x80c7dd17b01855a6d2347444a0fcc36136a314de',
    [ChainId.ARBITRUM_NOVA]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.OPTIMISM_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.ZETACHAIN_ATHENS_2]: '0x9a01bf917477dD9F5D715D188618fc8B7350cd22',
    [ChainId.POLYGON_ZK]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.TRON_TESTNET]: '0x00e08cb2cd7480ddf6c54430207dff81ce359887',
    [ChainId.TRON_MAINNET]: '0x32A4F47A74A6810BD0BF861CABAB99656A75DE9E',
    [ChainId.LINEA_TESTNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.LINEA_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.MANTLE_MAINNET]: '0xb55cc6B5B402437b66c13c0CEd0EF367aa7c26da',
    [ChainId.MANTLE_TESTNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.BASE_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.SCROLL_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.MANTA_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.METIS_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.OKX_X1_TESTNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.BAHAMUT_MAINNET]: '0xa385B1436fD2A6a1c6865E22c522A1aA40CaDCC6',
    [ChainId.MODE_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.RSK_MAINNET]: '0xca11bde05977b3631167028862be2a173976ca11',
    [ChainId.BLAST_MAINNET]: '0xca11bde05977b3631167028862be2a173976ca11',
    [ChainId.MERLIN_MAINNET]: '0x45CFd6FB7999328F189aaD2739Fba4Be6C45E5bf',
    [ChainId.ZKLINK_MAINNET]: '0x7E06D0CD8D3fDDBB875345dF389d986f810A49F6',
    [ChainId.SEPOLIA_TESTNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.CORE_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.TAIKO_MAINNET]: '0x076f5925112b13a4D4c70fc83d9019f1854e4415',
    [ChainId.SEI_EVM_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.ZETACHAIN_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.CRONOS_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.FRAXTAL_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.GRAVITY_MAINNET]: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
    [ChainId.BSQUARED_MAINNET]: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
    [ChainId.CRONOS_ZK_MAINNET]: '0x4c398CB4b7D4d31a54D254d8Aed09B9e8353E80E',
    [ChainId.MORPH_MAINNET]: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
    [ChainId.SOLANA_MAINNET]: AddressZero,
    [ChainId.GOAT_MAINNET]: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
    [ChainId.SONIC_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.ABSTRACT_MAINNET]: '0xBf63C7944B1635c79a0f0eE7e07b1702837AD1F9',
    [ChainId.GNOSIS_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.BERACHAIN_MAINNET]: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
    [ChainId.UNICHAIN_MAINNET]: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
    [ChainId.SONEIUM_MAINNET]: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
    [ChainId.OPBNB_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.HYPERLIQUID_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.KATANA_MAINNET]: '0x6AEb9b27590387b8Fd0560C52f6B968C59C10Fab',
    [ChainId.APECHAIN_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.PLASMA_MAINNET]: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
    [ChainId.MONAD_MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
    [ChainId.CITREA_MAINNET]: '0xA738e84fdE890Bc60b99AF7ccE43990E534304de',
    [ChainId.QUAI_MAINNET]: '0x007898652F1670d7211dB3Be09a9A77798103343',
    [ChainId.TEMPO_MAINNET]: '0x6AEb9b27590387b8Fd0560C52f6B968C59C10Fab',
}

// --- CoinGecko platform/gas-token maps (coingecko/constants.ts) ---

export const COINGECKO_PLATFORMS = new Map([
    [ChainId.BASE_MAINNET, 'base'],
    [ChainId.ETH_MAINNET, 'ethereum'],
    [ChainId.BSC_MAINNET, 'binance-smart-chain'],
    [ChainId.AVAX_MAINNET, 'avalanche'],
    [ChainId.MATIC_MAINNET, 'polygon-pos'],
    [ChainId.TELOS_MAINNET, 'telos'],
    [ChainId.BOBA_MAINNET, 'boba'],
    [ChainId.KAVA_MAINNET, 'kava'],
    [ChainId.ZKSYNC_MAINNET, 'zksync'],
    [ChainId.ARBITRUM_MAINNET, 'arbitrum-one'],
    [ChainId.OPTIMISM_MAINNET, 'optimistic-ethereum'],
    [ChainId.ARBITRUM_NOVA, 'arbitrum-nova'],
    [ChainId.POLYGON_ZK, 'polygon-zkevm'],
    [ChainId.LINEA_MAINNET, 'linea'],
    [ChainId.MANTLE_MAINNET, 'mantle'],
    [ChainId.SCROLL_MAINNET, 'scroll'],
    [ChainId.MANTA_MAINNET, 'manta-pacific'],
    [ChainId.METIS_MAINNET, 'metis-andromeda'],
    [ChainId.MODE_MAINNET, 'mode'],
    [ChainId.RSK_MAINNET, 'rootstock'],
    [ChainId.BLAST_MAINNET, 'blast'],
    [ChainId.MERLIN_MAINNET, 'merlin-chain'],
    [ChainId.ZKLINK_MAINNET, 'zklink-nova'],
    [ChainId.TON_MAINNET, 'the-open-network'],
    [ChainId.BTC_MAINNET, 'bitcoin'],
    [ChainId.TRON_MAINNET, 'tron'],
    [ChainId.TAIKO_MAINNET, 'taiko'],
    [ChainId.ZETACHAIN_MAINNET, 'zetachain'],
    [ChainId.CRONOS_MAINNET, 'cronos'],
    [ChainId.FRAXTAL_MAINNET, 'fraxtal'],
    [ChainId.GRAVITY_MAINNET, 'gravity-alpha'],
    [ChainId.BSQUARED_MAINNET, 'bsquared-network'],
    [ChainId.CRONOS_ZK_MAINNET, 'cronos-zkevm'],
    [ChainId.MORPH_MAINNET, 'morph-l2'],
    [ChainId.SOLANA_MAINNET, 'solana'],
    [ChainId.GNOSIS_MAINNET, 'xdai'],
    [ChainId.SONIC_MAINNET, 'sonic'],
    [ChainId.CORE_MAINNET, 'core'],
    [ChainId.ABSTRACT_MAINNET, 'abstract'],
    [ChainId.BAHAMUT_MAINNET, 'bahamut'],
    [ChainId.BERACHAIN_MAINNET, 'berachain'],
    [ChainId.UNICHAIN_MAINNET, 'unichain'],
    [ChainId.SONEIUM_MAINNET, 'soneium'],
    [ChainId.OPBNB_MAINNET, 'opbnb'],
    [ChainId.HYPERLIQUID_MAINNET, 'hyperevm'],
    [ChainId.KATANA_MAINNET, 'katana'],
    [ChainId.APECHAIN_MAINNET, 'apechain'],
    [ChainId.PLASMA_MAINNET, 'plasma'],
    [ChainId.MONAD_MAINNET, 'monad'],
    [ChainId.CITREA_MAINNET, 'ethereum'], // TODO change to a correct platform
    [ChainId.QUAI_MAINNET, 'quai-network'],
    [ChainId.XMR_MAINNET, 'monero'],
    [ChainId.XLM_MAINNET, 'stellar'],
    [ChainId.XRP_MAINNET, 'ripple'],
    [ChainId.ADA_MAINNET, 'cardano'],
    [ChainId.BCH_MAINNET, 'bitcoin-cash'],
    [ChainId.SUI_MAINNET, 'sui'],
    [ChainId.DOGE_MAINNET, 'dogecoin'],
    [ChainId.LTC_MAINNET, 'litecoin'],
    [ChainId.CANTON_MAINNET, 'canton-network'],
    [ChainId.ZCASH_MAINNET, 'zcash'],
    [ChainId.TEMPO_MAINNET, 'tempo'],
])

export const COINGECKO_GAS_TOKEN_IDS = new Map([
    [ChainId.BASE_MAINNET, 'ethereum'],
    [ChainId.ETH_MAINNET, 'ethereum'],
    [ChainId.BSC_MAINNET, 'binancecoin'],
    [ChainId.AVAX_MAINNET, 'avalanche-2'],
    [ChainId.MATIC_MAINNET, 'matic-network'],
    [ChainId.TELOS_MAINNET, 'telos'],
    [ChainId.BOBA_MAINNET, 'ethereum'],
    [ChainId.KAVA_MAINNET, 'kava'],
    [ChainId.ZKSYNC_MAINNET, 'ethereum'],
    [ChainId.ARBITRUM_MAINNET, 'ethereum'],
    [ChainId.OPTIMISM_MAINNET, 'ethereum'],
    [ChainId.ARBITRUM_NOVA, 'ethereum'],
    [ChainId.POLYGON_ZK, 'ethereum'],
    [ChainId.LINEA_MAINNET, 'ethereum'],
    [ChainId.MANTLE_MAINNET, 'mantle'],
    [ChainId.SCROLL_MAINNET, 'ethereum'],
    [ChainId.MANTA_MAINNET, 'ethereum'],
    [ChainId.METIS_MAINNET, 'metis-token'],
    [ChainId.MODE_MAINNET, 'ethereum'],
    [ChainId.RSK_MAINNET, 'rootstock'],
    [ChainId.BLAST_MAINNET, 'ethereum'],
    [ChainId.MERLIN_MAINNET, 'bitcoin'],
    [ChainId.ZKLINK_MAINNET, 'ethereum'],
    [ChainId.TON_MAINNET, 'the-open-network'],
    [ChainId.BTC_MAINNET, 'bitcoin'],
    [ChainId.TRON_MAINNET, 'tron'],
    [ChainId.TAIKO_MAINNET, 'ethereum'],
    [ChainId.SEI_EVM_MAINNET, 'sei-network'],
    [ChainId.ZETACHAIN_MAINNET, 'zetachain'],
    [ChainId.CRONOS_MAINNET, 'crypto-com-chain'],
    [ChainId.FRAXTAL_MAINNET, 'frax-share'],
    [ChainId.GRAVITY_MAINNET, 'g-token'],
    [ChainId.BSQUARED_MAINNET, 'bitcoin'],
    [ChainId.CRONOS_ZK_MAINNET, 'cronos-zkevm-cro'],
    [ChainId.MORPH_MAINNET, 'weth'],
    [ChainId.SOLANA_MAINNET, 'solana'],
    [ChainId.GNOSIS_MAINNET, 'xdai'],
    [ChainId.SONIC_MAINNET, 'sonic-3'],
    [ChainId.CORE_MAINNET, 'coredaoorg'],
    [ChainId.ABSTRACT_MAINNET, 'ethereum'],
    [ChainId.BAHAMUT_MAINNET, 'fasttoken'],
    [ChainId.BERACHAIN_MAINNET, 'berachain-bera'],
    [ChainId.UNICHAIN_MAINNET, 'ethereum'],
    [ChainId.SONEIUM_MAINNET, 'ethereum'],
    [ChainId.OPBNB_MAINNET, 'binancecoin'],
    [ChainId.HYPERLIQUID_MAINNET, 'hyperliquid'],
    [ChainId.KATANA_MAINNET, 'ethereum'],
    [ChainId.APECHAIN_MAINNET, 'apecoin'],
    [ChainId.PLASMA_MAINNET, 'plasma'],
    [ChainId.MONAD_MAINNET, 'monad'],
    [ChainId.CITREA_MAINNET, 'bitcoin'], // TODO update if needed
    [ChainId.QUAI_MAINNET, 'quai-network'],
    [ChainId.XMR_MAINNET, 'monero'],
    [ChainId.XLM_MAINNET, 'stellar'],
    [ChainId.XRP_MAINNET, 'ripple'],
    [ChainId.ADA_MAINNET, 'cardano'],
    [ChainId.BCH_MAINNET, 'bitcoin-cash'],
    [ChainId.SUI_MAINNET, 'sui'],
    [ChainId.DOGE_MAINNET, 'dogecoin'],
    [ChainId.LTC_MAINNET, 'litecoin'],
    [ChainId.CANTON_MAINNET, 'canton-network'],
    [ChainId.ZCASH_MAINNET, 'zcash'],
    [ChainId.TEMPO_MAINNET, ''], // NOTE: no gas token on tempo
])

// --- TRON TRC20 ABI (tronAbis/tronTRC20Abi.ts) ---
export const TRON_TRC20_ABI = [
    {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            { indexed: true, name: 'owner', type: 'address' },
            { indexed: true, name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        outputs: [{ type: 'uint256' }],
        constant: true,
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
        ],
        name: 'allowance',
        stateMutability: 'view',
        type: 'function',
    },
    {
        outputs: [{ type: 'bool' }],
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
        ],
        name: 'approve',
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        outputs: [{ type: 'uint256' }],
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        stateMutability: 'view',
        type: 'function',
    },
    {
        outputs: [{ type: 'uint8' }],
        inputs: [],
        constant: true,
        name: 'decimals',
        stateMutability: 'view',
        type: 'function',
    },
    {
        outputs: [{ type: 'bool' }],
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'subtractedValue', type: 'uint256' },
        ],
        name: 'decreaseAllowance',
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        outputs: [{ type: 'bool' }],
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'addedValue', type: 'uint256' },
        ],
        name: 'increaseAllowance',
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        outputs: [{ type: 'string' }],
        constant: true,
        name: 'name',
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        outputs: [{ type: 'string' }],
        constant: true,
        name: 'symbol',
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        outputs: [{ type: 'uint256' }],
        constant: true,
        name: 'totalSupply',
        stateMutability: 'view',
        type: 'function',
    },
    {
        outputs: [{ type: 'bool' }],
        inputs: [
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        name: 'transfer',
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        outputs: [{ type: 'bool' }],
        inputs: [
            { name: 'sender', type: 'address' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        name: 'transferFrom',
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const

// --- Changelly constants + chain predicates (swapExactIn/changellySwap/constants.ts) ---

export function buildChangellyKeyRaw(chainId: ChainId, address: string, isNative: boolean): string {
    if (isNative) return `${chainId}:native`
    const normalized = address.startsWith('0x') ? address.toLowerCase() : address
    return `${chainId}:${normalized}`
}

// --- Transaction building ---

export const TRON_TRANSFER_FEE_LIMIT = 50_000_000 // 50 TRX — covers ~131k energy for TRC-20 transfer (e.g. USDT)
export const DEPOSIT_VALIDITY_MS = 10 * 60 * 1000 // 10 minutes
export const TON_TX_VALIDITY_SECONDS = 600 // 10 minutes — how long TON wallet keeps unsigned tx valid

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
    ChainId.BLAST_MAINNET,
    ChainId.CRONOS_MAINNET,
    ChainId.ZETACHAIN_MAINNET,
    ChainId.CORE_MAINNET,
    ChainId.TAIKO_MAINNET,
    ChainId.SEI_EVM_MAINNET,
    ChainId.KAVA_MAINNET,
    ChainId.PLASMA_MAINNET,
    ChainId.MONAD_MAINNET,
    // Non EVM
    ChainId.TON_MAINNET,
    ChainId.TRON_MAINNET,
    ChainId.SOLANA_MAINNET,
])

// --- Changelly ticker maps (used by resolveChangellyTicker for fast-path lookup) ---

// Single source of truth for Changelly-exclusive native chains.
// No token registry exists for these — all metadata is defined here.
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

// Transit ERC-20 per chain for zapping (DEX swap → Changelly deposit).
// Most liquid stable, or chain-native ERC-20 for L2s. Address format matches buildChangellyKey.
const CHANGELLY_TRANSIT_TOKENS: (TokenConstructor & { ticker: string })[] = [
    {
        chainId: ChainId.ETH_MAINNET,
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        ticker: 'usdc',
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
    },
    {
        chainId: ChainId.BSC_MAINNET,
        address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        ticker: 'usdcbsc',
        decimals: 18,
        symbol: 'USDC',
        name: 'USD Coin',
    },
    {
        chainId: ChainId.TRON_MAINNET,
        address: '0xa614f803b6fd780986a42c78ec9c7f77e6ded13c', // TR7NHq... in hex
        ticker: 'usdtrx',
        decimals: 6,
        symbol: 'USDT',
        name: 'Tether USD',
    },
    {
        chainId: ChainId.BASE_MAINNET,
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        ticker: 'usdcbase',
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
    },
    {
        chainId: ChainId.ARBITRUM_MAINNET,
        address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        ticker: 'usdcarb',
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
    },
    {
        chainId: ChainId.OPTIMISM_MAINNET,
        address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
        ticker: 'usdcop',
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
    },
    {
        chainId: ChainId.MATIC_MAINNET,
        address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        ticker: 'usdcmatic',
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
    },
    {
        chainId: ChainId.AVAX_MAINNET,
        address: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
        ticker: 'usdcavac',
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
    },
    {
        chainId: ChainId.SONIC_MAINNET,
        address: '0x29219dd400f2bf60e5a23d13be72b486d4038894',
        ticker: 'usdcsonic',
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
    },
    {
        chainId: ChainId.TON_MAINNET,
        address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        ticker: 'usdton',
        decimals: 6,
        symbol: 'USDT',
        name: 'Tether USD',
    },
    // L2 chains — Changelly lists chain-native ERC-20 tokens, not gas ETH
    {
        chainId: ChainId.LINEA_MAINNET,
        address: '0x1789e0043623282d5dcc7f213d703c6d8bafbb04',
        ticker: 'linea',
        decimals: 18,
        symbol: 'LINEA',
        name: 'Linea',
    },
    {
        chainId: ChainId.ZKSYNC_MAINNET,
        address: '0x5a7d6b2f92c77fad6ccabd7ee0624e64907eaf3e',
        ticker: 'zksync',
        decimals: 18,
        symbol: 'ZK',
        name: 'ZKsync',
    },
    {
        chainId: ChainId.MANTA_MAINNET,
        address: '0x95cef13441be50d20ca4558cc0a27b601ac544e5',
        ticker: 'manta',
        decimals: 18,
        symbol: 'MANTA',
        name: 'Manta',
    },
    {
        chainId: ChainId.BLAST_MAINNET,
        address: '0xb1a5700fa2358173fe465e6ea4ff52e36e88e2ad',
        ticker: 'blast',
        decimals: 18,
        symbol: 'BLAST',
        name: 'Blast',
    },
    {
        chainId: ChainId.TAIKO_MAINNET,
        address: '0xa9d23408b9ba935c230493c40c73824df71a0975',
        ticker: 'taiko',
        decimals: 18,
        symbol: 'TAIKO',
        name: 'Taiko',
    },
]

// Fast-path ticker resolution — avoids API call for common tokens.
export const CHANGELLY_FAST_TICKER_MAP = new Map<string, string>([
    // Changelly-native chains (gas tokens)
    ...CHANGELLY_NATIVE_CHAINS.map(({ chainId, ticker }) => [buildChangellyKeyRaw(chainId, '', true), ticker] as const),
    // Trade chain gas tokens
    [buildChangellyKeyRaw(ChainId.ETH_MAINNET, '', true), 'eth'],
    [buildChangellyKeyRaw(ChainId.BSC_MAINNET, '', true), 'bnbbsc'],
    [buildChangellyKeyRaw(ChainId.BASE_MAINNET, '', true), 'ethbase'],
    [buildChangellyKeyRaw(ChainId.ARBITRUM_MAINNET, '', true), 'etharb'],
    [buildChangellyKeyRaw(ChainId.OPTIMISM_MAINNET, '', true), 'ethop'],
    [buildChangellyKeyRaw(ChainId.MATIC_MAINNET, '', true), 'pol'],
    [buildChangellyKeyRaw(ChainId.AVAX_MAINNET, '', true), 'avaxc'],
    [buildChangellyKeyRaw(ChainId.SONIC_MAINNET, '', true), 's'],
    [buildChangellyKeyRaw(ChainId.BERACHAIN_MAINNET, '', true), 'bera'],
    [buildChangellyKeyRaw(ChainId.CRONOS_MAINNET, '', true), 'cro'],
    [buildChangellyKeyRaw(ChainId.ZETACHAIN_MAINNET, '', true), 'zeta'],
    [buildChangellyKeyRaw(ChainId.CORE_MAINNET, '', true), 'core'],
    [buildChangellyKeyRaw(ChainId.KAVA_MAINNET, '', true), 'kava'],
    [buildChangellyKeyRaw(ChainId.PLASMA_MAINNET, '', true), 'xpl'],
    [buildChangellyKeyRaw(ChainId.MONAD_MAINNET, '', true), 'mon'],
    [buildChangellyKeyRaw(ChainId.SEI_EVM_MAINNET, '', true), 'sei'],
    [buildChangellyKeyRaw(ChainId.TRON_MAINNET, '', true), 'trx'],
    [buildChangellyKeyRaw(ChainId.TON_MAINNET, '', true), 'ton'],
    [buildChangellyKeyRaw(ChainId.SOLANA_MAINNET, '', true), 'sol'],
    // Transit tokens (ERC-20 / jettons)
    ...CHANGELLY_TRANSIT_TOKENS.map(
        (token) => [buildChangellyKeyRaw(token.chainId, token.address, false), token.ticker] as [string, string]
    ),
])

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
    blast: ChainId.BLAST_MAINNET,
    cronos: ChainId.CRONOS_MAINNET,
    zetachain: ChainId.ZETACHAIN_MAINNET,
    CORE: ChainId.CORE_MAINNET,
    TAIKO: ChainId.TAIKO_MAINNET,
    sei: ChainId.SEI_EVM_MAINNET,
    kava: ChainId.KAVA_MAINNET,
    plasma: ChainId.PLASMA_MAINNET,
    mon: ChainId.MONAD_MAINNET,
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

// --- Chain detection ---

export function isChangellyNativeChainId(chainId: ChainId | undefined): boolean {
    if (chainId === undefined) return false
    return CHANGELLY_NATIVE_CHAIN_IDS.has(chainId)
}

// Lives here (not in constants.ts) to avoid a module-init cycle, since it depends on
// isChangellyNativeChainId. Faithful to js-sdk 3.11.60 chainUtils/evm.ts isEvmChainId.
export function isEvmChainId(chainId: ChainId | undefined): boolean {
    if (!chainId) return false
    return (
        !isBtcChainId(chainId) &&
        !isTronChainId(chainId) &&
        !isTonChainId(chainId) &&
        !isSolanaChainId(chainId) &&
        !isQuaiChainId(chainId) &&
        !isChangellyNativeChainId(chainId)
    )
}

export function isChangellyTradeChainId(chainId: ChainId): boolean {
    return CHANGELLY_TRADE_CHAIN_IDS.has(chainId)
}

export function isChangellySupportedChainId(chainId: ChainId | undefined): boolean {
    if (chainId === undefined) return false
    return CHANGELLY_NATIVE_CHAIN_IDS.has(chainId) || CHANGELLY_TRADE_CHAIN_IDS.has(chainId)
}

// --- Transit tokens for on-chain zapping: DEX swap -> Changelly deposit ---

export type ChangellyTransitToken = { token: Token; ticker: string }

export function getChangellyTransitToken(chainId: ChainId): ChangellyTransitToken | undefined {
    const transitToken = CHANGELLY_TRANSIT_TOKENS.find((t) => t.chainId === chainId)
    if (!transitToken) return undefined

    return {
        token: new Token(transitToken),
        ticker: transitToken.ticker,
    }
}

// --- ChainFlip token/config data (swapExactIn/chainFlipSwap/*) ---
// The chain/asset string-literal types come from @chainflip/sdk in js-sdk;
// here they are plain strings to keep the package web3-free.
export enum ChainFlipChainId {
    Ethereum = 1,
    Polkadot = 2,
    Bitcoin = 3,
    Arbitrum = 4,
    Solana = 5,
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
        large: `https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png`,
        small: `https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png`,
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
        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    },
})

const CF_ETH_USDC_TOKEN = new Token({
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    chainId: ChainId.ETH_MAINNET,
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
    icons: {
        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
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

export const CHAIN_FLIP_TOKENS: ChainFlipToken[] = [
    CF_BTC_BTC,
    CF_ETH_ETH,
    CF_ETH_USDC,
    CF_ARB_ETH,
    CF_ARB_USDC,
    CF_SOL_SOL,
    CF_SOL_USDC,
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
]
export const CHAIN_FLIP_FROM_SOLANA_TOKENS_OUT = CHAIN_FLIP_FROM_SOLANA_CONFIGS.map((c) => c.dst.token)
