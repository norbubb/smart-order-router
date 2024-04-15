import { TradeType, } from '@jaguarswap/sdk-core';
import { CacheMode } from './model';
/**
 * Abstract class for a RouteCachingProvider.
 * Defines the base methods of how to interact with this interface, but not the implementation of how to cache.
 */
export class IRouteCachingProvider {
    constructor() {
        /**
         * Final implementation of the public `getCachedRoute` method, this is how code will interact with the implementation
         *
         * @public
         * @readonly
         * @param chainId
         * @param amount
         * @param quoteToken
         * @param tradeType
         * @param protocols
         * @param blockNumber
         */
        this.getCachedRoute = async (// Defined as a readonly member instead of a regular function to make it final.
        chainId, amount, quoteToken, tradeType, protocols, blockNumber, optimistic = false) => {
            if (await this.getCacheMode(chainId, amount, quoteToken, tradeType, protocols) == CacheMode.Darkmode) {
                return undefined;
            }
            const cachedRoute = await this._getCachedRoute(chainId, amount, quoteToken, tradeType, protocols, blockNumber, optimistic);
            return this.filterExpiredCachedRoutes(cachedRoute, blockNumber, optimistic);
        };
        /**
         * Final implementation of the public `setCachedRoute` method.
         * This method will set the blockToLive in the CachedRoutes object before calling the internal method to insert in cache.
         *
         * @public
         * @readonly
         * @param cachedRoutes The route to cache.
         * @returns Promise<boolean> Indicates if the route was inserted into cache.
         */
        this.setCachedRoute = async (// Defined as a readonly member instead of a regular function to make it final.
        cachedRoutes, amount) => {
            if (await this.getCacheModeFromCachedRoutes(cachedRoutes, amount) == CacheMode.Darkmode) {
                return false;
            }
            cachedRoutes.blocksToLive = await this._getBlocksToLive(cachedRoutes, amount);
            return this._setCachedRoute(cachedRoutes, amount);
        };
    }
    /**
     * Returns the CacheMode for the given cachedRoutes and amount
     *
     * @param cachedRoutes
     * @param amount
     */
    getCacheModeFromCachedRoutes(cachedRoutes, amount) {
        const quoteToken = cachedRoutes.tradeType == TradeType.EXACT_INPUT ? cachedRoutes.tokenOut : cachedRoutes.tokenIn;
        return this.getCacheMode(cachedRoutes.chainId, amount, quoteToken, cachedRoutes.tradeType, cachedRoutes.protocolsCovered);
    }
    filterExpiredCachedRoutes(cachedRoutes, blockNumber, optimistic) {
        return (cachedRoutes === null || cachedRoutes === void 0 ? void 0 : cachedRoutes.notExpired(blockNumber, optimistic)) ? cachedRoutes : undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtY2FjaGluZy1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9wcm92aWRlcnMvY2FjaGluZy9yb3V0ZS9yb3V0ZS1jYWNoaW5nLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLE9BQU8sRUFLTCxTQUFTLEdBQ1YsTUFBTSxzQkFBc0IsQ0FBQztBQUU5QixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBR3BDOzs7R0FHRztBQUNILE1BQU0sT0FBZ0IscUJBQXFCO0lBQTNDO1FBQ0U7Ozs7Ozs7Ozs7O1dBV0c7UUFDYSxtQkFBYyxHQUFHLEtBQUssRUFBRywrRUFBK0U7UUFDdEgsT0FBZSxFQUNmLE1BQWdDLEVBQ2hDLFVBQWlCLEVBQ2pCLFNBQW9CLEVBQ3BCLFNBQXFCLEVBQ3JCLFdBQW1CLEVBQ25CLFVBQVUsR0FBRyxLQUFLLEVBQ2lCLEVBQUU7WUFDckMsSUFBSSxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3BHLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUM1QyxPQUFPLEVBQ1AsTUFBTSxFQUNOLFVBQVUsRUFDVixTQUFTLEVBQ1QsU0FBUyxFQUNULFdBQVcsRUFDWCxVQUFVLENBQ1gsQ0FBQztZQUVGLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUUsQ0FBQyxDQUFDO1FBRUY7Ozs7Ozs7O1dBUUc7UUFDYSxtQkFBYyxHQUFHLEtBQUssRUFBRywrRUFBK0U7UUFDdEgsWUFBMEIsRUFDMUIsTUFBZ0MsRUFDZCxFQUFFO1lBQ3BCLElBQUksTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZGLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFFRCxZQUFZLENBQUMsWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUU5RSxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQztJQTJGSixDQUFDO0lBekZDOzs7OztPQUtHO0lBQ0ksNEJBQTRCLENBQ2pDLFlBQTBCLEVBQzFCLE1BQWdDO1FBRWhDLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQztRQUVsSCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQ3RCLFlBQVksQ0FBQyxPQUFPLEVBQ3BCLE1BQU0sRUFDTixVQUFVLEVBQ1YsWUFBWSxDQUFDLFNBQVMsRUFDdEIsWUFBWSxDQUFDLGdCQUFnQixDQUM5QixDQUFDO0lBQ0osQ0FBQztJQXFCUyx5QkFBeUIsQ0FDakMsWUFBc0MsRUFDdEMsV0FBbUIsRUFDbkIsVUFBbUI7UUFFbkIsT0FBTyxDQUFBLFlBQVksYUFBWixZQUFZLHVCQUFaLFlBQVksQ0FBRSxVQUFVLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUN0RixDQUFDO0NBMkNGIn0=