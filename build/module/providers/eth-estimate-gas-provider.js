import { BigNumber } from '@ethersproject/bignumber';
import { SwapType } from '../routers';
import { log } from '../util';
import { calculateGasUsed, initSwapRouteFromExisting, } from '../util/gas-factory-helpers';
import { SimulationStatus, Simulator } from './simulation-provider';
// We multiply eth estimate gas by this to add a buffer for gas limits
const DEFAULT_ESTIMATE_MULTIPLIER = 1.2;
export class EthEstimateGasSimulator extends Simulator {
    constructor(chainId, provider, v2PoolProvider, v3PoolProvider, portionProvider, overrideEstimateMultiplier) {
        super(provider, portionProvider, chainId);
        this.v2PoolProvider = v2PoolProvider;
        this.v3PoolProvider = v3PoolProvider;
        this.overrideEstimateMultiplier = overrideEstimateMultiplier !== null && overrideEstimateMultiplier !== void 0 ? overrideEstimateMultiplier : {};
    }
    async ethEstimateGas(fromAddress, swapOptions, route, providerConfig) {
        const currencyIn = route.trade.inputAmount.currency;
        let estimatedGasUsed;
        if (swapOptions.type == SwapType.UNIVERSAL_ROUTER) {
            log.info({ methodParameters: route.methodParameters }, 'Simulating using eth_estimateGas on Universal Router');
            try {
                estimatedGasUsed = await this.provider.estimateGas({
                    data: route.methodParameters.calldata,
                    to: route.methodParameters.to,
                    from: fromAddress,
                    value: BigNumber.from(currencyIn.isNative ? route.methodParameters.value : '0'),
                });
            }
            catch (e) {
                log.error({ e }, 'Error estimating gas');
                return {
                    ...route,
                    simulationStatus: SimulationStatus.Failed,
                };
            }
        }
        else if (swapOptions.type == SwapType.SWAP_ROUTER_02) {
            try {
                estimatedGasUsed = await this.provider.estimateGas({
                    data: route.methodParameters.calldata,
                    to: route.methodParameters.to,
                    from: fromAddress,
                    value: BigNumber.from(currencyIn.isNative ? route.methodParameters.value : '0'),
                });
            }
            catch (e) {
                log.error({ e }, 'Error estimating gas');
                return {
                    ...route,
                    simulationStatus: SimulationStatus.Failed,
                };
            }
        }
        else {
            throw new Error(`Unsupported swap type ${swapOptions}`);
        }
        estimatedGasUsed = this.adjustGasEstimate(estimatedGasUsed);
        log.info({
            methodParameters: route.methodParameters,
            estimatedGasUsed: estimatedGasUsed.toString(),
        }, 'Simulated using eth_estimateGas on SwapRouter02');
        const { estimatedGasUsedUSD, estimatedGasUsedQuoteToken, quoteGasAdjusted, } = await calculateGasUsed(route.quote.currency.chainId, route, estimatedGasUsed, this.v2PoolProvider, this.v3PoolProvider, providerConfig);
        return {
            ...initSwapRouteFromExisting(route, this.v2PoolProvider, this.v3PoolProvider, this.portionProvider, quoteGasAdjusted, estimatedGasUsed, estimatedGasUsedQuoteToken, estimatedGasUsedUSD, swapOptions),
            simulationStatus: SimulationStatus.Succeeded,
        };
    }
    adjustGasEstimate(gasLimit) {
        var _a;
        const estimateMultiplier = (_a = this.overrideEstimateMultiplier[this.chainId]) !== null && _a !== void 0 ? _a : DEFAULT_ESTIMATE_MULTIPLIER;
        const adjustedGasEstimate = BigNumber.from(gasLimit)
            .mul(estimateMultiplier * 100)
            .div(100);
        return adjustedGasEstimate;
    }
    async simulateTransaction(fromAddress, swapOptions, swapRoute, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _providerConfig) {
        const inputAmount = swapRoute.trade.inputAmount;
        if (inputAmount.currency.isNative ||
            (await this.checkTokenApproved(fromAddress, inputAmount, swapOptions, this.provider))) {
            return await this.ethEstimateGas(fromAddress, swapOptions, swapRoute);
        }
        else {
            log.info('Token not approved, skipping simulation');
            return {
                ...swapRoute,
                simulationStatus: SimulationStatus.NotApproved,
            };
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXRoLWVzdGltYXRlLWdhcy1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcm92aWRlcnMvZXRoLWVzdGltYXRlLWdhcy1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFJckQsT0FBTyxFQUEwQixRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDOUQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLHlCQUF5QixHQUMxQixNQUFNLDZCQUE2QixDQUFDO0FBSXJDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUlwRSxzRUFBc0U7QUFDdEUsTUFBTSwyQkFBMkIsR0FBRyxHQUFHLENBQUM7QUFFeEMsTUFBTSxPQUFPLHVCQUF3QixTQUFRLFNBQVM7SUFLcEQsWUFDRSxPQUFnQixFQUNoQixRQUF5QixFQUN6QixjQUErQixFQUMvQixjQUErQixFQUMvQixlQUFpQyxFQUNqQywwQkFBOEQ7UUFFOUQsS0FBSyxDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDckMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDckMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLDBCQUEwQixhQUExQiwwQkFBMEIsY0FBMUIsMEJBQTBCLEdBQUksRUFBRSxDQUFDO0lBQ3JFLENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUNsQixXQUFtQixFQUNuQixXQUF3QixFQUN4QixLQUFnQixFQUNoQixjQUErQjtRQUUvQixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDcEQsSUFB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