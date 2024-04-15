"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOnChainGasModelFactory = exports.IV2GasModelFactory = exports.usdGasTokensByChain = void 0;
const sdk_core_1 = require("@jaguarswap/sdk-core");
const token_provider_1 = require("../../../providers/token-provider");
// When adding new usd gas tokens, ensure the tokens are ordered
// from tokens with highest decimals to lowest decimals. For example,
// DAI_AVAX has 18 decimals and comes before USDC_AVAX which has 6 decimals.
exports.usdGasTokensByChain = {
    [sdk_core_1.ChainId.X1]: [token_provider_1.DAI_X1, token_provider_1.USDC_X1, token_provider_1.USDT_X1],
    [sdk_core_1.ChainId.X1_TESTNET]: [token_provider_1.USDC_X1_TESTNET, token_provider_1.USDT_X1_TESTNET, token_provider_1.DAI_X1_TESTNET],
};
/**
 * Factory for building gas models that can be used with any route to generate
 * gas estimates.
 *
 * Factory model is used so that any supporting data can be fetched once and
 * returned as part of the model.
 *
 * @export
 * @abstract
 * @class IV2GasModelFactory
 */
class IV2GasModelFactory {
}
exports.IV2GasModelFactory = IV2GasModelFactory;
/**
 * Factory for building gas models that can be used with any route to generate
 * gas estimates.
 *
 * Factory model is used so that any supporting data can be fetched once and
 * returned as part of the model.
 *
 * @export
 * @abstract
 * @class IOnChainGasModelFactory
 */
class IOnChainGasModelFactory {
}
exports.IOnChainGasModelFactory = IOnChainGasModelFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FzLW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3JvdXRlcnMvYWxwaGEtcm91dGVyL2dhcy1tb2RlbHMvZ2FzLW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLG1EQUFzRDtBQUl0RCxzRUFPMkM7QUFVM0MsZ0VBQWdFO0FBQ2hFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDL0QsUUFBQSxtQkFBbUIsR0FBdUM7SUFDckUsQ0FBQyxrQkFBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsdUJBQU0sRUFBRSx3QkFBTyxFQUFFLHdCQUFPLENBQUM7SUFDeEMsQ0FBQyxrQkFBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsZ0NBQWUsRUFBRSxnQ0FBZSxFQUFFLCtCQUFjLENBQUM7Q0FDekUsQ0FBQztBQXlERjs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBc0Isa0JBQWtCO0NBUXZDO0FBUkQsZ0RBUUM7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBc0IsdUJBQXVCO0NBYTVDO0FBYkQsMERBYUMifQ==