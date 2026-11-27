import { getAddress } from '@ethersproject/address'
import { describe, expect, it } from 'vitest'

import { ChainId } from '../constants'
import { chainData } from '../crosschain/chainData'
import type { ChainData, EvmAddressText } from '../crosschain/types'
import { hardhatAddresses, LOCAL, localChainData } from '../testing/localChain.fixture'
import { Chain } from './chain'
import { TokenAmount } from './fractions'
import { Pair } from './pair'
import { PairGraph } from './pairGraph'
import { Route } from './route'
import { Token } from './token'

const [wethAddress, usdAddress, pairAddress, otherAddress] = hardhatAddresses
const local = localChainData(wethAddress, {
    uniswapV2: {
        pairs: [{ token0: usdAddress.toLowerCase() as `0x${string}`, token1: wethAddress, pair: pairAddress }],
    },
})
const chain = new Chain(local)
const usd = new Token({ chainId: LOCAL, address: usdAddress, decimals: 6, symbol: 'USD' })

describe('Chain', () => {
    it('wraps its gas token as its WETH and leaves other tokens', () => {
        expect(chain.gasToken.wrapped.address).toBe(wethAddress)
        expect(usd.wrapped).toBe(usd)
        expect(new TokenAmount(chain.gasToken, '5').wrapped.token.address).toBe(wethAddress)
    })

    it('leaves the gas token as it is on a chain without a wrapped one', () => {
        const btc = new Chain(chainData(ChainId.BTC_MAINNET))
        expect(btc.wrappedGasToken).toBeUndefined()
        expect(btc.gasToken.wrapped).toBe(btc.gasToken)
    })

    it('gives a known pair whatever the order and case of its tokens, and errors for an unknown one', () => {
        expect(chain.pairAddress(usd, chain.wrappedGasToken!)).toBe(pairAddress)
        expect(chain.pairAddress(chain.wrappedGasToken!, usd)).toBe(pairAddress)
        const other = new Token({ chainId: LOCAL, address: otherAddress, decimals: 18 })
        expect(() => chain.pairAddress(usd, other)).toThrow(/no Uniswap V2 pair/)
    })

    it('derives a pair from the factory, the same for either order and another on another chain', () => {
        const eth = new Chain(chainData(ChainId.ETH_MAINNET))
        const [a, b] = [usdAddress, wethAddress].map(
            (address) => new Token({ chainId: ChainId.ETH_MAINNET, address, decimals: 18 })
        )
        const address = eth.pairAddress(a, b)
        expect(address).toMatch(/^0x[0-9a-fA-F]{40}$/)
        expect(eth.pairAddress(b, a)).toBe(address)
        const bsc = new Chain(chainData(ChainId.BSC_MAINNET))
        const onBsc = [usdAddress, wethAddress].map(
            (address) => new Token({ chainId: ChainId.BSC_MAINNET, address, decimals: 18 })
        )
        expect(bsc.pairAddress(onBsc[0], onBsc[1])).not.toBe(address)
    })

    it('finds the best trade from its gas token through its own WETH', () => {
        const weth = chain.wrappedGasToken!
        const pair = new Pair(
            new TokenAmount(weth, '1000000000000000000000'),
            new TokenAmount(usd, '3000000000000'),
            chain.pairAddress(weth, usd)
        )
        const { trades } = new PairGraph(chain, [pair]).bestTradesExactIn(
            new TokenAmount(chain.gasToken, '1000000000000000000'),
            usd
        )
        expect(trades).toHaveLength(1)
        expect(trades[0].route.chain).toBe(chain)
        expect(trades[0].route.path.map((token) => token.address)).toEqual([wethAddress, usdAddress])
        expect(trades[0].outputAmount.greaterThan('0')).toBe(true)
        expect(trades[0].priceBreakdown(30).realizedLPFee.token).toBe(chain.gasToken)

        const [exactOut] = new PairGraph(chain, [pair]).bestTradesExactOut(
            chain.gasToken,
            new TokenAmount(usd, '1000000')
        ).trades
        expect(exactOut.inputAmount.token).toBe(chain.gasToken)
        expect(new Route(chain, [pair], chain.gasToken, usd).path[0]).toBe(weth)
    })

    it('is of the kind its data gives, whatever its id', () => {
        expect(new Chain(chainData(ChainId.BTC_MAINNET)).kind).toBe('btc')
        expect(new Chain(chainData(ChainId.ETH_MAINNET)).kind).not.toBe('btc')
        expect(new Chain(chainData(ChainId.TRON_MAINNET)).kind).toBe('tron')
        expect(chain.kind).toBe('evm')
        const btcLike: ChainData = {
            ...local,
            id: 31338 as ChainId,
            kind: 'btc',
            btcNetwork: 'regtest',
            gasToken: { ...local.gasToken, chainId: 31338 as ChainId },
            wrappedGasToken: undefined,
        }
        expect(new Chain(btcLike).kind).toBe('btc')
    })

    it('makes its tokens with itself as their chain', () => {
        expect(chain.gasToken.chain).toBe(chain)
        expect(usd.chain).toBeUndefined() // built without a chain, on a chain the global list does not know
        const own = new Token(chain, { chainId: LOCAL, address: usdAddress, decimals: 6 })
        expect(own.chain).toBe(chain)
        expect(own.equals(usd)).toBe(true)
        expect(JSON.stringify(own)).not.toContain('Hardhat')
        expect(() => new Token(chain, { chainId: ChainId.ETH_MAINNET, address: usdAddress, decimals: 6 })).toThrow(
            /given chain/
        )
        const pair = new Pair(
            new TokenAmount(chain.wrappedGasToken!, '1000'),
            new TokenAmount(own, '1000'),
            chain.pairAddress(chain.wrappedGasToken!, own)
        )
        expect(pair.liquidityToken.chain).toBe(chain)
    })
})

