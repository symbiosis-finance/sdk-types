import { getAddress } from '@ethersproject/address'
import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'

import { ChainId } from '../constants'
import { Token } from '../entities'
import { chainData } from './chainData'
import { beta, dev, mainnet, testnet } from './config'
import { ConfigCache, Deployment } from './deployment'
import { SyntheticToken } from './deployedToken'
import { Symbiosis } from './symbiosis'
import { configCacheDataSchema, parseConfigCacheData } from './config/cache/types'
import { hardhatAddresses, LOCAL, localChainData } from '../testing/localChain.fixture'
import { type ConfigInput, configSchema, parseEvmAddress } from './types'

const [LOCAL_WETH, OTHER_LOCAL_WETH] = hardhatAddresses
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const POOL_A = '0x6148FD6C649866596C3d8a971fC313E5eCE84882'
const POOL_B = '0x2d877Fe148dBCB056Bf71ED5232E8d580195c0f1'

const tokenEntry = (id: number, address: string, symbol: string) => ({
    id,
    chainId: LOCAL,
    address,
    decimals: 18,
    symbol,
})
const pool = (id: number, address: string, tokenIds: number[]) => ({
    id,
    chainId: LOCAL,
    address,
    oracle: address,
    generalPurpose: true,
    coinGeckoId: 'weth',
    tokens: tokenIds.map((tokenId, index) => ({ index, tokenId })),
})
// A deployment of one local chain, built from plain data as a test writes it.
const localDeployment = (wethAddress: `0x${string}`) => {
    const config: ConfigInput = {
        ...dev,
        omniPools: [],
        btcConfigs: [],
        chains: [{ ...dev.chains[0], id: LOCAL, chain: localChainData(wethAddress), rpc: 'http://127.0.0.1:8545' }],
    }
    const cache = parseConfigCacheData({ tokens: [tokenEntry(1, wethAddress, 'WETH')], omniPools: [] })
    return new Deployment(config, cache)
}

