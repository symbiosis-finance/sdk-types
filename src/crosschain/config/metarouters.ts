import { ChainId } from '../../constants'
import type { Address } from '../types'

// New metaRouter deployment (gateway-only approve + call). For partners NOT on the
// legacy list, approve and metaRoute both target `gateway`, and inner DEX swaps are
// executed by `executor` (metaRouterExecutorDontApprove — users must NOT approve it).
// Kept out of ChainConfig so contract addresses live in one focused mapping.
// Source of truth: metarouters.json.
export interface ApprovableMetaRouter {
    gateway: Address
    executor: Address
}

const APPROVABLE_METAROUTERS: Partial<Record<ChainId, ApprovableMetaRouter>> = {
    [ChainId.ETH_MAINNET]: {
        gateway: '0xB4769e9c5bE31199a25ecD1B0C6609183fa72521',
        executor: '0xc227b3a439EE6ae3A22500757125f4dE91d8008E',
    },
    [ChainId.BSC_MAINNET]: {
        gateway: '0x851B43189de721dD94AbA767AAd9E6F6d6a95CCA',
        executor: '0x980447DdcEf79A7499Da4538Da8FC59BAcAD6997',
    },
    [ChainId.AVAX_MAINNET]: {
        gateway: '0xfeC09BE39F82b13471D2e0E7d72e6ee589c631c6',
        executor: '0x4494b8cBC69c794d82Bd2d820A6ff6f62D7D841A',
    },
    [ChainId.MATIC_MAINNET]: {
        gateway: '0x2eE9559387b806E88fd46b9DA160D64A29CE7Da0',
        executor: '0x7a73a0bA4919778C5442f026bd01795b4f2A4cB8',
    },
    [ChainId.TELOS_MAINNET]: {
        gateway: '0x17efC1d70eA32eb04c6979c6500d12eEE9e3Dcbd',
        executor: '0x04A1F3030A2fc5ECe3227567e98b20ef2241820c',
    },
    [ChainId.KAVA_MAINNET]: {
        gateway: '0x086488E659253FF26D0C743325C059FB57Ca7934',
        executor: '0xd471fE552e35904a5F74EA0fA1ef266eA8f3A4E3',
    },
    [ChainId.BOBA_MAINNET]: {
        gateway: '0x17efC1d70eA32eb04c6979c6500d12eEE9e3Dcbd',
        executor: '0x04A1F3030A2fc5ECe3227567e98b20ef2241820c',
    },
    [ChainId.SYMBIOSIS_MAINNET]: {
        gateway: '0x544a09004978fd184f32589FF8FB7cCda6b8F11F',
        executor: '0x98782169093795D8F9a93E445b98A90D42C88Aa3',
    },
    [ChainId.ZKSYNC_MAINNET]: {
        gateway: '0x87d4007a8a7e4897AB00a5390dAaF0b8bE199C84',
        executor: '0xD99AFDCed3c439814398E60e16EeDe2AD7091c1E',
    },
    [ChainId.ARBITRUM_MAINNET]: {
        gateway: '0x3743c756b64ECd0770f1d4f47696A73d2A46dcbe',
        executor: '0xf37E321e1c275d249B7A9c825aE802A9f464Eb94',
    },
    [ChainId.OPTIMISM_MAINNET]: {
        gateway: '0xA9A96Ee51dD54B9f51d46b1fbD2A19c1295Ec75b',
        executor: '0x356d322BF762d4022D8c241428770565f236c2EA',
    },
    [ChainId.ARBITRUM_NOVA]: {
        gateway: '0x086488E659253FF26D0C743325C059FB57Ca7934',
        executor: '0xd471fE552e35904a5F74EA0fA1ef266eA8f3A4E3',
    },
    [ChainId.LINEA_MAINNET]: {
        gateway: '0xEbD15fCa7aB58470C40653ecB60f10fa08322F67',
        executor: '0x1E49c61Be437D181b723Cdac52aAeeD2bb864E41',
    },
    [ChainId.MANTLE_MAINNET]: {
        gateway: '0x8097f0B9f06C27AF9579F75762F971D745bb222F',
        executor: '0x4949e74094D6F9C06D68e5Ffe388f6542C4b1A34',
    },
    [ChainId.BASE_MAINNET]: {
        gateway: '0xa18348e793E77239EC68CAa51b74c5Cdc82c8a9d',
        executor: '0xCbFD5DcaD860f49D0BD2fDaD78d9d943CAeBedef',
    },
    [ChainId.TRON_MAINNET]: {
        gateway: '0x98e1df4e3200e1001610365e2eb133a953bbe3e0',
        executor: '0xd076ab0d4b74aef1aec7b1d4f106787e0d5f9163',
    },
    [ChainId.SCROLL_MAINNET]: {
        gateway: '0x3338BE49A5f60e2593337919F9aD7098e9a7Dd7E',
        executor: '0x50655203a736E49bdeeCD4b085A66eF54085D417',
    },
    [ChainId.MANTA_MAINNET]: {
        gateway: '0x8097f0B9f06C27AF9579F75762F971D745bb222F',
        executor: '0x4949e74094D6F9C06D68e5Ffe388f6542C4b1A34',
    },
    [ChainId.METIS_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.BAHAMUT_MAINNET]: {
        gateway: '0xAa444c22297b0dBd97bBf316dC0b7C64b33aa64C',
        executor: '0xE9F5143AA6ad4190DB08573E5659D29c70BC39c5',
    },
    [ChainId.MODE_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.RSK_MAINNET]: {
        gateway: '0x7f6fb9f3ce785F3d85772c038Fda58eC9432D421',
        executor: '0xcf7aDFc571C4Ca41726F33F3582A845b7c64c632',
    },
    [ChainId.BLAST_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.MERLIN_MAINNET]: {
        gateway: '0xDA1C70C902746996A8C989bB07AA6C408Ef880D8',
        executor: '0xfdD61c0CF946a775E6cD572Ffb7b686a70f44039',
    },
    [ChainId.ZKLINK_MAINNET]: {
        gateway: '0xe7B6a9a1E85215a2b7109A1d724C57e8C835b9D6',
        executor: '0x82F17Cc9CaB98197A2CDFE343f22D7295FbF7633',
    },
    [ChainId.CORE_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.TAIKO_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.SEI_EVM_MAINNET]: {
        gateway: '0xA738e84fdE890Bc60b99AF7ccE43990E534304de',
        executor: '0x5074b7cA7162F793318B65D8BeCC5975DF327C80',
    },
    [ChainId.ZETACHAIN_MAINNET]: {
        gateway: '0x8097f0B9f06C27AF9579F75762F971D745bb222F',
        executor: '0x4949e74094D6F9C06D68e5Ffe388f6542C4b1A34',
    },
    [ChainId.CRONOS_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.FRAXTAL_MAINNET]: {
        gateway: '0xf39D9A9ABb98593ceaC395D7A37c572Da48fCfD5',
        executor: '0x219454f4Bd263e36F05A07d3C1A7ABa82F4454CD',
    },
    [ChainId.GRAVITY_MAINNET]: {
        gateway: '0xF8504d2ca2F0bbAD9d36927e3d32E278AbAdaDa0',
        executor: '0xfbE324361c9b8e617610d3991813D7D566721988',
    },
    [ChainId.BSQUARED_MAINNET]: {
        gateway: '0xf85FC807D05d3Ab2309364226970aAc57b4e1ea4',
        executor: '0xcd7C056b39DdFB568E451923ABEDb9B6a7Aeb885',
    },
    [ChainId.CRONOS_ZK_MAINNET]: {
        gateway: '0x9C64162e1614E10f833aFc2a0BdF173324f36Dd5',
        executor: '0x86d00565879e7Bb35bCe3664D90F9856c9456fF7',
    },
    [ChainId.MORPH_MAINNET]: {
        gateway: '0x5B1baB64961cF72822817Ef32950fF7FCaB28b62',
        executor: '0x4870a76443945006ADDe4518254B0d6fC3f72721',
    },
    [ChainId.GOAT_MAINNET]: {
        gateway: '0x5B1baB64961cF72822817Ef32950fF7FCaB28b62',
        executor: '0x4870a76443945006ADDe4518254B0d6fC3f72721',
    },
    [ChainId.SONIC_MAINNET]: {
        gateway: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
        executor: '0x1363be92D1FA1915b501a8dd25D62d40a13DF99E',
    },
    [ChainId.ABSTRACT_MAINNET]: {
        gateway: '0xe56A26732212Df0c9e96d7954Af9c84A9442e98F',
        executor: '0xb2E547188BCF62D2f737353B9de0b81e3438321d',
    },
    [ChainId.GNOSIS_MAINNET]: {
        gateway: '0xf85FC807D05d3Ab2309364226970aAc57b4e1ea4',
        executor: '0xcd7C056b39DdFB568E451923ABEDb9B6a7Aeb885',
    },
    [ChainId.BERACHAIN_MAINNET]: {
        gateway: '0x5B1baB64961cF72822817Ef32950fF7FCaB28b62',
        executor: '0x4870a76443945006ADDe4518254B0d6fC3f72721',
    },
    [ChainId.UNICHAIN_MAINNET]: {
        gateway: '0xf39D9A9ABb98593ceaC395D7A37c572Da48fCfD5',
        executor: '0x219454f4Bd263e36F05A07d3C1A7ABa82F4454CD',
    },
    [ChainId.SONEIUM_MAINNET]: {
        gateway: '0xf39D9A9ABb98593ceaC395D7A37c572Da48fCfD5',
        executor: '0x219454f4Bd263e36F05A07d3C1A7ABa82F4454CD',
    },
    [ChainId.OPBNB_MAINNET]: {
        gateway: '0x6B1bbd301782FF636601fC594Cd7Bfe74871bfaA',
        executor: '0x210941a9fe976Ac0985aDC619EA7fA89B29a025D',
    },
    [ChainId.HYPEREVM_MAINNET]: {
        gateway: '0xA738e84fdE890Bc60b99AF7ccE43990E534304de',
        executor: '0x5074b7cA7162F793318B65D8BeCC5975DF327C80',
    },
    [ChainId.KATANA_MAINNET]: {
        gateway: '0xA738e84fdE890Bc60b99AF7ccE43990E534304de',
        executor: '0x5074b7cA7162F793318B65D8BeCC5975DF327C80',
    },
    [ChainId.APECHAIN_MAINNET]: {
        gateway: '0xf85FC807D05d3Ab2309364226970aAc57b4e1ea4',
        executor: '0xcd7C056b39DdFB568E451923ABEDb9B6a7Aeb885',
    },
    [ChainId.PLASMA_MAINNET]: {
        gateway: '0x45CFd6FB7999328F189aaD2739Fba4Be6C45E5bf',
        executor: '0xdfFF1eb1792277133c8471cCe94acB78D7f604ea',
    },
    [ChainId.MONAD_MAINNET]: {
        gateway: '0x81aB74A9f9d7457fF47dfD102e78A340cF72EC39',
        executor: '0x79d930aBe53dd56B66Ed43f8f6a7C6a1b84655cA',
    },
    [ChainId.CITREA_MAINNET]: {
        gateway: '0x6F0f6393e45fE0E7215906B6f9cfeFf53EA139cf',
        executor: '0x4cfA66497Fa84D739a0f785FBcEe9196f1C64e4a',
    },
    [ChainId.QUAI_MAINNET]: {
        gateway: '0x0008F51F17A6F4082b1f03B63Ba2f5fBeCFD432a',
        executor: '0x003b18b64E6770b562172B8aBcdd56B26D50171E',
    },
    [ChainId.TEMPO_MAINNET]: {
        gateway: '0x5B1baB64961cF72822817Ef32950fF7FCaB28b62',
        executor: '0x4870a76443945006ADDe4518254B0d6fC3f72721',
    },
}

export function getApprovableMetaRouter(chainId: ChainId): ApprovableMetaRouter | undefined {
    return APPROVABLE_METAROUTERS[chainId]
}
