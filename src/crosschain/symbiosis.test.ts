import { describe, expect, it } from 'vitest'
import { Symbiosis } from './symbiosis'

describe('slim Symbiosis', () => {
  const s = new Symbiosis('mainnet', 'symbiosis-app')

  it('formats clientId to bytes32', () => {
    expect(s.clientId).toBe('0x73796d62696f7369732d61707000000000000000000000000000000000000000')
  })
  it('loads tokens from the prebuilt cache', () => {
    expect(s.tokens().length).toBeGreaterThan(0)
  })
  it('exposes chains and chainConfig', () => {
    expect(s.chains().length).toBeGreaterThan(0)
    const anyChain = s.chains()[0]
    expect(s.chainConfig(anyChain.id).id).toBe(anyChain.id)
  })
  it('does NOT expose web3 members', () => {
    expect((s as unknown as Record<string, unknown>).providers).toBeUndefined()
    expect((s as unknown as Record<string, unknown>).coinGecko).toBeUndefined()
    expect((s as unknown as Record<string, unknown>).swapExactIn).toBeUndefined()
    expect((s as unknown as Record<string, unknown>).waitForComplete).toBeUndefined()
  })
})
