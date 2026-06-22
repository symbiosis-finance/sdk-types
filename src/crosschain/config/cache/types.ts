import type { TokenConstructor } from '../../../entities'
import type { OmniPoolConfig } from '../../types'

export type Id = number

export type TokenInfo = TokenConstructor & {
    id: Id
    originalId?: Id
}

export type OmniPoolToken = {
    index: number
    tokenId: Id
}

export type OmniPoolInfo = OmniPoolConfig & {
    id: Id
    tokens: OmniPoolToken[]
}

export type ConfigCacheData = {
    tokens: TokenInfo[]
    omniPools: OmniPoolInfo[]
}
