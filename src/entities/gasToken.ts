import { chainTable } from './chainTable'

/** @deprecated Use the chain's `gasToken` (Chain) instead. */
export const GAS_TOKEN = chainTable((chain) => chain.gasToken)
