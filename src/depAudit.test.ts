import { describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Rationale: sdk-types may use small pure @ethersproject utility packages
// (address/strings/solidity/keccak256/bytes/bignumber/constants/rlp/sha2/logger) — they carry no
// network/contract code and are already bundled by the app & api. It must NOT pull
// providers/contracts/abstract-* or any heavy chain SDK (tron/solana/ton/raydium/uniswap/chainflip/
// bitcoin) nor the bare `ethers` umbrella (which drags in the whole stack).
const FORBIDDEN = [
  'ethers',
  '@ethersproject/providers',
  '@ethersproject/contracts',
  '@ethersproject/abstract-provider',
  '@ethersproject/abstract-signer',
  'tronweb',
  '@solana/web3.js',
  '@ton/ton',
  '@ton/core',
  '@raydium-io/raydium-sdk-v2',
  '@uniswap/v3-sdk',
  '@chainflip/sdk',
  'bitcoinjs-lib',
]

// Pure @ethersproject utility packages explicitly permitted (no network/contract code).
const ALLOWED_ETHERSPROJECT = [
  '@ethersproject/address',
  '@ethersproject/solidity',
  '@ethersproject/strings',
  '@ethersproject/keccak256',
  '@ethersproject/bytes',
  '@ethersproject/bignumber',
  '@ethersproject/constants',
  '@ethersproject/rlp',
  '@ethersproject/sha2',
  '@ethersproject/logger',
]

const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = join(here, '..')

describe('heavy-web3 dependency audit', () => {
  it('declares no forbidden heavy dependencies in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'))
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies })
    // Forbid the bare `ethers` umbrella and any @solana/* scope wholesale.
    const leaked = deps.filter(
      (d) =>
        FORBIDDEN.includes(d) ||
        (d.startsWith('@solana/') && !ALLOWED_ETHERSPROJECT.includes(d)) ||
        (d.startsWith('@ton/') && !ALLOWED_ETHERSPROJECT.includes(d))
    )
    expect(leaked).toEqual([])
  })

  it('only depends on pure @ethersproject utility packages (no heavy ethersproject modules)', () => {
    const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'))
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies })
    const badEthers = deps.filter((d) => d.startsWith('@ethersproject/') && !ALLOWED_ETHERSPROJECT.includes(d))
    expect(badEthers).toEqual([])
  })

  it('has no forbidden HEAVY import in any source file', () => {
    // Only match real import/require statements targeting forbidden heavy/network/chain modules.
    // Uses spawnSync (no shell) to avoid quoting issues with ['"] character classes.
    // This avoids false-positives from:
    //   - comments
    //   - enum string values (e.g. CHAINFLIP_BRIDGE = 'chainflip-bridge', RAYDIUM = 'raydium')
    //   - data string literals (e.g. explorer: 'https://etherscan.io', 'solana' property names)
    // Pure @ethersproject utils (address/solidity/strings/keccak256/bytes/...) are ALLOWED and so
    // are deliberately NOT matched here; only the heavy ethersproject modules are forbidden.
    // Pattern matches: from 'pkg' | from "pkg" | require('pkg') | require("pkg")
    const pattern =
      "(from|require\\()[[:space:]]*['\"](" +
      "@ethersproject/(providers|contracts|abstract-provider|abstract-signer)" +
      "|ethers['\"]" + // bare `ethers` umbrella only (not @ethersproject/*)
      "|tronweb|@solana|@ton/|@raydium|@uniswap|@chainflip|bitcoinjs" +
      ")"
    const srcDir = join(pkgRoot, 'src')
    const result = spawnSync('grep', ['-rnE', pattern, srcDir])
    // grep exits 0 = match found (bad), 1 = no match (good), 2 = error
    const stdout = result.stdout?.toString() ?? ''
    expect(stdout.trim()).toBe('')
  })
})
