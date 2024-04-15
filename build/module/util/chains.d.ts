import { ChainId, Ether, NativeCurrency, Token } from '@jaguarswap/sdk-core';
export declare const SUPPORTED_CHAINS: ChainId[];
export declare const V2_SUPPORTED: never[];
export declare const HAS_L1_FEE: never[];
export declare const NETWORKS_WITH_SAME_UNISWAP_ADDRESSES: ChainId[];
export declare const ID_TO_CHAIN_ID: (id: number) => ChainId;
export declare enum ChainName {
    X1 = "x1",
    X1_TESTNET = "x1-testnet"
}
export declare enum NativeCurrencyName {
    ETHER = "ETH",
    MATIC = "MATIC",
    CELO = "CELO",
    GNOSIS = "XDAI",
    MOONBEAM = "GLMR",
    BNB = "BNB",
    AVALANCHE = "AVAX",
    OKB = "OKB"
}
export declare const NATIVE_NAMES_BY_ID: {
    [chainId: number]: string[];
};
export declare const NATIVE_CURRENCY: {
    [chainId: number]: NativeCurrencyName;
};
export declare const ID_TO_NETWORK_NAME: (id: number) => ChainName;
export declare const CHAIN_IDS_LIST: string[];
export declare const ID_TO_PROVIDER: (id: ChainId) => string;
export declare const WRAPPED_NATIVE_CURRENCY: {
    [chainId in ChainId]: Token;
};
export declare class ExtendedEther extends Ether {
    get wrapped(): Token;
    private static _cachedExtendedEther;
    static onChain(chainId: number): ExtendedEther;
}
export declare function nativeOnChain(chainId: number): NativeCurrency;
