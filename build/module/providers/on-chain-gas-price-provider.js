import { IGasPriceProvider } from './gas-price-provider';
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
export class OnChainGasPriceProvider extends IGasPriceProvider {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24tY2hhaW4tZ2FzLXByaWNlLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9vbi1jaGFpbi1nYXMtcHJpY2UtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFZLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFHbkUsTUFBTSxpQ0FBaUMsR0FBYztBQUNuRCx5QkFBeUI7Q0FDMUIsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxpQkFBaUI7SUFDNUQsWUFDWSxPQUFnQixFQUNoQix1QkFBZ0QsRUFDaEQsc0JBQThDLEVBQzlDLFlBQXVCLGlDQUFpQztRQUVsRSxLQUFLLEVBQUUsQ0FBQztRQUxFLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFDaEIsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtRQUNoRCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1FBQzlDLGNBQVMsR0FBVCxTQUFTLENBQStDO0lBR3BFLENBQUM7SUFFTSxLQUFLLENBQUMsV0FBVztRQUN0QixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN6QyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNuRDtRQUVELE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ25ELENBQUM7Q0FDRiJ9