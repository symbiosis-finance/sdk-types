---
status: todo
tags: [unsmell]
---
# Leftovers from the unsmell run of 2026-11-26 (commit 68176b7)

## Goal

The smells that the run on commit 68176b7 (deployments and chains as objects, 0.1.0) found but did not fix: data-model
redesigns that wait on a decision, and smells on lines the commit did not change. Done when each item below is fixed or
consciously dropped. The run's findings, decisions and patches are in `.git/unsmell/20261126-110432/` (local only);
the ids below are its finding ids.

## ChainData model

Each of these changes the shape of `ChainData` and its 88 entries, so they are best done together.

- **No Uniswap V2 has three spellings** (b5-14, b6-4, cross-27). 53 entries give a zero factory and a zero init code
  hash, and tests give `{ pairs: [] }`, while the type requires `uniswapV2`. Make it optional (absent means none), drop
  the 53 sentinels, and have `pairAddressesOf` error for a chain without it.
- **The CREATE2 formula is decided in code** (b4-32, b6-11, cross-24). `pairAddressesOf` picks zkSync's formula by one
  chain id. The factory variant could carry it (`create2: 'zksync'`), set on Cronos zkEVM's data.
- **Each gas token repeats its chain id** (b6-2, cross-29). The 157 gas and wrapped gas tokens restate their entry's id
  as `chainId`. A gas-token type without `chainId`, filled in by `Chain`, removes the copies and the mismatch.
- **"None" spelled as a value** (b6-5, b6-7, cross-30). HECO, OKEX and Solana give `multicall` as the zero address, and
  Tempo's `coinGecko.gasTokenId` is `''`. Leave the field out instead; the deprecated tables must keep their values.
- **Placeholder wrapped gas tokens** (b6-8, b6-9). Symbiosis testnet's WTVT is at the zero address, and on Stable and
  Arc the wrapped gas token is the gas token's own contract under another name. Drop them or describe each contract
  once; this changes `isFakeWETH` and the deprecated `WETH` for those chains.

## Shipped configs

- **Beta copies mainnet's contracts** (b7-3, b7-4). On the 49 shared chains, beta repeats mainnet's periphery and core
  contracts. Options: beta derives them from mainnet (`...peripheryOf(mainnet, id)`), or a shared module holds them.
- **A config with no contracts is built three ways** (b7-8, cross-31). The Changelly/THORChain maps in mainnet.ts and
  beta.ts, and `configOf` in deployment.ts. One `contractlessChainConfig(id)` beside `chainData`.
- **A missing contract has two spellings** (b7-21). Old fields hold the zero address 148 times; new ones are
  optional. Make the old ones optional too, with a type-check of the consumers.
- **The metaRouter setup allows impossible states** (b7-7, b7-17). On the new-metaRouter-only chains,
  `approvableMetaRouter` restates `metaRouter`/`metaRouterExecutor`. A union of the legacy and the new setup; the two
  copied comments go with it.
- **ChainConfig.id restates chain.id** (cross-32). 98 entries spell the id twice, checked at runtime and in a test.
  Read it from `chain.id` instead.
- **Stables restate the wrapped gas token** (b7-13, cross-34). 25 mainnet and 23 beta stables are their chain's wrapped
  gas token, with names that disagree in 12 cases. Write them from `chainData(id).wrappedGasToken`.
- **Repeated per-deployment values** (b7-19, b7-20, b7-22). `intentConfig.bridge` equals its chain's bridge; the pauser
  and the depository timings repeat on every chain; each `revertableAddress` has a Tron entry equal to its default.
- **The builder skips one literal address** (b7-25). `scripts/config-cache/builder.ts` skips the portal whitelist
  check for symBTC by its address; the stable could carry that fact.
- **The cache files keep defaults the schema drops** (b7-11). Regenerate them with the builder, which now writes only
  the schema's fields.

## Types

- **TokenAddress '' means a gas token** (b5-24). A union (`{ kind: 'gas' } | { kind: 'contract'; address }`) or one
  `Token.isGasToken` that owns the rule.
- **SwapExactInParams has three-state fields** (b5-27). `signature` and `limits` use `?: T | null`, explained by
  comments. A union, or drop the legacy fallback.

## Docs and comments on lines the commit did not change

- `src/entities/token.ts:30-33`: Token's class doc says "any fungible financial instrument on Ethereum" (b3-28).
- `src/constants.ts:69-70`: `TON_TESTNET = 85919, // correct is 85918` contradicts its value (b5-29).
- `src/crosschain/config/testnet.ts:146`: `dexFee: 30, // 0.03%` is false; 30 basis points is 0.3%. The unit belongs on
  `ChainConfig.dexFee`'s doc (b7-14, cross-7).
- `src/crosschain/config/testnet.ts:33`: "host chain is better to be first" states a rule nothing reads (b7-15).
- `src/crosschain/config/mainnet.ts:1924-1926`: the perp comment names the deprecated `GAS_TOKEN` (b7-16).
- `src/crosschain/config/mainnet.ts:110` and beta: the SynthesisBTC comment has to be read twice (b7-26).
- `src/crosschain/types.ts`: trailing sentence comments on fields, with a typo and units missing (b5-28).
- `src/index.ts:20-21`: the comment on the @ethersproject re-exports names the consumers' uses (b5-31).
- Commented-out data in testnet.ts and beta.ts (b7-18).
- `src/crosschain/addressValidation.ts:5-39`: rows not prettier-formatted (b2-9).

## Dead code and dependencies

- `NATIVE_TOKEN_ADDRESS` in src/constants.ts has no reader, and two section comments around it are stale (b5-30).
- `package.json`: the devDependency `ethers` is unused, and `@ethersproject/units`, which a script imports, is not
  declared (b8-22).

## From the API's move to a Deployment (svc-symbiosis-api task rdyrn, step 2)

Not smells of the unsmell run, but follow-ups the API's step 2 found in sdk-types (2026-11-26).

- **Mainnet's data lists sSIS and sUSDC twice** (#113 and #194, #121 and #195), each pair with different originals,
  because SIS on BSC and USDC on Telos are each listed as an original and as a synthetic. A lookup gives the first
  entry, and the API's route map skips the second on purpose. Fix it where the data is written:
  `scripts/config-cache/builder.ts`.
- **No lookup of a token by address alone.** The API's builder keeps `findToken(address, chainId)`, the deployment's
  first token at an address on a chain, of any origin: its three callers (revert requests, stuck transactions, the
  explorer's transactions) have an address but no `chainFromId`, so `deployment.token(token)` does not fit. A
  `DeployedChain` method for it would let the API drop its own search.
- **The Avalanche Unwrapper's note is gone.** The API's `UNWRAP_ADDRESSES` said of Avalanche's
  `0xBC04d4F87B1d5c83AC8a05748Bc4cc5F893B8621`: "The CREATE2 factory owns this Unwrapper and cannot call setWrapper
  on it (ENG-1945)". The API now reads `ChainConfig.unwrapper`, so the note belongs next to that address in
  `src/crosschain/config/mainnet.ts`.

## Next

Decide the ChainData model items together (they share one migration of `chainData.ts`), then the shipped-config items.
The doc and dead-code items are independent and small.
