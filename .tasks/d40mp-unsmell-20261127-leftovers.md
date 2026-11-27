---
status: todo
tags: [unsmell]
---

# Leftovers from the unsmell run of 2026-11-27 (Rootstock addresses)

## Goal

The smells that the run on the Rootstock (EIP-1191) address change found on lines it did not change. Done when each
item below is fixed or consciously dropped. The run's findings, decisions and patches are in
`.git/unsmell/20261127-125751/` (local only); the ids below are its finding ids. The address-typing findings of that run
are in task Tazn2s instead.

## Docs

- **`Token.sorted` repeats `sortsBefore`'s error contract** (recheck2-6, src/entities/token.ts:118-121). `sortsBefore`
  owns "Errors when the tokens have the same address or are on different chains"; `sorted`'s doc keeps its own fact and
  says "Errors as `sortsBefore` does."
- **trade.ts docs restate the code** (recheck2-8, src/entities/trade.ts:15-217). `@param` lines and field docs read
  their names back, `//` comments narrate the branches (lines 23, 44, 51), and line 37 states a precondition as "must".
  Keep each doc's own fact (no slippage assumed, the sign of the price impact) and name errors in the "Errors when"
  form. The invariant codes 'INPUT_CURRENCY' and 'OUTPUT_CURRENCY' say "currency", a type sdk-types does not have;
  renaming them changes messages that consumers see, so it needs a decision.
- **price.ts comments** (recheck2-9, src/entities/fractions/price.ts:12-14, 28, 58). Sentences trail the fields,
  "denominator and numerator _must_ be raw" is a "must" precondition, and "performs floor division on overflow" is
  misleading: `quote` always rounds down. Each fact becomes a doc on its own line: the raw units of `denominator` and
  `numerator`, and that `quote` rounds down.
