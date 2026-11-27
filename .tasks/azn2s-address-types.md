---
status: todo
tags: [addresses, types]
---

# Address types that the compiler enforces

## Goal

Every address kind is a type that holds one canonical form, so that comparing two addresses with `===` is always right
and an address that was not parsed cannot reach code that needs one. Today `EvmAddress` is only `` `0x${string}` ``: it
admits lowercase and wrongly checksummed values (ChainData's lowercase multicalls, the casts in sdk-types and the API),
and `TronAddress`, `TonAddress` and the rest are plain or template strings. Done when each address kind is a branded
type with one parser as its only constructor, the data and the config cache are parsed into those types, casts to them
are banned outside the parsers, and svc-symbiosis-api builds on them.

## Decisions

- Branded strings (user, 2026-11-27): `EvmAddress = Brand<`0x${string}`, 'evm'>`, and so on for each kind. They cost
  nothing at runtime and stay strings for JSON, ABI encoding and logs. A check with TypeScript 5.9 showed that the
  compiler rejects comparing two kinds (TS2367), assigning a literal or a template-typed string without parsing, and
  passing one kind where another is required. It still allows comparing with a plain `string`, which only exists
  before parsing; a typed lint rule can forbid that too.
- One canonical form per kind: EIP-55 for EVM. A chain's own checksum (EIP-1191 on Rootstock,
  `EvmChainData.addressChecksum`) is taken by `chain.parseAddress` and given only for display (`chain.formatAddress`, a
  plain string). Tron: base58, version byte 0x41 checked.
- It lands in sdk-types 0.1.0 (symbiosis-finance/sdk-types#31), before that release, so the change to `EvmAddress`
  ships with 0.1.0's other breaking changes; svc-symbiosis-api adapts in its PR #262, with its task Thtyxe (Rootstock
  addresses), which becomes a case of this one (user, 2026-11-27).
- Data literals stay plain and are branded when parsed (user, 2026-11-27, option 1): a deployment's data is written
  with `` `0x${string}` `` strings, and one zod schema per data type parses it whole when the `Deployment` or `Chain`
  is built, giving the written type (`z.input`) and the branded type code reads (`z.output`). Rejected: an `evm('0x…')`
  helper at each of the data's literals, which rewrites hundreds of lines. This also does gaqz6's "ChainData is not
  parsed".
- The piecemeal fixes that the unsmell run of 2026-11-27 proposed for `string`-typed address helpers are done here
  instead, in the final shape (user, 2026-11-27).

## State

The EVM type is done in e9f6c49 (2026-11-27): `src/addresses.ts` (the brand, `EvmAddressText`, the parsers,
`evmAddressSchema`, `onChain` for a chain's own checksum in data), zod schemas in src/crosschain/types.ts giving
`…Input` (written) and the parsed types, `CHAIN_DATA` and `new Deployment` parsing once, `Chain.formatAddress`, and
ESLint banning casts outside src/addresses.ts. Shipped data is the same, except 76 ChainData multicall/factory values
that are now EIP-55. svc-symbiosis-api has 46 new type errors against it (literals typed EvmAddress in tests,
comparisons with `AddressZero`, sentinel literals as TokenAddress), listed in the run's notes. Open: zod drops field
docs from the published `.d.ts`, which grows to about 1,900 lines.

Found by that run's sweep (`.git/unsmell/20261127-125751/findings/sweep-1.yaml`, local only; ids below):

- **Bugs in `tronAddressToEvm`** (src/crypto/tronAddress.ts), both reproduced: it does not check the 0x41 version byte,
  so a Bitcoin address `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` gives `0062e9…8f18`, 42 hex digits without `0x`
  (sweep1-2); its `0x` check has the `i` flag, so `0X…` comes back unchanged (sweep1-3). Only the API's coingecko code
  calls sdk-types' copy; the API's other Tron callers use its own TronWeb copy (chainUtils/tron.ts:97).
- **`string`-typed address helpers**: `tronAddressToEvm` returns `string` (sweep1-1); `Token.tonAddress` and
  `attributes.ton` hold TON addresses (sweep1-8); `contract_address` and `owner_address` in src/crosschain/tronTypes.ts
  are Tron addresses (sweep1-9). Their parameters that take raw text stay `string` (sweep1-7).
- **The EVM-address check written three times**: the regex in src/crypto/tronAddress.ts:21 and
  src/crosschain/config/cache/types.ts:17, `isHexString(address, 20)` in src/utils.ts (sweep1-3, sweep1-4).
- **Casts beside `parseEvmAddress`**: `getAddress(x) as EvmAddress` at src/entities/pairAddresses.ts:28 and 52 and
  src/crosschain/config/cache/types.ts:18; an uncast `getAddress` at pairAddresses.ts:27, so `tokens` is a `string[]`;
  and a cast of `getEvmCreate2Address` at pairAddresses.ts:41 (sweep1-5).
- **tronAddress.ts's comments**: a false one ("hexlify … used in pair.ts"), history narration, and a copy of the empty
  address fact that `TokenAddress` owns (sweep1-6); the file and its test are not formatted by .prettierrc (sweep1-14).

## Next

Write the design into README ("Deployments and chains"): the branded types, their parsers, the conversions between
kinds, and what is banned. Then the EVM type first: `EvmAddress` branded, `parseEvmAddress`/`chain.parseAddress` its
constructors, ChainData and the config cache parsed into it, the casts replaced, a lint rule against casts to the
brands; then Tron (`parseTronAddress`, fixing both bugs), TON, BTC and Solana. Check web-app, explorer-private,
intent-solver and tron-bridge-app against the build, as for 0.1.0's other breaks.
