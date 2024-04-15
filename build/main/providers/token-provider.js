"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WNATIVE_ON = exports.USDC_ON = exports.USDT_ON = exports.DAI_ON = exports.TokenProvider = exports.UNI_X1 = exports.FEI_X1 = exports.DAI_X1_TESTNET = exports.DAI_X1 = exports.WBTC_X1 = exports.USDT_X1_TESTNET = exports.USDT_X1 = exports.USDC_X1_TESTNET = exports.USDC_X1 = void 0;
const abi_1 = require("@ethersproject/abi");
const strings_1 = require("@ethersproject/strings");
const sdk_core_1 = require("@jaguarswap/sdk-core");
const lodash_1 = __importDefault(require("lodash"));
const IERC20Metadata__factory_1 = require("../types/v3/factories/IERC20Metadata__factory");
const util_1 = require("../util");
// Some well knowne tokens on each chain for seeding cache / testing.
// FIXME: 替换成实际地址
exports.USDC_X1 = new sdk_core_1.Token(sdk_core_1.ChainId.X1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C');
exports.USDC_X1_TESTNET = new sdk_core_1.Token(sdk_core_1.ChainId.X1_TESTNET, '0x04292af1cf8687235a83766d55b307880fc5e76d', 18, 'USDC', 'USDC X1_TESTNET');
exports.USDT_X1 = new sdk_core_1.Token(sdk_core_1.ChainId.X1, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD');
exports.USDT_X1_TESTNET = new sdk_core_1.Token(sdk_core_1.ChainId.X1_TESTNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD');
exports.WBTC_X1 = new sdk_core_1.Token(sdk_core_1.ChainId.X1, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC');
exports.DAI_X1 = new sdk_core_1.Token(sdk_core_1.ChainId.X1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin');
exports.DAI_X1_TESTNET = new sdk_core_1.Token(sdk_core_1.ChainId.X1_TESTNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin');
exports.FEI_X1 = new sdk_core_1.Token(sdk_core_1.ChainId.X1, '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 18, 'FEI', 'Fei USD');
exports.UNI_X1 = new sdk_core_1.Token(sdk_core_1.ChainId.X1, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', 18, 'UNI', 'Uniswap');
class TokenProvider {
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
                    contractInterface: IERC20Metadata__factory_1.IERC20Metadata__factory.createInterface(),
                    functionName: 'symbol',
                    providerConfig,
                });
        }
        catch (error) {
            util_1.log.error({ addresses }, `TokenProvider.getTokenSymbol[string] failed with error ${error}. Trying with bytes32.`);
            const bytes32Interface = new abi_1.Interface([
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
                util_1.log.fatal({ addresses }, `TokenProvider.getTokenSymbol[bytes32] failed with error ${error}.`);
                throw new Error('[TokenProvider.getTokenSymbol] Impossible to fetch token symbol.');
            }
        }
        return { result, isBytes32 };
    }
    async getTokenDecimals(addresses, providerConfig) {
        return this.multicall2Provider.callSameFunctionOnMultipleContracts({
            addresses,
            contractInterface: IERC20Metadata__factory_1.IERC20Metadata__factory.createInterface(),
            functionName: 'decimals',
            providerConfig,
        });
    }
    async getTokens(_addresses, providerConfig) {
        const addressToToken = {};
        const symbolToToken = {};
        const addresses = (0, lodash_1.default)(_addresses)
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
                    util_1.log.info({
                        symbolResult,
                        decimalResult,
                    }, `Dropping token with address ${address} as symbol or decimal are invalid`);
                    continue;
                }
                const symbol = isBytes32
                    ? (0, strings_1.parseBytes32String)(symbolResult.result[0])
                    : symbolResult.result[0];
                const decimal = decimalResult.result[0];
                addressToToken[address.toLowerCase()] = new sdk_core_1.Token(this.chainId, address, decimal, symbol);
                symbolToToken[symbol.toLowerCase()] =
                    addressToToken[address.toLowerCase()];
            }
            util_1.log.info(`Got token symbol and decimals for ${Object.values(addressToToken).length} out of ${addresses.length} tokens on-chain ${providerConfig ? `as of: ${providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber}` : ''}`);
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
exports.TokenProvider = TokenProvider;
const DAI_ON = (chainId) => {
    switch (chainId) {
        case sdk_core_1.ChainId.X1:
            return exports.DAI_X1;
        case sdk_core_1.ChainId.X1_TESTNET:
            return exports.DAI_X1_TESTNET;
        default:
            throw new Error(`Chain id: ${chainId} not supported`);
    }
};
exports.DAI_ON = DAI_ON;
const USDT_ON = (chainId) => {
    switch (chainId) {
        case sdk_core_1.ChainId.X1:
            return exports.USDT_X1;
        case sdk_core_1.ChainId.X1_TESTNET:
            return exports.USDT_X1_TESTNET;
        default:
            throw new Error(`Chain id: ${chainId} not supported`);
    }
};
exports.USDT_ON = USDT_ON;
const USDC_ON = (chainId) => {
    switch (chainId) {
        case sdk_core_1.ChainId.X1:
            return exports.USDC_X1;
        case sdk_core_1.ChainId.X1_TESTNET:
            return exports.USDC_X1_TESTNET;
        default:
            throw new Error(`Chain id: ${chainId} not supported`);
    }
};
exports.USDC_ON = USDC_ON;
const WNATIVE_ON = (chainId) => {
    return util_1.WRAPPED_NATIVE_CURRENCY[chainId];
};
exports.WNATIVE_ON = WNATIVE_ON;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3Rva2VuLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDRDQUErQztBQUUvQyxvREFBNEQ7QUFDNUQsbURBQXNEO0FBQ3RELG9EQUF1QjtBQUV2QiwyRkFBd0Y7QUFDeEYsa0NBQXVEO0FBK0J2RCxxRUFBcUU7QUFDckUsaUJBQWlCO0FBQ0osUUFBQSxPQUFPLEdBQUcsSUFBSSxnQkFBSyxDQUM5QixrQkFBTyxDQUFDLEVBQUUsRUFDViw0Q0FBNEMsRUFDNUMsQ0FBQyxFQUNELE1BQU0sRUFDTixRQUFRLENBQ1QsQ0FBQztBQUVXLFFBQUEsZUFBZSxHQUFHLElBQUksZ0JBQUssQ0FDdEMsa0JBQU8sQ0FBQyxVQUFVLEVBQ2xCLDRDQUE0QyxFQUM1QyxFQUFFLEVBQ0YsTUFBTSxFQUNOLGlCQUFpQixDQUNsQixDQUFDO0FBQ1csUUFBQSxPQUFPLEdBQUcsSUFBSSxnQkFBSyxDQUM5QixrQkFBTyxDQUFDLEVBQUUsRUFDViw0Q0FBNEMsRUFDNUMsQ0FBQyxFQUNELE1BQU0sRUFDTixZQUFZLENBQ2IsQ0FBQztBQUNXLFFBQUEsZUFBZSxHQUFHLElBQUksZ0JBQUssQ0FDdEMsa0JBQU8sQ0FBQyxVQUFVLEVBQ2xCLDRDQUE0QyxFQUM1QyxDQUFDLEVBQ0QsTUFBTSxFQUNOLFlBQVksQ0FDYixDQUFDO0FBQ1csUUFBQSxPQUFPLEdBQUcsSUFBSSxnQkFBSyxDQUM5QixrQkFBTyxDQUFDLEVBQUUsRUFDViw0Q0FBNEMsRUFDNUMsQ0FBQyxFQUNELE1BQU0sRUFDTixhQUFhLENBQ2QsQ0FBQztBQUNXLFFBQUEsTUFBTSxHQUFHLElBQUksZ0JBQUssQ0FDN0Isa0JBQU8sQ0FBQyxFQUFFLEVBQ1YsNENBQTRDLEVBQzVDLEVBQUUsRUFDRixLQUFLLEVBQ0wsZ0JBQWdCLENBQ2pCLENBQUM7QUFDVyxRQUFBLGNB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