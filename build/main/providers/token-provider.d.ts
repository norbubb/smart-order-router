import { ChainId, Token } from '@jaguarswap/sdk-core';
import { IMulticallProvider } from './multicall-provider';
import { ProviderConfig } from './provider';
/**
 * Provider for getting token data.
 *
 * @export
 * @interface ITokenProvider
 */
export interface ITokenProvider {
    /**
     * Gets the token at each address. Any addresses that are not valid ERC-20 are ignored.
     *
     * @param addresses The token addresses to get.
     * @param [providerConfig] The provider config.
     * @returns A token accessor with methods for accessing the tokens.
     */
    getTokens(addresses: string[], providerConfig?: ProviderConfig): Promise<TokenAccessor>;
}
export declare type TokenAccessor = {
    getTokenByAddress(address: string): Token | undefined;
    getTokenBySymbol(symbol: string): Token | undefined;
    getAllTokens: () => Token[];
};
export declare const USDC_X1: Token;
export declare const USDC_X1_TESTNET: Token;
export declare const USDT_X1: Token;
export declare const USDT_X1_TESTNET: Token;
export declare const WBTC_X1: Token;
export declare const DAI_X1: Token;
export declare const DAI_X1_TESTNET: Token;
export declare const FEI_X1: Token;
export declare const UNI_X1: Token;
export declare class TokenProvider implements ITokenProvider {
    private chainId;
    protected multicall2Provider: IMulticallProvider;
    constructor(chainId: ChainId, multicall2Provider: IMulticallProvider);
    private getTokenSymbol;
    private getTokenDecimals;
    getTokens(_addresses: string[], providerConfig?: ProviderConfig): Promise<TokenAccessor>;
}
export declare const DAI_ON: (chainId: ChainId) => Token;
export declare const USDT_ON: (chainId: ChainId) => Token;
export declare const USDC_ON: (chainId: ChainId) => Token;
export declare const WNATIVE_ON: (chainId: ChainId) => Token;
