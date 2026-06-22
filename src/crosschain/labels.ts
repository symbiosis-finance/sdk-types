/**
 * Real type copied from js-sdk/src/crosschain/labels.ts.
 * Pure string-union type — zero web3 imports.
 */
export type SwapLabel =
    | 'src-chain-swap'
    | 'octopool-swap'
    | 'dst-chain-swap'
    | 'mixed-value-tokens'
    | 'partner-swap'
    | 'semi-centralized'
    | 'intent'
