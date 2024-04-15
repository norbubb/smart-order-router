import { Trade } from '@uniswap/router-sdk';
import { type ChainId, type Currency, TradeType } from '@jaguarswap/sdk-core';
import { type MethodParameters, type RouteWithValidQuote, type SwapOptions } from '..';
export declare function buildTrade<TTradeType extends TradeType>(tokenInCurrency: Currency, tokenOutCurrency: Currency, tradeType: TTradeType, routeAmounts: RouteWithValidQuote[]): Trade<Currency, Currency, TTradeType>;
export declare function buildSwapMethodParameters(trade: Trade<Currency, Currency, TradeType>, swapConfig: SwapOptions, chainId: ChainId): MethodParameters;
