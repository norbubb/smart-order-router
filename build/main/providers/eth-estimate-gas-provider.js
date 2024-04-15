"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthEstimateGasSimulator = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const routers_1 = require("../routers");
const util_1 = require("../util");
const gas_factory_helpers_1 = require("../util/gas-factory-helpers");
const simulation_provider_1 = require("./simulation-provider");
// We multiply eth estimate gas by this to add a buffer for gas limits
const DEFAULT_ESTIMATE_MULTIPLIER = 1.2;
class EthEstimateGasSimulator extends simulation_provider_1.Simulator {
    constructor(chainId, provider, v2PoolProvider, v3PoolProvider, portionProvider, overrideEstimateMultiplier) {
        super(provider, portionProvider, chainId);
        this.v2PoolProvider = v2PoolProvider;
        this.v3PoolProvider = v3PoolProvider;
        this.overrideEstimateMultiplier = overrideEstimateMultiplier !== null && overrideEstimateMultiplier !== void 0 ? overrideEstimateMultiplier : {};
    }
    async ethEstimateGas(fromAddress, swapOptions, route, providerConfig) {
        const currencyIn = route.trade.inputAmount.currency;
        let estimatedGasUsed;
        if (swapOptions.type == routers_1.SwapType.UNIVERSAL_ROUTER) {
            util_1.log.info({ methodParameters: route.methodParameters }, 'Simulating using eth_estimateGas on Universal Router');
            try {
                estimatedGasUsed = await this.provider.estimateGas({
                    data: route.methodParameters.calldata,
                    to: route.methodParameters.to,
                    from: fromAddress,
                    value: bignumber_1.BigNumber.from(currencyIn.isNative ? route.methodParameters.value : '0'),
                });
            }
            catch (e) {
                util_1.log.error({ e }, 'Error estimating gas');
                return Object.assign(Object.assign({}, route), { simulationStatus: simulation_provider_1.SimulationStatus.Failed });
            }
        }
        else if (swapOptions.type == routers_1.SwapType.SWAP_ROUTER_02) {
            try {
                estimatedGasUsed = await this.provider.estimateGas({
                    data: route.methodParameters.calldata,
                    to: route.methodParameters.to,
                    from: fromAddress,
                    value: bignumber_1.BigNumber.from(currencyIn.isNative ? route.methodParameters.value : '0'),
                });
            }
            catch (e) {
                util_1.log.error({ e }, 'Error estimating gas');
                return Object.assign(Object.assign({}, route), { simulationStatus: simulation_provider_1.SimulationStatus.Failed });
            }
        }
        else {
            throw new Error(`Unsupported swap type ${swapOptions}`);
        }
        estimatedGasUsed = this.adjustGasEstimate(estimatedGasUsed);
        util_1.log.info({
            methodParameters: route.methodParameters,
            estimatedGasUsed: estimatedGasUsed.toString(),
        }, 'Simulated using eth_estimateGas on SwapRouter02');
        const { estimatedGasUsedUSD, estimatedGasUsedQuoteToken, quoteGasAdjusted, } = await (0, gas_factory_helpers_1.calculateGasUsed)(route.quote.currency.chainId, route, estimatedGasUsed, this.v2PoolProvider, this.v3PoolProvider, providerConfig);
        return Object.assign(Object.assign({}, (0, gas_factory_helpers_1.initSwapRouteFromExisting)(route, this.v2PoolProvider, this.v3PoolProvider, this.portionProvider, quoteGasAdjusted, estimatedGasUsed, estimatedGasUsedQuoteToken, estimatedGasUsedUSD, swapOptions)), { simulationStatus: simulation_provider_1.SimulationStatus.Succeeded });
    }
    adjustGasEstimate(gasLimit) {
        var _a;
        const estimateMultiplier = (_a = this.overrideEstimateMultiplier[this.chainId]) !== null && _a !== void 0 ? _a : DEFAULT_ESTIMATE_MULTIPLIER;
        const adjustedGasEstimate = bignumber_1.BigNumber.from(gasLimit)
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
            util_1.log.info('Token not approved, skipping simulation');
            return Object.assign(Object.assign({}, swapRoute), { simulationStatus: simulation_provider_1.SimulationStatus.NotApproved });
        }
    }
}
exports.EthEstimateGasSimulator = EthEstimateGasSimulator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXRoLWVzdGltYXRlLWdhcy1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcm92aWRlcnMvZXRoLWVzdGltYXRlLWdhcy1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBcUQ7QUFJckQsd0NBQThEO0FBQzlELGtDQUE4QjtBQUM5QixxRUFHcUM7QUFJckMsK0RBQW9FO0FBSXBFLHNFQUFzRTtBQUN0RSxNQUFNLDJCQUEyQixHQUFHLEdBQUcsQ0FBQztBQUV4QyxNQUFhLHVCQUF3QixTQUFRLCtCQUFTO0lBS3BELFlBQ0UsT0FBZ0IsRUFDaEIsUUFBeUIsRUFDekIsY0FBK0IsRUFDL0IsY0FBK0IsRUFDL0IsZUFBaUMsRUFDakMsMEJBQThEO1FBRTlELEtBQUssQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQywwQkFBMEIsR0FBRywwQkFBMEIsYUFBMUIsMEJBQTBCLGNBQTFCLDBCQUEwQixHQUFJLEVBQUUsQ0FBQztJQUNyRSxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FDbEIsV0FBbUIsRUFDbkIsV0FBd0IsRUFDeEIsS0FBZ0IsRUFDaEIsY0FBK0I7UUFFL0IsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ3BELElBQUksZ0JBQTJCLENBQUM7UUFDaEMsSUFBSSxXQUFXLENBQUMsSUFBSSxJQUFJLGtCQUFRLENBQUMsZ0JBQWdCLEVBQUU7WUFDakQsVUFBRyxDQUFDLElBQUksQ0FDTixFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxFQUM1QyxzREFBc0QsQ0FDdkQsQ0FBQztZQUNGLElBQUk7Z0JBQ0YsZ0JB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