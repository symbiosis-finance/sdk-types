import { describe, expect, it } from 'vitest'

import { once } from './utils'

describe('once', () => {
    it('computes on the first call only, an undefined value too', () => {
        let calls = 0
        const value = once(() => {
            calls += 1
            return undefined
        })
        expect(calls).toBe(0)
        expect(value()).toBeUndefined()
        expect(value()).toBeUndefined()
        expect(calls).toBe(1)
    })
})
