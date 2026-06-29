import { test, expectTypeOf } from 'vitest'
import type { OperationType, SwapExactInParams } from './types'

test("'private-swap' is a valid OperationType", () => {
    expectTypeOf<'private-swap'>().toMatchTypeOf<OperationType>()
})

test('SwapExactInParams exposes an optional private flag', () => {
    expectTypeOf<SwapExactInParams>().toHaveProperty('private').toEqualTypeOf<boolean | undefined>()
})
