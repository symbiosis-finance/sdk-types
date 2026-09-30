/**
 * Checks that bridge/portal/synthesis point at the chain's configured pauser.
 * A contract without pauser() (not upgraded yet) is a warning, a mismatch is an error.
 *
 * Usage: ENV=mainnet npm run check-pausers
 */
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { StaticJsonRpcProvider } from '@ethersproject/providers'

import { ChainId, isTronChainId } from '../../src/constants'
import { config as beta } from '../../src/crosschain/config/beta'
import { config as dev } from '../../src/crosschain/config/dev'
import { config as mainnet } from '../../src/crosschain/config/mainnet'
import { config as testnet } from '../../src/crosschain/config/testnet'
import type { ChainConfig, Config, ConfigName } from '../../src/crosschain/types'

const env = (process.env.ENV ?? 'mainnet') as ConfigName
const configs: Record<ConfigName, Config> = { mainnet, testnet, dev, beta }
const config = configs[env]
if (!config) throw new Error(`Unknown config name: ${env}`)

const PAUSER_ABI = ['function pauser() view returns (address)']
const CONTRACTS = ['bridge', 'portal', 'synthesis'] as const

type Level = 'ok' | 'warn' | 'error'
type Result = { level: Level; message: string }

function chainName(id: ChainId): string {
    return ChainId[id] ?? String(id)
}

async function checkChain(chain: ChainConfig & { pauser: string }): Promise<Result[]> {
    const rpc = isTronChainId(chain.id) ? `${chain.rpc}/jsonrpc` : chain.rpc
    const provider = new StaticJsonRpcProvider(rpc, chain.id)
    const expected = chain.pauser.toLowerCase()

    return Promise.all(
        CONTRACTS.filter((name) => chain[name] !== AddressZero).map(async (name): Promise<Result> => {
            const address = chain[name]
            const prefix = `[${chainName(chain.id)}] ${name} ${address}`
            let actual: string
            try {
                actual = (await new Contract(address, PAUSER_ABI, provider).pauser()).toLowerCase()
            } catch (e) {
                // Revert means the contract has no pauser() yet; anything else is an RPC problem
                if ((e as { code?: string }).code === 'CALL_EXCEPTION') {
                    return { level: 'warn', message: `${prefix}: no pauser(), not upgraded yet` }
                }
                return { level: 'error', message: `${prefix}: pauser() call failed: ${(e as Error).message}` }
            }
            if (actual !== expected) {
                return { level: 'error', message: `${prefix}: pauser is ${actual}, config has ${expected}` }
            }
            return { level: 'ok', message: `${prefix}: ok` }
        })
    )
}

async function main() {
    const chains = config.chains.filter((chain): chain is ChainConfig & { pauser: string } => !!chain.pauser)
    console.log(`checking pausers for env:${env}, ${chains.length} chains`)

    const results = (await Promise.all(chains.map(checkChain))).flat()

    const log = { ok: console.log, warn: console.warn, error: console.error }
    for (const level of ['ok', 'warn', 'error'] as const) {
        results.filter((r) => r.level === level).forEach((r) => log[level](`${level.toUpperCase()} ${r.message}`))
    }

    const count = (level: Level) => results.filter((r) => r.level === level).length
    console.log(`ok: ${count('ok')}, warn: ${count('warn')}, error: ${count('error')}`)
    if (count('error') > 0) process.exit(1)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
