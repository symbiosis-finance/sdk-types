import JSBI from 'jsbi'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export type Icons = {
    large?: string
    small?: string
}

/**
 * A chain's id. It is the chain's own id where it has one, such as Ethereum's 1 or Tron's 728126428, and otherwise
 * an id that Symbiosis assigns.
 */
export enum ChainId {
    ETH_MAINNET = 1,
    ETH_RINKEBY = 4,
    ETH_KOVAN = 42,
    BSC_MAINNET = 56,
    BSC_TESTNET = 97,
    MATIC_MAINNET = 137,
    MATIC_MUMBAI = 80001,
    AVAX_MAINNET = 43114,
    AVAX_TESTNET = 43113,
    HECO_MAINNET = 128,
    HECO_TESTNET = 256,
    OKEX_MAINNET = 66,
    OKEX_TESTNET = 65,
    BOBA_MAINNET = 288,
    SYMBIOSIS_TESTNET = 719095483,
    SYMBIOSIS_MAINNET = 13863860,
    BOBA_AVALANCHE = 43288,
    BOBA_RINKEBY = 28,
    MILKOMEDA_MAINNET = 2001,
    MILKOMEDA_DEVNET = 200101,
    BTC_MAINNET = 3652501241,
    BTC_MUTINY = 2782866891,
    BTC_TESTNET4 = 675223068,
    AURORA_MAINNET = 1313161554,
    AURORA_TESTNET = 1313161555,
    TELOS_MAINNET = 40,
    TELOS_TESTNET = 41,
    SHARDEUM_TESTNET_2 = 8081,
    SCROLL_SEPOLIA = 534351,
    SEPOLIA_TESTNET = 11155111,
    ZKSYNC_MAINNET = 324,
    ARBITRUM_MAINNET = 42161,
    OPTIMISM_MAINNET = 10,
    TRON_MAINNET = 728126428,
    TRON_TESTNET = 2494104990,
    LINEA_TESTNET = 59140,
    LINEA_MAINNET = 59144,
    MANTLE_MAINNET = 5000,
    MANTLE_TESTNET = 5001,
    BASE_MAINNET = 8453,
    SCROLL_MAINNET = 534352,
    MANTA_MAINNET = 169,
    METIS_MAINNET = 1088,
    OKX_X1_TESTNET = 195,
    MODE_MAINNET = 34443,
    RSK_MAINNET = 30,
    MERLIN_MAINNET = 4200,
    TON_MAINNET = 85918, // correct is 85918
    TON_TESTNET = 85919, // correct is 85918
    TAIKO_MAINNET = 167000,
    SEI_EVM_MAINNET = 1329,
    CRONOS_MAINNET = 25,
    FRAXTAL_MAINNET = 252,
    BSQUARED_MAINNET = 223,
    CRONOS_ZK_MAINNET = 388,
    SOLANA_MAINNET = 5426,
    GOAT_MAINNET = 2345,
    SONIC_MAINNET = 146,
    ABSTRACT_MAINNET = 2741,
    GNOSIS_MAINNET = 100,
    BERACHAIN_MAINNET = 80094,
    UNICHAIN_MAINNET = 130,
    SONEIUM_MAINNET = 1868,
    OPBNB_MAINNET = 204,
    HYPEREVM_MAINNET = 999,
    KATANA_MAINNET = 747474,
    APECHAIN_MAINNET = 33139,
    PLASMA_MAINNET = 9745,
    MONAD_MAINNET = 143,
    CITREA_MAINNET = 4114,
    QUAI_MAINNET = 9,
    XLM_MAINNET = 14800148, // Stellar (SLIP-44: 148)
    XRP_MAINNET = 14400144, // XRP Ledger (SLIP-44: 144)
    XMR_MAINNET = 12800128, // Monero (SLIP-44: 128)
    ADA_MAINNET = 18150018, // Cardano (SLIP-44: 1815)
    BCH_MAINNET = 14500145, // Bitcoin Cash (SLIP-44: 145)
    SUI_MAINNET = 78400784, // SUI (SLIP-44: 784)
    CANTON_MAINNET = 67000670, // Canton (CC)
    DOGE_MAINNET = 300003, // Dogecoin (SLIP-44: 3)
    LTC_MAINNET = 200002, // Litecoin (SLIP-44: 2)
    ZCASH_MAINNET = 13300133, // Zcash (SLIP-44: 133)
    TEMPO_MAINNET = 4217,
    // Symbiosis-internal pseudo-chains for perp deposit destinations (NOT real EVM chains).
    // Used only as tokenOut.chainId to route a deposit into the perp venue via perpbot.
    HYPERLIQUID_PERP_MAINNET = 99990001,
    LIGHTER_MAINNET = 99990002,
    ROBINHOOD_MAINNET = 4663,
    STABLE_MAINNET = 988,
    ARC_MAINNET = 5042,
    X_LAYER_MAINNET = 196,
}

export enum TradeType {
    EXACT_INPUT,
    EXACT_OUTPUT,
}

export enum Rounding {
    ROUND_DOWN,
    ROUND_HALF_UP,
    ROUND_UP,
}
export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _100 = JSBI.BigInt(100)
export const _997 = JSBI.BigInt(997)
export const _1000 = JSBI.BigInt(1000)

export enum SolidityType {
    uint8 = 'uint8',
    uint256 = 'uint256',
}

export const SOLIDITY_TYPE_MAXIMA = {
    [SolidityType.uint8]: JSBI.BigInt('0xff'),
    [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
}

export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const
