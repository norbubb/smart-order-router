import { Interface } from '@ethersproject/abi';
import { parseBytes32String } from '@ethersproject/strings';
import { ChainId, Token } from '@jaguarswap/sdk-core';
import _ from 'lodash';
import { IERC20Metadata__factory } from '../types/v3/factories/IERC20Metadata__factory';
import { log, WRAPPED_NATIVE_CURRENCY } from '../util';
// Some well knowne tokens on each chain for seeding cache / testing.
// FIXME: 替换成实际地址
export const USDC_X1 = new Token(ChainId.X1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C');
export const USDC_X1_TESTNET = new Token(ChainId.X1_TESTNET, '0x04292af1cf8687235a83766d55b307880fc5e76d', 18, 'USDC', 'USDC X1_TESTNET');
export const USDT_X1 = new Token(ChainId.X1, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD');
export const USDT_X1_TESTNET = new Token(ChainId.X1_TESTNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD');
export const WBTC_X1 = new Token(ChainId.X1, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC');
export const DAI_X1 = new Token(ChainId.X1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin');
export const DAI_X1_TESTNET = new Token(ChainId.X1_TESTNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin');
export const FEI_X1 = new Token(ChainId.X1, '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 18, 'FEI', 'Fei USD');
export const UNI_X1 = new Token(ChainId.X1, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', 18, 'UNI', 'Uniswap');
export class TokenProvider {
    constructor(chainId, multicall2Provider) {
        this.chainId = chainId;
        this.multicall2Provider = multicall2Provider;
    }
    async getTokenSymbol(addresses, providerConfig) {
        let result;
        let isBytes32 = false;
        try {
            result =
                await this.multicall2Provider.callSameFunctionOnMultipleContracts({
                    addresses,
                    contractInterface: IERC20Metadata__factory.createInterface(),
                    functionName: 'symbol',
                    providerConfig,
                });
        }
        catch (error) {
            log.error({ addresses }, `TokenProvider.getTokenSymbol[string] failed with error ${error}. Trying with bytes32.`);
            const bytes32Interface = new Interface([
                {
                    inputs: [],
                    name: 'symbol',
                    outputs: [
                        {
                            internalType: 'bytes32',
                            name: '',
                            type: 'bytes32',
                        },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                },
            ]);
            try {
                result =
                    await this.multicall2Provider.callSameFunctionOnMultipleContracts({
                        addresses,
                        contractInterface: bytes32Interface,
                        functionName: 'symbol',
                        providerConfig,
                    });
                isBytes32 = true;
            }
            catch (error) {
                log.fatal({ addresses }, `TokenProvider.getTokenSymbol[bytes32] failed with error ${error}.`);
                throw new Error('[TokenProvider.getTokenSymbol] Impossible to fetch token symbol.');
            }
        }
        return { result, isBytes32 };
    }
    async getTokenDecimals(addresses, providerConfig) {
        return this.multicall2Provider.callSameFunctionOnMultipleContracts({
            addresses,
            contractInterface: IERC20Metadata__factory.createInterface(),
            functionName: 'decimals',
            providerConfig,
        });
    }
    async getTokens(_addresses, providerConfig) {
        const addressToToken = {};
        const symbolToToken = {};
        const addresses = _(_addresses)
            .map((address) => address.toLowerCase())
            .uniq()
            .value();
        if (addresses.length > 0) {
            const [symbolsResult, decimalsResult] = await Promise.all([
                this.getTokenSymbol(addresses, providerConfig),
                this.getTokenDecimals(addresses, providerConfig),
            ]);
            const isBytes32 = symbolsResult.isBytes32;
            const { results: symbols } = symbolsResult.result;
            const { results: decimals } = decimalsResult;
            for (let i = 0; i < addresses.length; i++) {
                const address = addresses[i];
                const symbolResult = symbols[i];
                const decimalResult = decimals[i];
                if (!(symbolResult === null || symbolResult === void 0 ? void 0 : symbolResult.success) || !(decimalResult === null || decimalResult === void 0 ? void 0 : decimalResult.success)) {
                    log.info({
                        symbolResult,
                        decimalResult,
                    }, `Dropping token with address ${address} as symbol or decimal are invalid`);
                    continue;
                }
                const symbol = isBytes32
                    ? parseBytes32String(symbolResult.result[0])
                    : symbolResult.result[0];
                const decimal = decimalResult.result[0];
                addressToToken[address.toLowerCase()] = new Token(this.chainId, address, decimal, symbol);
                symbolToToken[symbol.toLowerCase()] =
                    addressToToken[address.toLowerCase()];
            }
            log.info(`Got token symbol and decimals for ${Object.values(addressToToken).length} out of ${addresses.length} tokens on-chain ${providerConfig ? `as of: ${providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber}` : ''}`);
        }
        return {
            getTokenByAddress: (address) => {
                return addressToToken[address.toLowerCase()];
            },
            getTokenBySymbol: (symbol) => {
                return symbolToToken[symbol.toLowerCase()];
            },
            getAllTokens: () => {
                return Object.values(addressToToken);
            },
        };
    }
}
export const DAI_ON = (chainId) => {
    switch (chainId) {
        case ChainId.X1:
            return DAI_X1;
        case ChainId.X1_TESTNET:
            return DAI_X1_TESTNET;
        default:
            throw new Error(`Chain id: ${chainId} not supported`);
    }
};
export const USDT_ON = (chainId) => {
    switch (chainId) {
        case ChainId.X1:
            return USDT_X1;
        case ChainId.X1_TESTNET:
            return USDT_X1_TESTNET;
        default:
            throw new Error(`Chain id: ${chainId} not supported`);
    }
};
export const USDC_ON = (chainId) => {
    switch (chainId) {
        case ChainId.X1:
            return USDC_X1;
        case ChainId.X1_TESTNET:
            return USDC_X1_TESTNET;
        default:
            throw new Error(`Chain id: ${chainId} not supported`);
    }
};
export const WNATIVE_ON = (chainId) => {
    return WRAPPED_NATIVE_CURRENCY[chainId];
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3Rva2VuLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUUvQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM1RCxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3RELE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQztBQUV2QixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUN4RixPQUFPLEVBQUUsR0FBRyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sU0FBUyxDQUFDO0FBK0J2RCxxRUFBcUU7QUFDckUsaUJBQWlCO0FBQ2pCLE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FDOUIsT0FBTyxDQUFDLEVBQUUsRUFDViw0Q0FBNEMsRUFDNUMsQ0FBQyxFQUNELE1BQU0sRUFDTixRQUFRLENBQ1QsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxJQUFJLEtBQUssQ0FDdEMsT0FBTyxDQUFDLFVBQVUsRUFDbEIsNENBQTRDLEVBQzVDLEVBQUUsRUFDRixNQUFNLEVBQ04saUJBQWlCLENBQ2xCLENBQUM7QUFDRixNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQzlCLE9BQU8sQ0FBQyxFQUFFLEVBQ1YsNENBQTRDLEVBQzVDLENBQUMsRUFDRCxNQUFNLEVBQ04sWUFBWSxDQUNiLENBQUM7QUFDRixNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxLQUFLLENBQ3RDLE9BQU8sQ0FBQyxVQUFVLEVBQ2xCLDRDQUE0QyxFQUM1QyxDQUFDLEVBQ0QsTUFBTSxFQUNOLFlBQVksQ0FDYixDQUFDO0FBQ0YsTUFB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