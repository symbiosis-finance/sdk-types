export interface TronTransactionData {
    chain_id: number
    call_value: number | string
    contract_address: string
    fee_limit: number
    function_selector: string
    owner_address: string
    raw_parameter: string
    // Goes into raw_data.data, where THORChain reads it.
    memo?: string
    // How memo becomes raw_data.data bytes; absent means utf8.
    memoEncoding?: 'utf8' | 'hex'
    // Unix seconds; past it the vault may have churned.
    validUntil?: number
}
