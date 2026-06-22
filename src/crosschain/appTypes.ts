/**
 * Pure data types the app needs, extracted from web3-heavy js-sdk 3.11.60 files
 * (crosschain/symbiosis.ts, crosschain/revertRequest.ts, crosschain/waitForComplete/types.ts).
 * Only the symbols themselves are copied — none of their source files' web3 imports.
 */
import type { ChainId } from '../constants'
import type { TokenAmount } from '../entities'
import type { BtcConfig } from './types'

// --- from crosschain/symbiosis.ts ---
export interface DiscountTier {
    amount: string
    discount: number
}

// --- from crosschain/revertRequest.ts ---
export enum PendingRequestState {
    Default = 0,
    Sent,
    Reverted,
}

export type PendingRequestType = 'burn' | 'synthesize' | 'burn-v2' | 'burn-v2-revert' | 'synthesize-v2'

export interface PendingRequest {
    originalFromTokenAmount: TokenAmount
    fromTokenAmount: TokenAmount
    transactionHash: string
    state: PendingRequestState
    internalId: string
    externalId: string
    type: PendingRequestType
    from: string
    to: string
    revertableAddress: string
    chainIdFrom: ChainId
    chainIdTo: ChainId
    revertChainId: ChainId
}

export interface SourceChainData {
    fromAddress: string
    sourceChainId: ChainId
}

// --- from crosschain/waitForComplete/types.ts (fully pure module) ---
export type BridgeRequestType =
    | 'SynthesizeRequest'
    | 'BurnRequest'
    | 'RevertSynthesizeRequest'
    | 'RevertSynthesizeCompleted'
    | 'RevertBurnCompleted'

export interface BridgeTxInfo {
    internalId: string
    externalId: string
    externalChainId: ChainId
    requestType: BridgeRequestType
}

export interface BtcDepositAcceptedResult {
    commitTx: string
    btcConfig: BtcConfig
}

export interface WaitForCompleteResult {
    txHash: string
    chainId: ChainId
}
