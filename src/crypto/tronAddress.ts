import bs58check from 'bs58check'

const ADDRESS_PREFIX_REGEX = /^(41)/

/**
 * Convert a TRON address (base58check or 41-hex) to a lowercase 0x EVM address.
 * Mirrors `TronWeb.address.toHex(address).replace(/^(41)/, '0x')`.
 * If the address is already a 0x EVM address, returns it unchanged (mirrors original TronWeb try/catch fallback).
 * An empty string (native-gas sentinel) is returned as-is.
 *
 * Uses bs58check.decode() which verifies the double-SHA256 checksum and throws on any
 * mismatch — preventing silent misrouting of funds to a wrong EVM address.
 */
export function tronAddressToEvm(address: string): string {
  // Native gas token sentinel — TRON gas tokens use address '' (no on-chain contract address)
  if (address === '') {
    return address
  }
  // Already a 0x EVM address — return as-is (mirrors original TronWeb try/catch fallback)
  if (/^0x[0-9a-fA-F]{40}$/i.test(address)) {
    return address
  }
  let hex: string
  if (/^41[0-9a-fA-F]{40}$/.test(address)) {
    hex = address.toLowerCase()
  } else {
    // bs58check.decode() strips the 4-byte checksum AND verifies it via sha256(sha256(payload)).
    // Throws if the checksum is wrong or the input is not valid base58check.
    // A valid TRON address decodes to exactly 21 bytes (0x41 version byte + 20-byte address).
    const payload = bs58check.decode(address)
    if (payload.length !== 21) {
      throw new Error(
        `tronAddressToEvm: invalid decoded length ${payload.length} (expected 21)`
      )
    }
    hex = Buffer.from(payload).toString('hex')
  }
  return hex.replace(ADDRESS_PREFIX_REGEX, '0x')
}
