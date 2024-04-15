"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticV2SubgraphProvider = void 0;
const sdk_core_1 = require("@jaguarswap/sdk-core");
const v2_sdk_1 = require("@uniswap/v2-sdk");
const lodash_1 = __importDefault(require("lodash"));
const chains_1 = require("../../util/chains");
const log_1 = require("../../util/log");
const token_provider_1 = require("../token-provider");
const BASES_TO_CHECK_TRADES_AGAINST = {
    [sdk_core_1.ChainId.X1]: [
        chains_1.WRAPPED_NATIVE_CURRENCY[sdk_core_1.ChainId.X1],
        token_provider_1.DAI_X1,
        token_provider_1.USDC_X1,
        token_provider_1.USDT_X1,
        token_provider_1.WBTC_X1,
    ],
    [sdk_core_1.ChainId.X1_TESTNET]: [
        chains_1.WRAPPED_NATIVE_CURRENCY[sdk_core_1.ChainId.X1_TESTNET],
        token_provider_1.DAI_X1_TESTNET,
    ],
};
/**
 * Provider that does not get data from an external source and instead returns
 * a hardcoded list of Subgraph pools.
 *
 * Since the pools are hardcoded, the liquidity/price values are dummys and should not
 * be depended on.
 *
 * Useful for instances where other data sources are unavailable. E.g. subgraph not available.
 *
 * @export
 * @class StaticV2SubgraphProvider
 */
class StaticV2SubgraphProvider {
    constructor(chainId) {
        this.chainId = chainId;
    }
    async getPools(tokenIn, tokenOut) {
        log_1.log.info('In static subgraph provider for V2');
        const bases = BASES_TO_CHECK_TRADES_AGAINST[this.chainId];
        const basePairs = lodash_1.default.flatMap(bases, (base) => bases.map((otherBase) => [base, otherBase]));
        if (tokenIn && tokenOut) {
            basePairs.push([tokenIn, tokenOut], ...bases.map((base) => [tokenIn, base]), ...bases.map((base) => [tokenOut, base]));
        }
        const pairs = (0, lodash_1.default)(basePairs)
            .filter((tokens) => Boolean(tokens[0] && tokens[1]))
            .filter(([tokenA, tokenB]) => tokenA.address !== tokenB.address && !tokenA.equals(tokenB))
            .value();
        const poolAddressSet = new Set();
        const subgraphPools = (0, lodash_1.default)(pairs)
            .map(([tokenA, tokenB]) => {
            const poolAddress = v2_sdk_1.Pair.getAddress(tokenA, tokenB);
            if (poolAddressSet.has(poolAddress)) {
                return undefined;
            }
            poolAddressSet.add(poolAddress);
            const [token0, token1] = tokenA.sortsBefore(tokenB)
                ? [tokenA, tokenB]
                : [tokenB, tokenA];
            return {
                id: poolAddress,
                liquidity: '100',
                token0: {
                    id: token0.address,
                },
                token1: {
                    id: token1.address,
                },
                supply: 100,
                reserve: 100,
                reserveUSD: 100,
            };
        })
            .compact()
            .value();
        return subgraphPools;
    }
}
exports.StaticV2SubgraphProvider = StaticV2SubgraphProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljLXN1YmdyYXBoLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy92Mi9zdGF0aWMtc3ViZ3JhcGgtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsbURBQXNEO0FBQ3RELDRDQUF1QztBQUN2QyxvREFBdUI7QUFFdkIsOENBQTREO0FBQzVELHdDQUFxQztBQUNyQyxzREFNMkI7QUFRM0IsTUFBTSw2QkFBNkIsR0FBbUI7SUFDcEQsQ0FBQyxrQkFBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ1osZ0NBQXVCLENBQUMsa0JBQU8sQ0FBQyxFQUFFLENBQUM7UUFDbkMsdUJBQU07UUFDTix3QkFBTztRQUNQLHdCQUFPO1FBQ1Asd0JBQU87S0FDUjtJQUNELENBQUMsa0JBQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUNwQixnQ0FBdUIsQ0FBQyxrQkFBTyxDQUFDLFVBQVUsQ0FBQztRQUMzQywrQkFBYztLQUNmO0NBQ0YsQ0FBQztBQUVGOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBYSx3QkFBd0I7SUFDbkMsWUFBb0IsT0FBZ0I7UUFBaEIsWUFBTyxHQUFQLE9BQU8sQ0FBUztJQUFHLENBQUM7SUFFakMsS0FBSyxDQUFDLFFBQVEsQ0FDbkIsT0FBZSxFQUNmLFFBQWdCO1FBRWhCLFNBQUcsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUMvQyxNQUFNLEtBQUssR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFMUQsTUFBTSxTQUFTLEdBQXFCLGdCQUFDLENBQUMsT0FBTyxDQUMzQyxLQUFLLEVBQ0wsQ0FBQyxJQUFJLEVBQW9CLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUN4RSxDQUFDO1FBRUYsSUFBSSxPQUFPLElBQUksUUFBUSxFQUFFO1lBQ3ZCLFNBQVMsQ0FBQyxJQUFJLENBQ1osQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQ25CLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBa0IsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQ3ZELEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBa0IsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQ3pELENBQUM7U0FDSDtRQUVELE1BQU0sS0FBSyxHQUFxQixJQUFBLGdCQUFDLEVBQUMsU0FBUyxDQUFDO2FBQ3pDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBNEIsRUFBRSxDQUMzQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNoQzthQUNBLE1BQU0sQ0FDTCxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FDbkIsTUFBTSxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDOUQ7YUFDQSxLQUFLLEVBQUUsQ0FBQztRQUVYLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFekMsTUFBTSxhQUFhLEdBQXFCLElBQUEsZ0JBQUMsRUFBQyxLQUFLLENBQUM7YUFDN0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRTtZQUN4QixNQUFNLFdBQVcsR0FBRyxhQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVwRCxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBQ0QsY0FBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVoQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDO2dCQUNqRCxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFckIsT0FBTztnQkFDTCxFQUFFLEVBQUUsV0FBVztnQkFDZixTQUFTLEVBQUUsS0FBSztnQkFDaEIsTUFBTSxFQUFFO29CQUNOLEVBQUUsRUFBRSxNQUFNLENBQUMsT0FBTztpQkFDbkI7Z0JBQ0QsTUFBTSxFQUFFO29CQUNOLEVBQUUsRUFBRSxNQUFNLENBQUMsT0FBTztpQkFDbkI7Z0JBQ0QsTUFBTSxFQUFFLEdBQUc7Z0JBQ1gsT0FBTyxFQUFFLEdBQUc7Z0JBQ1osVUFBVSxFQUFFLEdBQUc7YUFDaEIsQ0FBQztRQUNKLENBQUMsQ0FBQzthQUNELE9BQU8sRUFBRTthQUNULEtBQUssRUFBRSxDQUFDO1FBRVgsT0FBTyxhQUFhLENBQUM7SUFDdkIsQ0FBQztDQUNGO0FBbkVELDREQW1FQyJ9