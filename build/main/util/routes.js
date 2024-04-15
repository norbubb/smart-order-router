"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolToString = exports.routeAmountToString = exports.routeAmountsToString = exports.routeToString = void 0;
const router_sdk_1 = require("@uniswap/router-sdk");
const sdk_core_1 = require("@jaguarswap/sdk-core");
const v2_sdk_1 = require("@uniswap/v2-sdk");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const lodash_1 = __importDefault(require("lodash"));
const addresses_1 = require("./addresses");
const _1 = require(".");
const routeToString = (route) => {
    const routeStr = [];
    const tokens = route.protocol === router_sdk_1.Protocol.V3
        ? route.tokenPath
        : // MixedRoute and V2Route have path
            route.path;
    const tokenPath = lodash_1.default.map(tokens, (token) => `${token.symbol}`);
    const pools = route.protocol === router_sdk_1.Protocol.V3 || route.protocol === router_sdk_1.Protocol.MIXED
        ? route.pools
        : route.pairs;
    const poolFeePath = lodash_1.default.map(pools, (pool) => {
        return `${pool instanceof v3_sdk_1.Pool
            ? ` -- ${pool.fee / 10000}% [${v3_sdk_1.Pool.getAddress(pool.token0, pool.token1, pool.fee, undefined, addresses_1.V3_CORE_FACTORY_ADDRESSES[pool.chainId])}]`
            : ` -- [${v2_sdk_1.Pair.getAddress(pool.token0, pool.token1)}]`} --> `;
    });
    for (let i = 0; i < tokenPath.length; i++) {
        routeStr.push(tokenPath[i]);
        if (i < poolFeePath.length) {
            routeStr.push(poolFeePath[i]);
        }
    }
    return routeStr.join('');
};
exports.routeToString = routeToString;
const routeAmountsToString = (routeAmounts) => {
    const total = lodash_1.default.reduce(routeAmounts, (total, cur) => {
        return total.add(cur.amount);
    }, _1.CurrencyAmount.fromRawAmount(routeAmounts[0].amount.currency, 0));
    const routeStrings = lodash_1.default.map(routeAmounts, ({ protocol, route, amount }) => {
        const portion = amount.divide(total);
        const percent = new sdk_core_1.Percent(portion.numerator, portion.denominator);
        /// @dev special case for MIXED routes we want to show user friendly V2+V3 instead
        return `[${protocol == router_sdk_1.Protocol.MIXED ? 'V2 + V3' : protocol}] ${percent.toFixed(2)}% = ${(0, exports.routeToString)(route)}`;
    });
    return lodash_1.default.join(routeStrings, ', ');
};
exports.routeAmountsToString = routeAmountsToString;
const routeAmountToString = (routeAmount) => {
    const { route, amount } = routeAmount;
    return `${amount.toExact()} = ${(0, exports.routeToString)(route)}`;
};
exports.routeAmountToString = routeAmountToString;
const poolToString = (p) => {
    return `${p.token0.symbol}/${p.token1.symbol}${p instanceof v3_sdk_1.Pool ? `/${p.fee / 10000}%` : ``}`;
};
exports.poolToString = poolToString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWwvcm91dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9EQUErQztBQUMvQyxtREFBK0M7QUFDL0MsNENBQXVDO0FBQ3ZDLDRDQUF1QztBQUN2QyxvREFBdUI7QUFLdkIsMkNBQXdEO0FBRXhELHdCQUFtQztBQUU1QixNQUFNLGFBQWEsR0FBRyxDQUMzQixLQUFxQyxFQUM3QixFQUFFO0lBQ1YsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLE1BQU0sTUFBTSxHQUNWLEtBQUssQ0FBQyxRQUFRLEtBQUsscUJBQVEsQ0FBQyxFQUFFO1FBQzVCLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUztRQUNqQixDQUFDLENBQUMsbUNBQW1DO1lBQ3JDLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFDZixNQUFNLFNBQVMsR0FBRyxnQkFBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDOUQsTUFBTSxLQUFLLEdBQ1QsS0FBSyxDQUFDLFFBQVEsS0FBSyxxQkFBUSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLHFCQUFRLENBQUMsS0FBSztRQUNqRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUs7UUFDYixDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztJQUNsQixNQUFNLFdBQVcsR0FBRyxnQkFBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUN4QyxPQUFPLEdBQUcsSUFBSSxZQUFZLGFBQUk7WUFDMUIsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLE1BQU0sYUFBSSxDQUFDLFVBQVUsQ0FDNUMsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMs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