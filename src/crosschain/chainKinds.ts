import type { ChainId } from '../constants'
import { getChainById } from '../entities/chainList'

/** @deprecated Use the chain's kind instead (`chain.kind === 'evm'`). */
export function isEvmChainId(chainId: ChainId | undefined): boolean {
    return getChainById(chainId)?.kind === 'evm'
}

/** @deprecated Use the chain's kind instead (`chain.kind === 'tron'`). */
export function isTronChainId(chainId: ChainId): boolean {
    return getChainById(chainId)?.kind === 'tron'
}

/** @deprecated Use the chain's kind instead (`chain.kind === 'btc'`). */
export function isBtcChainId(chainId: ChainId | undefined): boolean {
    return getChainById(chainId)?.kind === 'btc'
}

/** @deprecated Use the chain's kind instead (`chain.kind === 'ton'`). */
export function isTonChainId(chainId: ChainId | undefined): boolean {
    return getChainById(chainId)?.kind === 'ton'
}

/** @deprecated Use the chain's kind instead (`chain.kind === 'solana'`). */
export function isSolanaChainId(chainId: ChainId | undefined): boolean {
    return getChainById(chainId)?.kind === 'solana'
}

/** @deprecated Use the chain's kind instead (`chain.kind === 'quai'`). */
export function isQuaiChainId(chainId: ChainId | undefined): boolean {
    return getChainById(chainId)?.kind === 'quai'
}

/** @deprecated Use the chain's kind instead (`chain.kind === 'perp'`). */
export function isPerpChainId(chainId: ChainId | undefined): boolean {
    return getChainById(chainId)?.kind === 'perp'
}
