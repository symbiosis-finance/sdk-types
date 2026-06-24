# @symbiosis/sdk-types

Web3-light shared layer for Symbiosis — the **types, configs, and entities** used by both the app client and the API. It deliberately bundles **no heavy chain libraries** (ethers / tronweb / @solana / @ton / @chainflip stay out), so it's a lightweight SDK that's safe to ship in the browser client.

## Layout (`src/`)

- **`entities/`** — core value objects: `Token`, `TokenAmount`, `Chain`, `Pair`, `Route`, `Trade`, plus the `fractions/` math (`Fraction`, `Percent`, `Price`).
- **`crosschain/config/`** — per-environment chain configs (`mainnet` / `testnet` / `dev` / `beta`) and the cached pool/token data read through `ConfigCache`.
- **`crosschain/`** — shared API DTO types (`types.ts`), chain constants & labels, trade types/helpers, Tron types, and a lightweight `Symbiosis` client (config + cache + pure lookups only).
- **`crypto/`** — pure address helpers (e.g. `tronAddress`, base58 ↔ EVM).
- **root** — `constants.ts` (`ChainId`, …), `utils.ts`, `errors.ts`, and the `index.ts` barrel.

Heavier concerns live elsewhere by design: **routing/swapping** in the API, and **on-chain tracking** in `@symbiosis/sdk-tracker`.
