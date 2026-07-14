import { ChainId } from './constants'
import type { EvmAddress } from './crosschain/types'

// New on-chain swap/zap routers (gateway-only approve + call), replacing the legacy
// FeeCollector addresses. Approve and onswap both target `gateway`; the inner DEX swap
// is executed by `executor` (onchainExecutorDontApprove — users must NOT approve it).
// The on-chain Symbiosis fee is read from the gateway contract at runtime (see
// CrosschainTxBuilder.onchainRouterScheme), not hardcoded here. This is the with-fee router
// used for regular on-chain swaps; BTC on-chain zaps use the zero-fee companion map
// ONCHAIN_ZERO_FEE_SWAP_ROUTERS below.
export interface OnchainSwapRouter {
    gateway: EvmAddress
    executor: EvmAddress
}

export const ONCHAIN_SWAP_ROUTERS: Partial<Record<ChainId, OnchainSwapRouter>> = {
    [ChainId.TRON_MAINNET]: {
        gateway: '0x8328c7ca00c83b69503e56d80cec4934b6342e4a',
        executor: '0xa07e4f36a8d008302124f95d2e67c565d9c40bf9',
    },
    [ChainId.ZKSYNC_MAINNET]: {
        gateway: '0x9d8095d3A929400dc2312E37BD8211218108849D',
        executor: '0xE55967aa83b8A98A97ebD65910df600FC9077231',
    },
    [ChainId.CRONOS_ZK_MAINNET]: {
        gateway: '0xe56A26732212Df0c9e96d7954Af9c84A9442e98F',
        executor: '0xb2E547188BCF62D2f737353B9de0b81e3438321d',
    },
    [ChainId.ABSTRACT_MAINNET]: {
        gateway: '0x047951C40532Cb046863A8354a2a0099a3C977a6',
        executor: '0xC841AEb1204ec9E404E8bf0608537B9E00d68d06',
    },
    [ChainId.ZKLINK_MAINNET]: {
        gateway: '0x856686379CdD4672429dF5E4e419b5CCa726de0f',
        executor: '0xe8B9e5F19479994f7E0C55F64Dc81aa321568919',
    },
    [ChainId.QUAI_MAINNET]: {
        gateway: '0x005274c33887c66d638Cd6Fc33CCECD4cc40Fb50',
        executor: '0x005578951002C3EF5e1b924C66a68A2090Cd3E02',
    },
    [ChainId.GNOSIS_MAINNET]: {
        gateway: '0x7775b274f0C3fA919B756b22A4d9674e55927ab8',
        executor: '0xB52E582263c1d0189b3cc1402c1B7205b7F2E9Ba',
    },
    [ChainId.APECHAIN_MAINNET]: {
        gateway: '0x7775b274f0C3fA919B756b22A4d9674e55927ab8',
        executor: '0xB52E582263c1d0189b3cc1402c1B7205b7F2E9Ba',
    },
    [ChainId.ARBITRUM_MAINNET]: {
        gateway: '0xda5b1347D43C5b8BF4e334C0bB6f01D1F1070994',
        executor: '0xe9c797206beF455F4fFB2AEE4ff33bFBDC8B3de7',
    },
    [ChainId.ARBITRUM_NOVA]: {
        gateway: '0xEE981B2459331AD268cc63CE6167b446AF4161f8',
        executor: '0x999990F0ad5515278aBC4F30EDcc38F0bBAE7B85',
    },
    [ChainId.BSQUARED_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.BAHAMUT_MAINNET]: {
        gateway: '0x1edfec117d8a20F2720FA9a2d2dCea40fBD22Cfd',
        executor: '0x8FCB9cC59dE35Ca5B7214C1d5377C818F5B0B7c7',
    },
    [ChainId.BASE_MAINNET]: {
        gateway: '0x291A42bDFFe3754eb3C8B69b4D232Fa1d4a46608',
        executor: '0xC1080e58486168Da85F2c94d78fed902897d734f',
    },
    [ChainId.BERACHAIN_MAINNET]: {
        gateway: '0xF8504d2ca2F0bbAD9d36927e3d32E278AbAdaDa0',
        executor: '0xfbE324361c9b8e617610d3991813D7D566721988',
    },
    [ChainId.BLAST_MAINNET]: {
        gateway: '0xc17d768Bf4FdC6f20a4A0d8Be8767840D106D077',
        executor: '0xF98b660AdF2ed7d9d9D9dAACC2fb0CAce4F21835',
    },
    [ChainId.BOBA_MAINNET]: {
        gateway: '0x7f6fb9f3ce785F3d85772c038Fda58eC9432D421',
        executor: '0x25aD14e36F3f10080107212504A5Da60294Ecc4B',
    },
    [ChainId.BSC_MAINNET]: {
        gateway: '0xf97fd9feEe8afFDbaeCE1dF54341537460D2E24d',
        executor: '0xC08B4c7513e9d8A941D2461fBD52ea034c7deC42',
    },
    [ChainId.CITREA_MAINNET]: {
        gateway: '0x17efC1d70eA32eb04c6979c6500d12eEE9e3Dcbd',
        executor: '0x04A1F3030A2fc5ECe3227567e98b20ef2241820c',
    },
    [ChainId.CORE_MAINNET]: {
        gateway: '0xc17d768Bf4FdC6f20a4A0d8Be8767840D106D077',
        executor: '0xF98b660AdF2ed7d9d9D9dAACC2fb0CAce4F21835',
    },
    [ChainId.CRONOS_MAINNET]: {
        gateway: '0xc17d768Bf4FdC6f20a4A0d8Be8767840D106D077',
        executor: '0xF98b660AdF2ed7d9d9D9dAACC2fb0CAce4F21835',
    },
    [ChainId.FRAXTAL_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.GRAVITY_MAINNET]: {
        gateway: '0xDA1C70C902746996A8C989bB07AA6C408Ef880D8',
        executor: '0xfdD61c0CF946a775E6cD572Ffb7b686a70f44039',
    },
    [ChainId.HYPEREVM_MAINNET]: {
        gateway: '0xDA1C70C902746996A8C989bB07AA6C408Ef880D8',
        executor: '0xfdD61c0CF946a775E6cD572Ffb7b686a70f44039',
    },
    [ChainId.KATANA_MAINNET]: {
        gateway: '0x6B1bbd301782FF636601fC594Cd7Bfe74871bfaA',
        executor: '0x210941a9fe976Ac0985aDC619EA7fA89B29a025D',
    },
    [ChainId.KAVA_MAINNET]: {
        gateway: '0xEE981B2459331AD268cc63CE6167b446AF4161f8',
        executor: '0x999990F0ad5515278aBC4F30EDcc38F0bBAE7B85',
    },
    [ChainId.LINEA_MAINNET]: {
        gateway: '0x70A16EB2B39A5573A8138b18582111bBA480fb8F',
        executor: '0xb2074C16910115aFC623e16707E9C2A6eBD8632a',
    },
    [ChainId.MANTA_MAINNET]: {
        gateway: '0x086488E659253FF26D0C743325C059FB57Ca7934',
        executor: '0xd471fE552e35904a5F74EA0fA1ef266eA8f3A4E3',
    },
    [ChainId.MANTLE_MAINNET]: {
        gateway: '0x086488E659253FF26D0C743325C059FB57Ca7934',
        executor: '0xd471fE552e35904a5F74EA0fA1ef266eA8f3A4E3',
    },
    [ChainId.MERLIN_MAINNET]: {
        gateway: '0x1ac4C50080871D7a24DD705dE9eFe5FF14bC0Ea2',
        executor: '0x3fD0ab1c6cCFE500C0d72168c8cE05dBa3aa5d9a',
    },
    [ChainId.METIS_MAINNET]: {
        gateway: '0xc17d768Bf4FdC6f20a4A0d8Be8767840D106D077',
        executor: '0xF98b660AdF2ed7d9d9D9dAACC2fb0CAce4F21835',
    },
    [ChainId.MODE_MAINNET]: {
        gateway: '0xc17d768Bf4FdC6f20a4A0d8Be8767840D106D077',
        executor: '0xF98b660AdF2ed7d9d9D9dAACC2fb0CAce4F21835',
    },
    [ChainId.MONAD_MAINNET]: {
        gateway: '0xBbAD2fe9558e55EbfA04b3B5Bff0b6c4E2ffDD2C',
        executor: '0xDA411E3b9047AE198DfB7448E97Ca900FE793035',
    },
    [ChainId.MORPH_MAINNET]: {
        gateway: '0xF8504d2ca2F0bbAD9d36927e3d32E278AbAdaDa0',
        executor: '0xfbE324361c9b8e617610d3991813D7D566721988',
    },
    [ChainId.OPBNB_MAINNET]: {
        gateway: '0x1ac4C50080871D7a24DD705dE9eFe5FF14bC0Ea2',
        executor: '0x3fD0ab1c6cCFE500C0d72168c8cE05dBa3aa5d9a',
    },
    [ChainId.OPTIMISM_MAINNET]: {
        gateway: '0xca506793A420E901BbCa8066be5661E3C52c84c2',
        executor: '0xd92Ca299F1C2518E78E48C207b64591BA6E9b9a8',
    },
    [ChainId.PLASMA_MAINNET]: {
        gateway: '0xA738e84fdE890Bc60b99AF7ccE43990E534304de',
        executor: '0x5074b7cA7162F793318B65D8BeCC5975DF327C80',
    },
    [ChainId.MATIC_MAINNET]: {
        gateway: '0xa1262496e84a9663b7AB64ed96C152A23d0B7214',
        executor: '0x2dD8060ceE133bD53e5F1B3437Ff34DA706E7443',
    },
    [ChainId.RSK_MAINNET]: {
        gateway: '0xb657f823fd8c4B94901e78b75481D5b39D59ec61',
        executor: '0x11E90C3276601F4DF148Cd73563cA56bfD57d335',
    },
    [ChainId.SCROLL_MAINNET]: {
        gateway: '0xF951789c6A356BfbC3033648AA10b5Dd3e9d88C0',
        executor: '0x5D025432bCBe100354b5fb7b1A68D1641e677F6C',
    },
    [ChainId.SEI_EVM_MAINNET]: {
        gateway: '0x6B1bbd301782FF636601fC594Cd7Bfe74871bfaA',
        executor: '0x210941a9fe976Ac0985aDC619EA7fA89B29a025D',
    },
    [ChainId.SONEIUM_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.SONIC_MAINNET]: {
        gateway: '0xc17d768Bf4FdC6f20a4A0d8Be8767840D106D077',
        executor: '0xF98b660AdF2ed7d9d9D9dAACC2fb0CAce4F21835',
    },
    [ChainId.TAIKO_MAINNET]: {
        gateway: '0xc17d768Bf4FdC6f20a4A0d8Be8767840D106D077',
        executor: '0xF98b660AdF2ed7d9d9D9dAACC2fb0CAce4F21835',
    },
    [ChainId.TELOS_MAINNET]: {
        gateway: '0x7f6fb9f3ce785F3d85772c038Fda58eC9432D421',
        executor: '0x25aD14e36F3f10080107212504A5Da60294Ecc4B',
    },
    [ChainId.ZETACHAIN_MAINNET]: {
        gateway: '0x086488E659253FF26D0C743325C059FB57Ca7934',
        executor: '0xd471fE552e35904a5F74EA0fA1ef266eA8f3A4E3',
    },
    [ChainId.UNICHAIN_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.ETH_MAINNET]: {
        gateway: '0xE7e68D336F90f98D22A479253eafA5f2424aCaD8',
        executor: '0x7C84fC7b4EebdFE96339Fd89eF5eeA24cECf20b9',
    },
    [ChainId.AVAX_MAINNET]: {
        gateway: '0x844e4a0ade23b1BA5642A8d0010E42aE4434Df30',
        executor: '0x43a5f731FDECfB37Ac25307ed275a41fF52820e7',
    },
    [ChainId.ROBINHOOD_MAINNET]: {
        gateway: '0x6AEb9b27590387b8Fd0560C52f6B968C59C10Fab',
        executor: '0x145878e7527a442549eD2c8434B0477C676824fa',
    },
}