describe('Deployment', () => {
    it('gives the shipped deployments’ chains with their configs', () => {
        const eth = Deployment.named('mainnet').chain(ChainId.ETH_MAINNET)
        const parsed = Deployment.named('mainnet').config.chains
        expect(eth.config).toBe(parsed.find((chainConfig) => chainConfig.id === ChainId.ETH_MAINNET))
        expect(eth.name).toBe('Ethereum')
        expect(Deployment.named('mainnet').chains()).toHaveLength(mainnet.chains.length)
        expect(() => Deployment.named('mainnet').chain(LOCAL)).toThrow()
        expect(Deployment.named('mainnet').findChain(LOCAL)).toBeUndefined()
    })

    it('serves a test’s own chain, and two deployments of one chain id keep their own data', () => {
        const first = localDeployment(LOCAL_WETH)
        const second = localDeployment(OTHER_LOCAL_WETH)
        expect(first.chain(LOCAL).gasToken.wrapped.address).toBe(LOCAL_WETH)
        expect(second.chain(LOCAL).gasToken.wrapped.address).toBe(OTHER_LOCAL_WETH)
        expect(first.tokens().map((token) => token.address)).toEqual([LOCAL_WETH])
        expect(first.chain(LOCAL).config.rpc).toBe('http://127.0.0.1:8545')
    })

    it('makes its tokens with its own chains', () => {
        const deployment = localDeployment(LOCAL_WETH)
        const [token] = deployment.tokens()
        expect(token.chain).toBe(deployment.chain(LOCAL))
        expect(
            Deployment.named('mainnet')
                .tokens()
                .every((token) => token.chain === Deployment.named('mainnet').chain(token.chainId))
        ).toBe(true)
    })

    it('errors for a chain config that holds another chain’s data', () => {
        const config: ConfigInput = { ...dev, chains: [{ ...dev.chains[0], chain: chainData(ChainId.ETH_MAINNET) }] }
        expect(() => new Deployment(config, Deployment.named('dev').cacheData)).toThrow(/holds the data of chain/)
    })

    it('gives the shipped deployments by name, and errors for another name', () => {
        expect(Deployment.named('mainnet').config).toEqual(configSchema.parse(mainnet))
        expect(Deployment.named('beta').config).toEqual(configSchema.parse(beta))
        expect(() => Deployment.named('staging' as 'mainnet')).toThrow(/Unknown config name/)
    })

    it('gives its own token for any token of the same chain, address and chainFromId', () => {
        const deployment = Deployment.named('mainnet')
        for (const token of deployment.tokens()) {
            const copy = new Token(deployment.chain(token.chainId), token)
            const first = deployment
                .tokens()
                .find((other) => other.equals(token) && other.chainFromId === token.chainFromId)
            expect(deployment.token(copy)).toBe(first)
        }
        const eth = deployment.chain(ChainId.ETH_MAINNET)
        expect(deployment.token(eth.gasToken)).toBeDefined()
    })

    it('links each synthetic and its original both ways, synthetics of synthetics too', () => {
        const deployment = Deployment.named('mainnet')
        for (const token of deployment.tokens()) {
            if (!(token instanceof SyntheticToken)) continue
            expect(token.original.chainId).toBe(token.chainFromId)
            expect(token.original.synthetics).toContain(token)
        }
        const sisOnBsc = deployment
            .tokens()
            .find(
                (token) =>
                    token instanceof SyntheticToken && token.chainId === ChainId.BSC_MAINNET && token.symbol === 'SIS'
            )
        expect(sisOnBsc).toBeDefined()
        expect(sisOnBsc!.syntheticOn(ChainId.SYMBIOSIS_MAINNET)?.symbol).toBe('sSIS')
    })

    it('gives each token its underlying token: a synthetic’s original, one step back; any other token, itself', () => {
        const deployment = Deployment.named('mainnet')
        for (const token of deployment.tokens()) {
            expect(token.underlying).toBe(token instanceof SyntheticToken ? token.original : token)
        }
        const sisOnBsc = deployment
            .tokens()
            .find((token) => token.isSynthetic && token.chainId === ChainId.BSC_MAINNET && token.symbol === 'SIS')!
        const sSis = sisOnBsc.syntheticOn(ChainId.SYMBIOSIS_MAINNET)!
        expect(sSis.underlying).toBe(sisOnBsc)
    })

    it('keeps the deprecated getRepresentation: a synthetic’s original on the chain, else the synthetic on it', () => {
        const deployment = Deployment.named('mainnet')
        const cache = new ConfigCache('mainnet')
        const usdc = deployment
            .chain(ChainId.ETH_MAINNET)
            .tokens()
            .find((token) => token.symbol === 'USDC')!
        const sUsdc = usdc.syntheticOn(ChainId.SYMBIOSIS_MAINNET)!
        expect(sUsdc.symbol).toBe('sUSDC')
        expect(cache.getRepresentation(usdc, ChainId.SYMBIOSIS_MAINNET)).toBe(sUsdc)
        expect(cache.getRepresentation(sUsdc, ChainId.ETH_MAINNET)).toBe(usdc)
        expect(cache.getRepresentation(usdc, ChainId.BSC_MAINNET)).toBeUndefined()
        expect(cache.getRepresentation(sUsdc, ChainId.BSC_MAINNET)).toBeUndefined()
    })

    it('gives each pool its tokens, their indexes and its transit tokens, as the deprecated lookups do', () => {
        const deployment = Deployment.named('mainnet')
        const symbiosis = new Symbiosis('mainnet', 'test')
        for (const pool of deployment.omniPools()) {
            expect(pool.tokens.map((token) => token.address)).toEqual(
                symbiosis.getOmniPoolTokens(pool).map((token) => token.address)
            )
            for (const token of pool.tokens) {
                expect(pool.indexOf(token)).toBe(symbiosis.getOmniPoolTokenIndex(pool, token))
                expect(deployment.omniPoolOf(token)).toBe(pool)
            }
            for (const { id } of deployment.chains()) {
                const transit = pool.transitTokens(id)
                // in the pool's order; the deprecated list is in the data's
                expect(transit.map((token) => token.address).sort()).toEqual(
                    symbiosis
                        .transitTokens(id, pool)
                        .map((token) => token.address)
                        .sort()
                )
                for (const token of transit) expect(deployment.omniPoolOf(token)).toBe(pool)
            }
        }
    })

    it('rejects deployment data that does not parse', () => {
        const token = tokenEntry(1, WETH, 'WETH')
        const parse = (data: unknown) => configCacheDataSchema.safeParse(data).success
        expect(parse({ tokens: [token], omniPools: [] })).toBe(true)
        expect(parse({ tokens: [{ ...token, id: -1 }], omniPools: [] })).toBe(false)
        expect(parse({ tokens: [{ ...token, address: 'nope' }], omniPools: [] })).toBe(false)
        expect(parse({ tokens: [{ ...token, address: WETH.replace('C02', 'c02') }], omniPools: [] })).toBe(false)
        expect(parse({ tokens: [{ ...token, chainFromId: 1 }], omniPools: [] })).toBe(false)
        expect(parse({ tokens: [token, { ...token, address: DAI }], omniPools: [] })).toBe(false)
        expect(parse({ tokens: [token], omniPools: [pool(1, POOL_A, [1, 1])] })).toBe(false)
        expect(parse({ tokens: [token] })).toBe(false)
        expect(() => parseConfigCacheData({ tokens: [token] })).toThrow(ZodError)
    })

    it('checksums the data’s EVM addresses, and finds its tokens and pools by an address in any case', () => {
        const lower = (address: `0x${string}`) => address.toLowerCase() as `0x${string}`
        const data = parseConfigCacheData({
            tokens: [tokenEntry(1, lower(WETH), 'WETH')],
            omniPools: [pool(1, lower(POOL_A), [1])],
        })
        expect(data.tokens[0].address).toBe(WETH)
        expect(data.omniPools[0].address).toBe(POOL_A)
        expect(data.omniPools[0].oracle).toBe(POOL_A)

        const deployment = new Deployment(localDeployment(WETH).config, data)
        const chain = deployment.chain(LOCAL)
        const [token] = deployment.tokens()
        expect(deployment.token(new Token(chain, { chainId: LOCAL, address: lower(WETH), decimals: 18 }))).toBe(token)
        const [omniPool] = deployment.omniPools()
        expect(
            new ConfigCache(deployment).getOmniPoolByConfig({ ...omniPool, address: parseEvmAddress(lower(POOL_A)) })
        ).toBe(omniPool.info)
    })

    it('builds originals before their synthetics in any order of the data, and errors for originals that form a loop', () => {
        const synthetic = (id: number, address: string, originalId: number) => ({
            ...tokenEntry(id, address, `s${id}`),
            chainFromId: LOCAL,
            originalId,
        })
        const build = (tokens: object[]) =>
            new Deployment(localDeployment(WETH).config, parseConfigCacheData({ tokens, omniPools: [] }))
        const ids = (tokens: { info: { id: number } }[]) => tokens.map((token) => token.info.id)

        const deployment = build([
            synthetic(3, DAI, 2),
            synthetic(4, POOL_A, 1),
            synthetic(2, POOL_B, 1),
            tokenEntry(1, WETH, 'WETH'),
        ])
        expect(ids(deployment.tokens())).toEqual([3, 4, 2, 1])
        expect(ids(deployment.chain(LOCAL).tokens())).toEqual([3, 4, 2, 1])
        const [s3, , s2, weth] = deployment.tokens()
        expect(ids(weth.synthetics).sort()).toEqual([2, 4])
        expect(ids(s2.synthetics)).toEqual([3])
        expect(s3 instanceof SyntheticToken && s3.original).toBe(s2)

        expect(() => build([synthetic(1, WETH, 2), synthetic(2, DAI, 1)])).toThrow(/form a loop/)
        expect(() => build([synthetic(1, WETH, 1)])).toThrow(/form a loop/)
    })

    it('finds a Tron token by its base58 address', () => {
        const tron = Deployment.named('mainnet').chain(ChainId.TRON_MAINNET)
        const usdt = new Token(tron, {
            chainId: ChainId.TRON_MAINNET,
            address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
            decimals: 6,
        })
        expect(usdt.address).toBe('0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C')
        expect(Deployment.named('mainnet').token(usdt)?.symbol).toBe('USDT')
    })

    describe('with two pools on a local chain', () => {
        const build = (pools: ReturnType<typeof pool>[]) =>
            new Deployment(
                localDeployment(WETH).config,
                parseConfigCacheData({
                    tokens: [tokenEntry(1, WETH, 'WETH'), tokenEntry(2, DAI, 'DAI')],
                    omniPools: pools,
                })
            )

        it('errors for a config whose pools are not the data’s', () => {
            const deployment = build([pool(1, POOL_A, [1]), pool(2, POOL_B, [2])])
            const config = (addresses: string[]) => ({
                ...deployment.config,
                omniPools: addresses.map((address) => ({
                    ...deployment.omniPools()[0],
                    address: address as `0x${string}`,
                })),
            })
            const data = deployment.cacheData
            expect(() => new Deployment(config([POOL_A.toLowerCase(), POOL_B]), data)).not.toThrow()
            expect(() => new Deployment(config([POOL_B, POOL_A]), data)).toThrow(/are not the data's/)
            expect(() => new Deployment(config([POOL_A]), data)).toThrow(/are not the data's/)
        })

        it('errors for data that lists a pool twice', () => {
            expect(() => build([pool(1, POOL_A, [1]), pool(2, POOL_A, [2])])).toThrow(/twice/)
        })

        it('errors for data that puts a token in two pools', () => {
            expect(() => build([pool(1, POOL_A, [1]), pool(2, POOL_B, [1, 2])])).toThrow(/trades in omni pools/)
        })

        it('gives the one transit token of a chain, and errors when there are several', () => {
            const one = build([pool(1, POOL_A, [1]), pool(2, POOL_B, [2])])
            const [wethPool, daiPool] = one.omniPools()
            expect(wethPool.transitToken(LOCAL).symbol).toBe('WETH')
            expect(daiPool.transitToken(LOCAL).symbol).toBe('DAI')
            const [bothPool] = build([pool(1, POOL_A, [1, 2])]).omniPools()
            expect(() => bothPool.transitToken(LOCAL)).toThrow(/2 transit tokens/)
        })
    })

    it('gives no transit token on the pool’s own chain for a pool its tokens do not trade in', () => {
        const deployment = Deployment.named('mainnet')
        const symbiosis = new Symbiosis('mainnet', 'test')
        const usdc = deployment.omniPools().find((pool) => pool.coinGeckoId === 'usd-coin')!
        expect(() => usdc.transitToken(usdc.chainId)).toThrow(/Cannot find transitToken/)
        // the deprecated rule gave the chain's first token, whatever its pool
        expect(symbiosis.transitToken(usdc.chainId, usdc).symbol).toBe('WSIS')
    })

    it('ships its configs with every EVM address checksummed', () => {
        // a config's ChainData comes from chainData.ts, not from the config
        const evmAddresses = (value: unknown): string[] => {
            if (typeof value === 'string') return /^0x[0-9a-fA-F]{40}$/.test(value) ? [value] : []
            if (typeof value !== 'object' || value === null) return []
            return Object.entries(value).flatMap(([key, field]) => (key === 'chain' ? [] : evmAddresses(field)))
        }
        const addresses = [mainnet, beta, testnet, dev].flatMap(evmAddresses)
        expect(addresses.filter((address) => address !== getAddress(address))).toEqual([])
    })

    it('serializes its tokens as plain tokens', () => {
        const [token] = Deployment.named('mainnet').tokens()
        const plain = new Token(Deployment.named('mainnet').chain(token.chainId), token)
        expect(JSON.stringify(token)).toBe(JSON.stringify(plain))
    })
})
