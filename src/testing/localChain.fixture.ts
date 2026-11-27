import type { ChainId } from '../constants'
import { type ChainData, chainDataSchema, type EvmChainDataInput } from '../crosschain/types'

// No global table of sdk-types knows this chain, so a test that passes on it reads nothing global.
export const LOCAL = 31337 as ChainId

// The addresses of the first four contracts Hardhat's default account deploys; each test names their roles.
export const hardhatAddresses = [
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
] as const

// The local Hardhat chain's parsed data, with ETH as its gas token, WETH at `wethAddress` and no Uniswap V2 pairs.
export const localChainData = (
    wethAddress: `0x${string}` = hardhatAddresses[0],
    overrides: Partial<EvmChainDataInput> = {}
): ChainData =>
    chainDataSchema.parse({
        id: LOCAL,
        name: 'Hardhat',
        explorer: '',
        icons: {},
        kind: 'evm',
        gasToken: { chainId: LOCAL, address: '', decimals: 18, symbol: 'ETH' },
        wrappedGasToken: { chainId: LOCAL, address: wethAddress, decimals: 18, symbol: 'WETH' },
        uniswapV2: { pairs: [] },
        ...overrides,
    } satisfies EvmChainDataInput)