export function getOnchainSwapRouter(
    chainId: ChainId
): OnchainSwapRouter | undefined {
    return ONCHAIN_SWAP_ROUTERS[chainId]
}

// Zero-fee on-chain routers used for on-chain zaps into Bitcoin (the Symbiosis on-chain fee
// is waived there). Same gateway-only scheme as ONCHAIN_SWAP_ROUTERS. Only a few chains ship
// one; callers fall back to the with-fee router above when a chain is missing here.
export const ONCHAIN_ZERO_FEE_SWAP_ROUTERS: Partial<
    Record<ChainId, OnchainSwapRouter>
> = {
    [ChainId.BSC_MAINNET]: {
        gateway: '0x57dBCB192fA64bf07Eab76941D1daE5177c8f4f3',
        executor: '0x74e034487ad43B9386114C54Ed057a89de437395',
    },
    [ChainId.CITREA_MAINNET]: {
        gateway: '0x17efC1d70eA32eb04c6979c6500d12eEE9e3Dcbd',
        executor: '0x04A1F3030A2fc5ECe3227567e98b20ef2241820c',
    },
    [ChainId.RSK_MAINNET]: {
        gateway: '0x8dc3151dCcd58FCB6a0beC0dF20C06FBa133F027',
        executor: '0x82aAF7382B9E87160DA9e7bD5a9829E49BA98E96',
    },
    [ChainId.ETH_MAINNET]: {
        gateway: '0x4E73aF5663c997A796FF2cc1AD8C5d406541b4F2',
        executor: '0xE985e7d7b04eb55c9f20494f0c11165664407F7F',
    },
}

