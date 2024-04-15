import { BigNumber } from '@ethersproject/bignumber';
import { ChainId, TradeType } from '@jaguarswap/sdk-core';
import { IPortionProvider } from '../../../providers/portion-provider';
import { CurrencyAmount } from '../../../util/amounts';
import { SwapOptions } from '../../router';
import { AlphaRouterConfig } from '../alpha-router';
import { RouteWithValidQuote } from './../entities/route-with-valid-quote';
export declare type BestSwapRoute = {
    quote: CurrencyAmount;
    quoteGasAdjusted: CurrencyAmount;
    estimatedGasUsed: BigNumber;
    estimatedGasUsedUSD: CurrencyAmount;
    estimatedGasUsedQuoteToken: CurrencyAmount;
    routes: RouteWithValidQuote[];
};
export declare function getBestSwapRoute(amount: CurrencyAmount, percents: number[], routesWithValidQuotes: RouteWithValidQuote[], routeType: TradeType, chainId: ChainId, routingConfig: AlphaRouterConfig, portionProvider: IPortionProvider, swapConfig?: SwapOptions): Promise<BestSwapRoute | null>;
export declare function getBestSwapRouteBy(routeType: TradeType, percentToQuotes: {
    [percent: number]: RouteWithValidQuote[];
}, percents: number[], chainId: ChainId, by: (routeQuote: RouteWithValidQuote) => CurrencyAmount, routingConfig: AlphaRouterConfig, portionProvider: IPortionProvider, swapConfig?: SwapOptions): Promise<BestSwapRoute | undefined>;
