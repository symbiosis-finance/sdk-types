export interface TronTransactionData {
    chain_id: number
    call_value: number | string
    contract_address: string
    fee_limit: number
    function_selector: string
    owner_address: string
    raw_parameter: string
    // raw_data.data bytes as hex without 0x; THORChain and Chainflip read the
    // swap instruction from there.
    memo?: string
    // Unix seconds; past it the vault may have churned.
    validUntil?: number
}