// On-chain zaps into Bitcoin prefer the zero-fee router; callers fall back to
// getOnchainSwapRouter when a chain has no zero-fee deployment.
export function getOnchainZeroFeeSwapRouter(
    chainId: ChainId
): OnchainSwapRouter | undefined {
    return ONCHAIN_ZERO_FEE_SWAP_ROUTERS[chainId]
}

// ---- Legacy on-chain routers (old FeeCollector scheme) ----
// Partners that whitelisted our old FeeCollector contracts in their own contracts must keep
// using them (selected via CrosschainTxBuilder.usesLegacyRouter — the same partner set as
// the legacy metaRouter scheme). Everyone else uses the new gateway routers above. For legacy
// partners the fee and onchainGateway are read from the contract at runtime (not from config).
export const LEGACY_ZERO_FEE_COLLECTOR_ADDRESSES: Partial<
    Record<ChainId, EvmAddress>
> = {
    [ChainId.ZKSYNC_MAINNET]: '0x35e3dc1f3383bD348EC651EdD73fE1d7a7dA5AAa',
    [ChainId.BSC_MAINNET]: '0x628613064b1902a1A422825cf11B687C6f17961E',
    [ChainId.RSK_MAINNET]: '0xa257f3fe4e4032291516dc355edf90664e9eb932',
    [ChainId.CITREA_MAINNET]: '0x45CFd6FB7999328F189aaD2739Fba4Be6C45E5bf',
    [ChainId.ETH_MAINNET]: '0x92114294E42A96C9eF3163DA18Ee7eFdbA6cc661',
}

