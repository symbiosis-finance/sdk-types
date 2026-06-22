import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('built package is consumable from Node', () => {
  it('loads via ESM import and constructs slim Symbiosis', () => {
    const out = execFileSync('node', ['--input-type=module', '-e',
      `import('${join(pkgRoot, 'dist/esm/index.js')}').then(m => { const s = new m.Symbiosis('mainnet','x'); console.log(s.tokens().length > 0 && typeof m.getAddress === 'function') })`
    ]).toString().trim()
    expect(out).toBe('true')
  })
})
