/**
 * ENG-1700: find synths that are active in omniPools but are stale
 * (deprecated in config or absent from config at all).
 *
 * Usage: ENV=mainnet npx tsx scripts/pool-audit/audit.ts
 */
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import fs from 'fs'
import { formatUnits } from '@ethersproject/units'

import ERC20 from '../config-cache/abis/ERC20.json' with { type: 'json' }
import { Fabric__factory, OmniPool__factory } from '../config-cache/contracts'
import { getMulticall, tryAggregateChunked } from '../config-cache/multicall'
import { config as mainnet } from '../../src/crosschain/config/mainnet'
import { config as beta } from '../../src/crosschain/config/beta'
import { config as testnet } from '../../src/crosschain/config/testnet'
import { ChainId } from '../../src/constants'
import type { Config } from '../../src/crosschain/types'
import type { TokenConstructor } from '../../src/entities'
import { isTronChainId } from '../../src/constants'

const env = (process.env.ENV ?? 'mainnet') as 'mainnet' | 'beta' | 'testnet'
const config: Config = { mainnet, beta, testnet }[env]

type Reason = 'deprecated' | 'not-in-config'

type Row = {
    reason: Reason
    chainId: number
    address: string
    symbol: string
    name: string
    poolAddress: string
    poolIndex: number
    poolName: string
    originalChainId?: number
    originalAddress?: string
    originalSymbol?: string
    liability: string
    cash: string
    covRatio: string // cash / liability
}

function chainName(id: number): string {
    return ChainId[id] ?? String(id)
}

function provider(chainId: ChainId): StaticJsonRpcProvider {
    const chain = config.chains.find((c) => c.id === chainId)
    if (!chain) throw new Error(`no chain ${chainId} in config`)
    const rpc = isTronChainId(chain.id) ? `${chain.rpc}/jsonrpc` : chain.rpc
    return new StaticJsonRpcProvider(rpc, chain.id)
}

async function main() {
    // 1. all real (stable) tokens from config, keyed by chainId+address
    const stables: TokenConstructor[] = config.chains.flatMap((c) => c.stables)
    config.btcConfigs.forEach((b) => stables.push(b.btc))

    // 2. group pools by hosting chain; build synth -> original map via Fabric.getSyntRepresentation
    const poolChains = [...new Set(config.omniPools.map((p) => p.chainId))]
    const synthToOriginal = new Map<string, TokenConstructor>() // key: `${chainId}:${synthAddrLower}`

    for (const chainId of poolChains) {
        const chain = config.chains.find((c) => c.id === chainId)!
        if (chain.fabric === AddressZero) continue
        const prov = provider(chainId)
        const fabric = Fabric__factory.connect(chain.fabric, prov)
        const multicall = await getMulticall(prov)
        const calls = stables.map((t) => ({
            target: fabric.address,
            callData: fabric.interface.encodeFunctionData('getSyntRepresentation', [t.address, t.chainId]),
        }))
        const results = await tryAggregateChunked(multicall, calls)
        results.forEach(({ success, returnData }, i) => {
            if (!success)
                throw new Error(`getSyntRepresentation failed for ${stables[i].chainId}:${stables[i].address}`)
            const synth: string = fabric.interface.decodeFunctionResult('getSyntRepresentation', returnData)[0]
            if (synth === AddressZero) return
            synthToOriginal.set(`${chainId}:${synth.toLowerCase()}`, stables[i])
        })
        console.error(
            `[${chainName(chainId)}] fabric knows ${synthToOriginal.size} synths for ${stables.length} config tokens`
        )
    }

    // 3. walk every pool index
    const rows: Row[] = []
    let totalActive = 0
    for (const pool of config.omniPools) {
        const prov = provider(pool.chainId)
        const omniPool = OmniPool__factory.connect(pool.address, prov)
        const multicall = await getMulticall(prov)
        const last = (await omniPool.lastIndex()).toNumber()
        const calls = [...Array(last).keys()].map((index) => ({
            target: omniPool.address,
            callData: omniPool.interface.encodeFunctionData('indexToAsset', [index]),
        }))
        const assets = await tryAggregateChunked(multicall, calls)
        const poolName = pool.coinGeckoId
        const chainStables = config.chains.find((c) => c.id === pool.chainId)!.stables

        for (let index = 0; index < assets.length; index++) {
            const { success, returnData } = assets[index]
            if (!success) throw new Error(`indexToAsset(${index}) failed for pool ${pool.address}`)
            const asset = omniPool.interface.decodeFunctionResult('indexToAsset', returnData)
            if (!asset.active) continue
            totalActive++
            const tokenAddr: string = asset.token
            const key = `${pool.chainId}:${tokenAddr.toLowerCase()}`

            // real token hosted on the pool chain itself (e.g. WSIS)
            const realOnPoolChain = chainStables.find((s) => s.address.toLowerCase() === tokenAddr.toLowerCase())
            const original = synthToOriginal.get(key)

            let reason: Reason | undefined
            if (realOnPoolChain) {
                if (realOnPoolChain.deprecated) reason = 'deprecated'
            } else if (original) {
                if (original.deprecated) reason = 'deprecated'
            } else {
                reason = 'not-in-config'
            }
            if (!reason) continue

            const erc20 = new Contract(tokenAddr, ERC20, prov)
            const [symbol, name] = await Promise.all([erc20.symbol(), erc20.name()])
            // OmniPool stores cash/liability normalized to 18 decimals regardless of token decimals
            const fmt = (v: { toString(): string }) => Number(formatUnits(v.toString(), 18)).toFixed(2)
            const orig = original ?? realOnPoolChain
            rows.push({
                reason,
                chainId: pool.chainId,
                address: tokenAddr,
                symbol,
                name,
                poolAddress: pool.address,
                poolIndex: index,
                poolName,
                originalChainId: orig?.chainId,
                originalAddress: orig?.address,
                originalSymbol: orig?.symbol,
                liability: fmt(asset.liability),
                cash: fmt(asset.cash),
                covRatio: asset.liability.isZero()
                    ? '—'
                    : (Number(asset.cash.toString()) / Number(asset.liability.toString())).toFixed(3),
            })
        }
        console.error(`[pool ${poolName} ${pool.address}] lastIndex=${last}`)
    }

    console.error(`active assets total: ${totalActive}, to deactivate: ${rows.length}`)

    const out = process.env.OUT
    if (out) {
        fs.writeFileSync(out, JSON.stringify(rows, null, 2))
        console.error(`written ${out}`)
    }

    // markdown table for the ticket
    console.log(
        `| # | pool | pool address | index | chainId | synth address | symbol | name | original chainId | original | reason | liability | cash | cash/liab |`
    )
    console.log(`|---|---|---|---|---|---|---|---|---|---|---|---|---|---|`)
    rows.forEach((r, i) => {
        const orig = r.originalChainId
            ? `${r.originalSymbol} @ ${chainName(r.originalChainId)} ${r.originalAddress}`
            : '—'
        console.log(
            `| ${i + 1} | ${r.poolName} | ${r.poolAddress} | ${r.poolIndex} | ${r.chainId} | ${r.address} | ${r.symbol} | ${r.name} | ${r.originalChainId ?? '—'} | ${orig} | ${r.reason} | ${r.liability} | ${r.cash} | ${r.covRatio} |`
        )
    })
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