// EIP-1191's own test vectors for RSK Mainnet (chain id 30).
const RSK_VECTORS: EvmAddressText[] = [
    '0x5aaEB6053f3e94c9b9a09f33669435E7ef1bEAeD',
    '0xFb6916095cA1Df60bb79ce92cE3EA74c37c5d359',
    '0xDBF03B407c01E7CD3cBea99509D93F8Dddc8C6FB',
    '0xD1220A0Cf47c7B9BE7a2e6ba89F429762E7B9adB',
]
const eip55 = (address: string) => getAddress(address.toLowerCase())

describe('Chain.parseAddress and formatAddress', () => {
    const rootstock = new Chain(chainData(ChainId.RSK_MAINNET))
    const ethereum = new Chain(chainData(ChainId.ETH_MAINNET))

    it("takes the chain's own checksum (EIP-1191 on Rootstock), EIP-55 or lowercase, and returns EIP-55", () => {
        for (const address of RSK_VECTORS) {
            const expected = eip55(address)
            expect(address).not.toBe(expected)
            expect(rootstock.parseAddress(address)).toBe(expected)
            expect(rootstock.parseAddress(expected)).toBe(expected)
            expect(rootstock.parseAddress(address.toLowerCase())).toBe(expected)
        }
    })

    it('refuses a mixed-case address with neither checksum valid, and a Rootstock checksum on another chain', () => {
        const [address] = RSK_VECTORS
        // The first letter in the other case.
        const at = address.search(/[a-fA-F]/)
        const flipped =
            address[at] === address[at].toUpperCase() ? address[at].toLowerCase() : address[at].toUpperCase()
        const wrongCase = address.slice(0, at) + flipped + address.slice(at + 1)
        expect(() => rootstock.parseAddress(wrongCase)).toThrow('is not a valid address')
        expect(() => ethereum.parseAddress(address)).toThrow('is not a valid address')
        expect(() => rootstock.parseAddress('')).toThrow()
    })

    it("formats an address in the chain's own checksum: EIP-1191's vectors on Rootstock, EIP-55 elsewhere", () => {
        for (const address of RSK_VECTORS) {
            const parsed = rootstock.parseAddress(address)
            expect(rootstock.formatAddress(parsed)).toBe(address)
            expect(ethereum.formatAddress(parsed)).toBe(eip55(address))
        }
    })

    it("parses a token's address too, with the token's chain given or without it", () => {
        const [address] = RSK_VECTORS
        const params = { chainId: ChainId.RSK_MAINNET, address, decimals: 18 }
        expect(new Token(rootstock, params).address).toBe(eip55(address))
        expect(new Token(params).address).toBe(eip55(address))
    })
})
