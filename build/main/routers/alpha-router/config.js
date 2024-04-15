"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETH_GAS_STATION_API_URL = exports.DEFAULT_ROUTING_CONFIG_BY_CHAIN = void 0;
const alpha_router_1 = require("./alpha-router");
const DEFAULT_ROUTING_CONFIG_BY_CHAIN = (chainId) => {
    switch (chainId) {
        default:
            return {
                v2PoolSelection: {
                    topN: 3,
                    topNDirectSwaps: 1,
                    topNTokenInOut: 5,
                    topNSecondHop: 2,
                    tokensToAvoidOnSecondHops: new alpha_router_1.LowerCaseStringArray('0xd46ba6d942050d489dbd938a2c909a5d5039a161' // AMPL on Mainnet
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
exports.DEFAULT_ROUTING_CONFIG_BY_CHAIN = DEFAULT_ROUTING_CONFIG_BY_CHAIN;
exports.ETH_GAS_STATION_API_URL = 'https://ethgasstation.info/api/ethgasAPI.json';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3JvdXRlcnMvYWxwaGEtcm91dGVyL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxpREFBeUU7QUFFbEUsTUFBTSwrQkFBK0IsR0FBRyxDQUM3QyxPQUFnQixFQUNHLEVBQUU7SUFDckIsUUFBUSxPQUFPLEVBQUU7UUFDZjtZQUNFLE9BQU87Z0JBQ0wsZUFBZSxFQUFFO29CQUNmLElBQUksRUFBRSxDQUFDO29CQUNQLGVBQWUsRUFBRSxDQUFDO29CQUNsQixjQUFjLEVBQUUsQ0FBQztvQkFDakIsYUFBYSxFQUFFLENBQUM7b0JBQ2hCLHlCQUF5QixFQUFFLElBQUksbUNBQW9CLENBQ2pELDRDQUE0QyxDQUFDLGtCQUFrQjtxQkFDaEU7b0JBQ0QscUJBQXFCLEVBQUUsQ0FBQztvQkFDeEIsaUJBQWlCLEVBQUUsQ0FBQztpQkFDckI7Z0JBQ0QsZUFBZSxFQUFFO29CQUNmLElBQUksRUFBRSxDQUFDO29CQUNQLGVBQWUsRUFBRSxDQUFDO29CQUNsQixjQUFjLEVBQUUsQ0FBQztvQkFDakIsYUFBYSxFQUFFLENBQUM7b0JBQ2hCLHFCQUFxQixFQUFFLENBQUM7b0JBQ3hCLGlCQUFpQixFQUFFLENBQUM7aUJBQ3JCO2dCQUNELGVBQWUsRUFBRSxDQUFDO2dCQUNsQixTQUFTLEVBQUUsQ0FBQztnQkFDWixTQUFTLEVBQUUsQ0FBQztnQkFDWixtQkFBbUIsRUFBRSxDQUFDO2dCQUN0QixrQkFBa0IsRUFBRSxLQUFLO2FBQzFCLENBQUM7S0FDTDtBQUNILENBQUMsQ0FBQztBQWhDVyxRQUFBLCtCQUErQixtQ0FnQzFDO0FBQ1csUUFBQSx1QkFBdUIsR0FDbEMsK0NBQStDLENBQUMifQ==