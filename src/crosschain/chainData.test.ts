import { describe, expect, it } from 'vitest'

import { ZodError } from 'zod'

import { ChainId } from '../constants'
import { CHAIN_DATA, chainData } from './chainData'
import { beta, dev, mainnet, testnet } from './config'
import { chainConfigSchema, chainDataSchema, configSchema } from './types'

// EIP-1191's first test vector for RSK Mainnet (chain id 30), and its EIP-55 form.
const RSK_ADDRESS = '0x5aaEB6053f3e94c9b9a09f33669435E7ef1bEAeD'
const RSK_ADDRESS_EIP55 = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'

describe('CHAIN_DATA', () => {
    it('has every chain id once', () => {
        const ids = Object.values(ChainId).filter((value) => typeof value === 'number')
        expect(CHAIN_DATA).toHaveLength(ids.length)
        expect(new Set(CHAIN_DATA.map((data) => data.id)).size).toBe(ids.length)
        for (const id of ids) expect(chainData(id).id).toBe(id)
    })

    it('gives a Bitcoin network to the Bitcoin chains only', () => {
        const withNetwork = CHAIN_DATA.filter((data) => 'btcNetwork' in data).map((data) => data.id)
        expect(withNetwork.sort()).toEqual([ChainId.BTC_MAINNET, ChainId.BTC_MUTINY, ChainId.BTC_TESTNET4].sort())
        for (const data of CHAIN_DATA) expect('btcNetwork' in data).toBe(data.kind === 'btc')
    })

    it('gives Stellar, Cardano, Sui and Canton the kind other, not evm', () => {
        for (const id of [ChainId.XLM_MAINNET, ChainId.ADA_MAINNET, ChainId.SUI_MAINNET, ChainId.CANTON_MAINNET]) {
            expect(chainData(id).kind).toBe('other')
        }
    })

    it('puts each gas token and wrapped gas token on its own chain', () => {
        for (const data of CHAIN_DATA) {
            expect(data.gasToken.chainId).toBe(data.id)
            if (data.wrappedGasToken) expect(data.wrappedGasToken.chainId).toBe(data.id)
        }
    })

    it('gives each explorer as a base URL with no trailing slash', () => {
        for (const data of CHAIN_DATA) expect(data.explorer).not.toMatch(/\/$/)
    })
})

describe('the data schemas', () => {
    const rootstock = chainData(ChainId.RSK_MAINNET)
    const ethereum = chainData(ChainId.ETH_MAINNET)
    const rootstockConfig = mainnet.chains.find((chainConfig) => chainConfig.id === ChainId.RSK_MAINNET)!

    it("parse a lowercase address, or one in the chain's own checksum, into EIP-55", () => {
        expect(chainDataSchema.parse({ ...ethereum, multicall: RSK_ADDRESS_EIP55.toLowerCase() }).multicall).toBe(
            RSK_ADDRESS_EIP55
        )
        expect(chainDataSchema.parse({ ...rootstock, multicall: RSK_ADDRESS }).multicall).toBe(RSK_ADDRESS_EIP55)
        expect(chainConfigSchema.parse({ ...rootstockConfig, router: RSK_ADDRESS }).router).toBe(RSK_ADDRESS_EIP55)
        expect(
            chainConfigSchema.parse({
                ...rootstockConfig,
                onchainSwapRouter: { gateway: RSK_ADDRESS, executor: RSK_ADDRESS },
            }).onchainSwapRouter?.gateway
        ).toBe(RSK_ADDRESS_EIP55)
    })

    it('error at a bad address with its path, such as a Rootstock checksum on another chain', () => {
        const issues = (parse: () => unknown) => {
            try {
                parse()
            } catch (error) {
                expect(error).toBeInstanceOf(ZodError)
                return (error as ZodError).issues.map(({ path, message }) => ({ path, message }))
            }
            throw new Error('parsed')
        }
        expect(issues(() => chainDataSchema.parse({ ...ethereum, multicall: RSK_ADDRESS }))).toEqual([
            { path: ['multicall'], message: `${RSK_ADDRESS} is not a valid address.` },
        ])
        const ethereumConfig = mainnet.chains.find((chainConfig) => chainConfig.id === ChainId.ETH_MAINNET)!
        const badConfig = {
            ...mainnet,
            chains: [rootstockConfig, { ...ethereumConfig, depository: undefined, router: RSK_ADDRESS }],
        }
        expect(issues(() => configSchema.parse(badConfig))).toEqual([
            { path: ['chains', 1, 'router'], message: `${RSK_ADDRESS} is not a valid address.` },
        ])
    })
})

describe.each([
    ['mainnet', mainnet],
    ['beta', beta],
    ['testnet', testnet],
    ['dev', dev],
])('the %s config', (_, config) => {
    it('gives each chain its own chain data', () => {
        for (const chainConfig of config.chains) {
            expect(chainConfig.chain).toBe(chainData(chainConfig.id))
        }
    })
})
