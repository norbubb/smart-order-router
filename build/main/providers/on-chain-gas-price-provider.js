"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnChainGasPriceProvider = void 0;
const gas_price_provider_1 = require("./gas-price-provider");
const DEFAULT_EIP_1559_SUPPORTED_CHAINS = [
// FIXME: 确认 x1 是否支持 1559
];
/**
 * Gets gas prices on chain. If the chain supports EIP-1559 and has the feeHistory API,
 * uses the EIP1559 provider. Otherwise it will use a legacy provider that uses eth_gasPrice
 *
 * @export
 * @class OnChainGasPriceProvider
 */
class OnChainGasPriceProvider extends gas_price_provider_1.IGasPriceProvider {
    constructor(chainId, eip1559GasPriceProvider, legacyGasPriceProvider, eipChains = DEFAULT_EIP_1559_SUPPORTED_CHAINS) {
        super();
        this.chainId = chainId;
        this.eip1559GasPriceProvider = eip1559GasPriceProvider;
        this.legacyGasPriceProvider = legacyGasPriceProvider;
        this.eipChains = eipChains;
    }
    async getGasPrice() {
        if (this.eipChains.includes(this.chainId)) {
            return this.eip1559GasPriceProvider.getGasPrice();
        }
        return this.legacyGasPriceProvider.getGasPrice();
    }
}
exports.OnChainGasPriceProvider = OnChainGasPriceProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24tY2hhaW4tZ2FzLXByaWNlLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9vbi1jaGFpbi1nYXMtcHJpY2UtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsNkRBQW1FO0FBR25FLE1BQU0saUNBQWlDLEdBQWM7QUFDbkQseUJBQXlCO0NBQzFCLENBQUM7QUFFRjs7Ozs7O0dBTUc7QUFDSCxNQUFhLHVCQUF3QixTQUFRLHNDQUFpQjtJQUM1RCxZQUNZLE9BQWdCLEVBQ2hCLHVCQUFnRCxFQUNoRCxzQkFBOEMsRUFDOUMsWUFBdUIsaUNBQWlDO1FBRWxFLEtBQUssRUFBRSxDQUFDO1FBTEUsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNoQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1FBQ2hELDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7UUFDOUMsY0FBUyxHQUFULFNBQVMsQ0FBK0M7SUFHcEUsQ0FBQztJQUVNLEtBQUssQ0FBQyxXQUFXO1FBQ3RCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3pDLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ25EO1FBRUQsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDbkQsQ0FBQztDQUNGO0FBakJELDBEQWlCQyJ9