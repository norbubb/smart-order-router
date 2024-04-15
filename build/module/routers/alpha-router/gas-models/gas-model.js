import { ChainId } from '@jaguarswap/sdk-core';
import { DAI_X1, USDC_X1, USDT_X1, DAI_X1_TESTNET, USDC_X1_TESTNET, USDT_X1_TESTNET, } from '../../../providers/token-provider';
// When adding new usd gas tokens, ensure the tokens are ordered
// from tokens with highest decimals to lowest decimals. For example,
// DAI_AVAX has 18 decimals and comes before USDC_AVAX which has 6 decimals.
export const usdGasTokensByChain = {
    [ChainId.X1]: [DAI_X1, USDC_X1, USDT_X1],
    [ChainId.X1_TESTNET]: [USDC_X1_TESTNET, USDT_X1_TESTNET, DAI_X1_TESTNET],
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
export class IV2GasModelFactory {
}
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
export class IOnChainGasModelFactory {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FzLW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3JvdXRlcnMvYWxwaGEtcm91dGVyL2dhcy1tb2RlbHMvZ2FzLW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxPQUFPLEVBQVMsTUFBTSxzQkFBc0IsQ0FBQztBQUl0RCxPQUFPLEVBQ0wsTUFBTSxFQUNOLE9BQU8sRUFDUCxPQUFPLEVBQ1AsY0FBYyxFQUNkLGVBQWUsRUFDZixlQUFlLEdBQ2hCLE1BQU0sbUNBQW1DLENBQUM7QUFVM0MsZ0VBQWdFO0FBQ2hFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQXVDO0lBQ3JFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7SUFDeEMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGNBQWMsQ0FBQztDQUN6RSxDQUFDO0FBeURGOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLE9BQWdCLGtCQUFrQjtDQVF2QztBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLE9BQWdCLHVCQUF1QjtDQWE1QyJ9