export const LEGACY_FEE_COLLECTOR_ADDRESSES: Partial<
    Record<ChainId, EvmAddress>
> = {
    [ChainId.ETH_MAINNET]: '0xff9b21c3bfa4bce9b20b55fed56d102ced48b0f6',
    [ChainId.BSC_MAINNET]: '0x0425841529882628880fBD228AC90606e0c2e09A',
    [ChainId.AVAX_MAINNET]: '0xA257F3FE4E4032291516DC355eDF90664e9eB932',
    [ChainId.MATIC_MAINNET]: '0x9d74807B8fA79d49bb95CF988Af3c25Fb1437B4f',
    [ChainId.MANTLE_MAINNET]: '0x7B4E28E7273aA8CB64C56fF191ebF43b64f409F9',
    [ChainId.LINEA_MAINNET]: '0x0f91052dc5B4baE53d0FeA5DAe561A117268f5d2',
    [ChainId.POLYGON_ZK]: '0xB79A4F5828eb55c10D7abF4bFe9a9f5d11aA84e0',
    [ChainId.BASE_MAINNET]: '0xF951789c6A356BfbC3033648AA10b5Dd3e9d88C0',
    [ChainId.ARBITRUM_MAINNET]: '0x4FDA0599b78a49d289577a8DF2046459abC04d82',
    [ChainId.ARBITRUM_NOVA]: '0x7B4E28E7273aA8CB64C56fF191ebF43b64f409F9',
    [ChainId.OPTIMISM_MAINNET]: '0x7775b274f0C3fA919B756b22A4d9674e55927ab8',
    [ChainId.TELOS_MAINNET]: '0xf02bBC9de6e443eFDf3FC41851529C2c3B9E5e0C',
    [ChainId.ZKSYNC_MAINNET]: '0x56C343E7cE75e53e58Ed2f3743C6f137c13D2013',
    [ChainId.BOBA_MAINNET]: '0xB79A4F5828eb55c10D7abF4bFe9a9f5d11aA84e0',
    [ChainId.KAVA_MAINNET]: '0xca506793A420E901BbCa8066be5661E3C52c84c2',
    [ChainId.TRON_MAINNET]: '0x5112ac3d77551b9f670eb34ef75984246164e38d',
    [ChainId.SCROLL_MAINNET]: '0xf02bBC9de6e443eFDf3FC41851529C2c3B9E5e0C',
    [ChainId.MANTA_MAINNET]: '0xf85FC807D05d3Ab2309364226970aAc57b4e1ea4',
    [ChainId.METIS_MAINNET]: '0x81aB74A9f9d7457fF47dfD102e78A340cF72EC39',
    [ChainId.BAHAMUT_MAINNET]: '0x70A16EB2B39A5573A8138b18582111bBA480fb8F',
    [ChainId.MODE_MAINNET]: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
    [ChainId.RSK_MAINNET]: '0x2b7aa8bdc40b6d3d19d0de7480c4db8d5b6495e2',
    [ChainId.BLAST_MAINNET]: '0xf1C374D065719Ce1Fdc63E2c5C13146813c0A83b',
    [ChainId.MERLIN_MAINNET]: '0x1a039cE63AE35a67Bf0E9F6DbFaE969639D59eC8',
    [ChainId.ZKLINK_MAINNET]: '0x9C64162e1614E10f833aFc2a0BdF173324f36Dd5',
    [ChainId.CORE_MAINNET]: '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
    [ChainId.TAIKO_MAINNET]: '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
    [ChainId.SEI_EVM_MAINNET]: '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
    [ChainId.ZETACHAIN_MAINNET]: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
    [ChainId.CRONOS_MAINNET]: '0x1a039cE63AE35a67Bf0E9F6DbFaE969639D59eC8',
    [ChainId.FRAXTAL_MAINNET]: '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
    [ChainId.GRAVITY_MAINNET]: '0x6AEb9b27590387b8Fd0560C52f6B968C59C10Fab',
    [ChainId.BSQUARED_MAINNET]: '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
    [ChainId.CRONOS_ZK_MAINNET]: '0xBf63C7944B1635c79a0f0eE7e07b1702837AD1F9',
    [ChainId.MORPH_MAINNET]: '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
    [ChainId.SONIC_MAINNET]: '0x1cEaeda3D17936916D0F3E866Aa5Ef861F544840',
    [ChainId.ABSTRACT_MAINNET]: '0x9C64162e1614E10f833aFc2a0BdF173324f36Dd5',
    [ChainId.GNOSIS_MAINNET]: '0xf1C374D065719Ce1Fdc63E2c5C13146813c0A83b',
    [ChainId.BERACHAIN_MAINNET]: '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
    [ChainId.UNICHAIN_MAINNET]: '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
    [ChainId.SONEIUM_MAINNET]: '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
    [ChainId.OPBNB_MAINNET]: '0x1cEaeda3D17936916D0F3E866Aa5Ef861F544840',
    [ChainId.HYPEREVM_MAINNET]: '0x6AEb9b27590387b8Fd0560C52f6B968C59C10Fab',
    [ChainId.KATANA_MAINNET]: '0xf1C374D065719Ce1Fdc63E2c5C13146813c0A83b',
    [ChainId.APECHAIN_MAINNET]: '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
    [ChainId.PLASMA_MAINNET]: '0x6AEb9b27590387b8Fd0560C52f6B968C59C10Fab',
    [ChainId.MONAD_MAINNET]: '0x6AEb9b27590387b8Fd0560C52f6B968C59C10Fab',
    [ChainId.CITREA_MAINNET]: '0x45CFd6FB7999328F189aaD2739Fba4Be6C45E5bf', // TODO change to a fee collector with non-zero fee
    [ChainId.QUAI_MAINNET]: '0x002552D322dDACe745FC143A2f838769da92AFc0',
}

// Legacy FeeCollector address for a chain (with-fee by default, zero-fee variant for BTC
// on-chain zaps). Returns undefined when the chain has no legacy deployment.
export function getLegacyFeeCollector(
    chainId: ChainId,
    zeroFee = false
): EvmAddress | undefined {
    return zeroFee
        ? LEGACY_ZERO_FEE_COLLECTOR_ADDRESSES[chainId]
        : LEGACY_FEE_COLLECTOR_ADDRESSES[chainId]
}
