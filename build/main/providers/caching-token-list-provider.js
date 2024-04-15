"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingTokenListProvider = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const sdk_core_1 = require("@jaguarswap/sdk-core");
const axios_1 = __importDefault(require("axios"));
const log_1 = require("../util/log");
const metric_1 = require("../util/metric");
class CachingTokenListProvider {
    /**
     * Creates an instance of CachingTokenListProvider.
     * Token metadata (e.g. symbol and decimals) generally don't change so can be cached indefinitely.
     *
     * @param chainId The chain id to use.
     * @param tokenList The token list to get the tokens from.
     * @param tokenCache Cache instance to hold cached tokens.
     */
    constructor(chainId, tokenList, tokenCache) {
        this.tokenCache = tokenCache;
        this.CACHE_KEY = (tokenInfo) => `token-list-token-${this.chainId}/${this.tokenList.name}/${this.tokenList.timestamp}/${this.tokenList.version}/${tokenInfo.address.toLowerCase()}/${tokenInfo.decimals}/${tokenInfo.symbol}/${tokenInfo.name}`;
        this.CHAIN_SYMBOL_KEY = (chainId, symbol) => `${chainId.toString()}/${symbol}`;
        this.CHAIN_ADDRESS_KEY = (chainId, address) => `${chainId.toString()}/${address.toLowerCase()}`;
        this.chainId = chainId;
        this.tokenList = tokenList;
        this.chainToTokenInfos = new Map();
        this.chainSymbolToTokenInfo = new Map();
        this.chainAddressToTokenInfo = new Map();
        for (const tokenInfo of this.tokenList.tokens) {
            const chainId = tokenInfo.chainId;
            const chainIdString = chainId.toString();
            const symbol = tokenInfo.symbol;
            const address = tokenInfo.address.toLowerCase();
            if (!this.chainToTokenInfos.has(chainIdString)) {
                this.chainToTokenInfos.set(chainIdString, []);
            }
            this.chainToTokenInfos.get(chainIdString).push(tokenInfo);
            this.chainSymbolToTokenInfo.set(this.CHAIN_SYMBOL_KEY(chainId, symbol), tokenInfo);
            this.chainAddressToTokenInfo.set(this.CHAIN_ADDRESS_KEY(chainId, address), tokenInfo);
        }
    }
    static async fromTokenListURI(chainId, tokenListURI, tokenCache) {
        const now = Date.now();
        const tokenList = await this.buildTokenList(tokenListURI);
        metric_1.metric.putMetric('TokenListLoad', Date.now() - now, metric_1.MetricLoggerUnit.Milliseconds);
        return new CachingTokenListProvider(chainId, tokenList, tokenCache);
    }
    static async buildTokenList(tokenListURI) {
        log_1.log.info(`Getting tokenList from ${tokenListURI}.`);
        const response = await axios_1.default.get(tokenListURI);
        log_1.log.info(`Got tokenList from ${tokenListURI}.`);
        const { data: tokenList, status } = response;
        if (status != 200) {
            log_1.log.error({ response }, `Unabled to get token list from ${tokenListURI}.`);
            throw new Error(`Unable to get token list from ${tokenListURI}`);
        }
        return tokenList;
    }
    static async fromTokenList(chainId, tokenList, tokenCache) {
        const now = Date.now();
        const tokenProvider = new CachingTokenListProvider(chainId, tokenList, tokenCache);
        metric_1.metric.putMetric('TokenListLoad', Date.now() - now, metric_1.MetricLoggerUnit.Milliseconds);
        return tokenProvider;
    }
    /**
     * If no addresses array is specified, all tokens in the token list are
     * returned.
     *
     * @param _addresses (optional) The token addresses to get.
     * @returns Promise<TokenAccessor> A token accessor with methods for accessing the tokens.
     */
    async getTokens(_addresses) {
        var _a;
        const addressToToken = new Map();
        const symbolToToken = new Map();
        const addToken = (token) => {
            if (!token)
                return;
            addressToToken.set(token.address.toLowerCase(), token);
            if (token.symbol !== undefined) {
                symbolToToken.set(token.symbol.toLowerCase(), token);
            }
        };
        if (_addresses) {
            for (const address of _addresses) {
                const token = await this.getTokenByAddress(address);
                addToken(token);
            }
        }
        else {
            const chainTokens = (_a = this.chainToTokenInfos.get(this.chainId.toString())) !== null && _a !== void 0 ? _a : [];
            for (const info of chainTokens) {
                const token = await this.buildToken(info);
                addToken(token);
            }
        }
        return {
            getTokenByAddress: (address) => addressToToken.get(address.toLowerCase()),
            getTokenBySymbol: (symbol) => symbolToToken.get(symbol.toLowerCase()),
            getAllTokens: () => {
                return Array.from(addressToToken.values());
            },
        };
    }
    async hasTokenBySymbol(_symbol) {
        return this.chainSymbolToTokenInfo.has(this.CHAIN_SYMBOL_KEY(this.chainId, _symbol));
    }
    async getTokenBySymbol(_symbol) {
        let symbol = _symbol;
        // We consider ETH as a regular ERC20 Token throughout this package. We don't use the NativeCurrency object from the sdk.
        // When we build the calldata for swapping we insert wrapping/unwrapping as needed.
        if (_symbol == 'ETH') {
            symbol = 'WETH';
        }
        const tokenInfo = this.chainSymbolToTokenInfo.get(this.CHAIN_SYMBOL_KEY(this.chainId, symbol));
        if (!tokenInfo) {
            return undefined;
        }
        const token = await this.buildToken(tokenInfo);
        return token;
    }
    async hasTokenByAddress(address) {
        return this.chainAddressToTokenInfo.has(this.CHAIN_ADDRESS_KEY(this.chainId, address));
    }
    async getTokenByAddress(address) {
        const tokenInfo = this.chainAddressToTokenInfo.get(this.CHAIN_ADDRESS_KEY(this.chainId, address));
        if (!tokenInfo) {
            return undefined;
        }
        const token = await this.buildToken(tokenInfo);
        return token;
    }
    async buildToken(tokenInfo) {
        const cacheKey = this.CACHE_KEY(tokenInfo);
        const cachedToken = await this.tokenCache.get(cacheKey);
        if (cachedToken) {
            return cachedToken;
        }
        const token = new sdk_core_1.Token(this.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name);
        await this.tokenCache.set(cacheKey, token);
        return token;
    }
}
exports.CachingTokenListProvider = CachingTokenListProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGluZy10b2tlbi1saXN0LXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9jYWNoaW5nLXRva2VuLWxpc3QtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsNkRBQTZEO0FBQzdELG1EQUFzRDtBQUV0RCxrREFBMEI7QUFFMUIscUNBQWtDO0FBQ2xDLDJDQUEwRDtBQXFCMUQsTUFBYSx3QkFBd0I7SUFnQm5DOzs7Ozs7O09BT0c7SUFDSCxZQUNFLE9BQXlCLEVBQ3pCLFNBQW9CLEVBQ1osVUFBeUI7UUFBekIsZUFBVSxHQUFWLFVBQVUsQ0FBZTtRQXpCM0IsY0FBUyxHQUFHLENBQUMsU0FBb0IsRUFBRSxFQUFFLENBQzNDLG9CQUFvQixJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FDMUUsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLFNBQVMsQ0FBQyxRQUMzRSxJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1FBUW5DLHFCQUFnQixHQUFHLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzNGLHNCQUFpQixHQUFHLENBQUMsT0FBZ0IsRUFBRSxPQUFlLEVBQUUsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO1FBZWxILElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBRTNCLElBQUksQ0FBQyxpQkFB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