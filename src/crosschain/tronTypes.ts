export interface TronTransactionData {
    chain_id: number
    call_value: number | string
    contract_address: string
    fee_limit: number
    function_selector: string
    owner_address: string
    raw_parameter: string
}
