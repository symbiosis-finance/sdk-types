import { ChainId } from '../constants'

export const RECIPIENT_ADDRESS_PATTERNS: Partial<Record<ChainId, RegExp>> = {
    // Monero mainnet: 95 chars (standard) or 106 chars (integrated, +11 trailing).
    // Prefix [48][0-9AB] reflects the network-byte encoding for primary/subaddress.
    [ChainId.XMR_MAINNET]:
        /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}(?:[1-9A-HJ-NP-Za-km-z]{11})?$/,

    // Litecoin: legacy (L/M prefix), bech32 (ltc1)
    [ChainId.LTC_MAINNET]:
        /^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$|^ltc1[a-z0-9]{25,90}$/,

    // XRP Ledger: starts with r, 24-34 base58 chars
    [ChainId.XRP_MAINNET]: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,

    // Stellar: 56 chars starting with G (public key)
    [ChainId.XLM_MAINNET]: /^G[A-Z2-7]{55}$/,

    // Cardano: Shelley addr1 (bech32), Byron Ae2 (base58)
    [ChainId.ADA_MAINNET]:
        /^addr1[a-z0-9]{50,110}$|^Ae2[1-9A-HJ-NP-Za-km-z]{50,120}$/,

    // Bitcoin Cash: legacy (1/3 prefix) or CashAddr (q/p prefix), after an optional `bitcoincash:` in any case.
    [ChainId.BCH_MAINNET]:
        /^(?:[bB][iI][tT][cC][oO][iI][nN][cC][aA][sS][hH]:)?(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|[qp][a-z0-9]{41,120})$/,

    // Dogecoin: starts with D, 34 base58 chars
    [ChainId.DOGE_MAINNET]: /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/,

    // SUI: 66 chars hex with 0x prefix
    [ChainId.SUI_MAINNET]: /^0x[a-fA-F0-9]{64}$/,

    // Canton (CC): participant::hex format (e.g. name-1::1220abcd...)
    [ChainId.CANTON_MAINNET]: /^.+::[a-fA-F0-9]{40,}$/,

    // Zcash: transparent t1/t3 (35 base58), Sapling shielded zs1 (bech32, 78 chars total), Sprout shielded zc (base58, ~95 chars)
    [ChainId.ZCASH_MAINNET]:
        /^t[13][1-9A-HJ-NP-Za-km-z]{33}$|^zs1[a-z0-9]{75}$|^zc[1-9A-HJ-NP-Za-km-z]{93}$/,
}

/**
 * Checks whether `address` has the address format of the chain `chainId`, or, on a chain with no known format, whether
 * it is not empty. It checks the format only, not a checksum (svc-symbiosis-api task rdyrn, State).
 */
export function isValidRecipientAddress(chainId: ChainId, address: string): boolean {
    const pattern = RECIPIENT_ADDRESS_PATTERNS[chainId]
    return pattern ? pattern.test(address) : address.length > 0
}

/**
 * @deprecated Parse the address where it is sent onward instead (svc-symbiosis-api task rdyrn, State). Returns
 * the address without its `bitcoincash:` prefix on Bitcoin Cash, and unchanged on other chains.
 */
export function normalizeRecipientAddress(chainId: ChainId, address: string): string {
    return chainId === ChainId.BCH_MAINNET ? address.replace(/^bitcoincash:/i, '') : address
}
