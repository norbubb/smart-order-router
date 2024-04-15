import { LowerCaseStringArray } from './alpha-router';
export const DEFAULT_ROUTING_CONFIG_BY_CHAIN = (chainId) => {
    switch (chainId) {
        default:
            return {
                v2PoolSelection: {
                    topN: 3,
                    topNDirectSwaps: 1,
                    topNTokenInOut: 5,
                    topNSecondHop: 2,
                    tokensToAvoidOnSecondHops: new LowerCaseStringArray('0xd46ba6d942050d489dbd938a2c909a5d5039a161' // AMPL on Mainnet
                    ),
                    topNWithEachBaseToken: 2,
                    topNWithBaseToken: 6,
                },
                v3PoolSelection: {
                    topN: 2,
                    topNDirectSwaps: 2,
                    topNTokenInOut: 3,
                    topNSecondHop: 1,
                    topNWithEachBaseToken: 3,
                    topNWithBaseToken: 5,
                },
                maxSwapsPerPath: 3,
                minSplits: 1,
                maxSplits: 7,
                distributionPercent: 5,
                forceCrossProtocol: false,
            };
    }
};
export const ETH_GAS_STATION_API_URL = 'https://ethgasstation.info/api/ethgasAPI.json';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3JvdXRlcnMvYWxwaGEtcm91dGVyL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQXFCLG9CQUFvQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFekUsTUFBTSxDQUFDLE1BQU0sK0JBQStCLEdBQUcsQ0FDN0MsT0FBZ0IsRUFDRyxFQUFFO0lBQ3JCLFFBQVEsT0FBTyxFQUFFO1FBQ2Y7WUFDRSxPQUFPO2dCQUNMLGVBQWUsRUFBRTtvQkFDZixJQUFJLEVBQUUsQ0FBQztvQkFDUCxlQUFlLEVBQUUsQ0FBQztvQkFDbEIsY0FBYyxFQUFFLENBQUM7b0JBQ2pCLGFBQWEsRUFBRSxDQUFDO29CQUNoQix5QkFBeUIsRUFBRSxJQUFJLG9CQUFvQixDQUNqRCw0Q0FBNEMsQ0FBQyxrQkFBa0I7cUJBQ2hFO29CQUNELHFCQUFxQixFQUFFLENBQUM7b0JBQ3hCLGlCQUFpQixFQUFFLENBQUM7aUJBQ3JCO2dCQUNELGVBQWUsRUFBRTtvQkFDZixJQUFJLEVBQUUsQ0FBQztvQkFDUCxlQUFlLEVBQUUsQ0FBQztvQkFDbEIsY0FBYyxFQUFFLENBQUM7b0JBQ2pCLGFBQWEsRUFBRSxDQUFDO29CQUNoQixxQkFBcUIsRUFBRSxDQUFDO29CQUN4QixpQkFBaUIsRUFBRSxDQUFDO2lCQUNyQjtnQkFDRCxlQUFlLEVBQUUsQ0FBQztnQkFDbEIsU0FBUyxFQUFFLENBQUM7Z0JBQ1osU0FBUyxFQUFFLENBQUM7Z0JBQ1osbUJBQW1CLEVBQUUsQ0FBQztnQkFDdEIsa0JBQWtCLEVBQUUsS0FBSzthQUMxQixDQUFDO0tBQ0w7QUFDSCxDQUFDLENBQUM7QUFDRixNQUFNLENBQUMsTUFBTSx1QkFBdUIsR0FDbEMsK0NBQStDLENBQUMifQ==