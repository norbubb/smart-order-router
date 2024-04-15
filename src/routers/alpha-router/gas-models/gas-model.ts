import { BigNumber } from '@ethersproject/bignumber';
import { ChainId, Token } from '@jaguarswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';

import { ProviderConfig } from '../../../providers/provider';
import {
  DAI_X1,
  USDC_X1,
  USDT_X1,
  DAI_X1_TESTNET,
  USDC_X1_TESTNET,
  USDT_X1_TESTNET,
} from '../../../providers/token-provider';
import { IV2PoolProvider } from '../../../providers/v2/pool-provider';
import { CurrencyAmount } from '../../../util/amounts';
import {
  MixedRouteWithValidQuote,
  RouteWithValidQuote,
  V2RouteWithValidQuote,
  V3RouteWithValidQuote,
} from '../entities/route-with-valid-quote';

// When adding new usd gas tokens, ensure the tokens are ordered
// from tokens with highest decimals to lowest decimals. For example,
// DAI_AVAX has 18 decimals and comes before USDC_AVAX which has 6 decimals.
export const usdGasTokensByChain: { [chainId in ChainId]?: Token[] } = {
  [ChainId.X1]: [DAI_X1, USDC_X1, USDT_X1],
  [ChainId.X1_TESTNET]: [USDC_X1_TESTNET, USDT_X1_TESTNET, DAI_X1_TESTNET],
};

export type L1ToL2GasCosts = {
  gasUsedL1: BigNumber;
  gasCostL1USD: CurrencyAmount;
  gasCostL1QuoteToken: CurrencyAmount;
};

export type BuildOnChainGasModelFactoryType = {
  chainId: ChainId;
  gasPriceWei: BigNumber;
  pools: LiquidityCalculationPools;
  amountToken: Token;
  quoteToken: Token;
  v2poolProvider: IV2PoolProvider;
  l2GasDataProvider?: null;
  providerConfig?: ProviderConfig;
};

export type BuildV2GasModelFactoryType = {
  chainId: ChainId;
  gasPriceWei: BigNumber;
  poolProvider: IV2PoolProvider;
  token: Token;
  providerConfig?: ProviderConfig;
};

export type LiquidityCalculationPools = {
  usdPool: Pool;
  nativeQuoteTokenV3Pool: Pool | null;
  nativeAmountTokenV3Pool: Pool | null;
};

/**
 * Contains functions for generating gas estimates for given routes.
 *
 * We generally compute gas estimates off-chain because
 *  1/ Calling eth_estimateGas for a swaps requires the caller to have
 *     the full balance token being swapped, and approvals.
 *  2/ Tracking gas used using a wrapper contract is not accurate with Multicall
 *     due to EIP-2929
 *  3/ For V2 we simulate all our swaps off-chain so have no way to track gas used.
 *
 * Generally these models should be optimized to return quickly by performing any
 * long running operations (like fetching external data) outside of the functions defined.
 * This is because the functions in the model are called once for every route and every
 * amount that is considered in the algorithm so it is important to minimize the number of
 * long running operations.
 */
export type IGasModel<TRouteWithValidQuote extends RouteWithValidQuote> = {
  estimateGasCost(routeWithValidQuote: TRouteWithValidQuote): {
    gasEstimate: BigNumber;
    gasCostInToken: CurrencyAmount;
    gasCostInUSD: CurrencyAmount;
  };
};

/**
 * Factory for building gas models that can be used with any route to generate
 * gas estimates.
 *
 * Factory model is used so that any supporting data can be fetched once and
 * returned as part of the model.
 *
 * @export
 * @abstract
 * @class IV2GasModelFactory
 */
export abstract class IV2GasModelFactory {
  public abstract buildGasModel({
    chainId,
    gasPriceWei,
    poolProvider,
    token,
    providerConfig,
  }: BuildV2GasModelFactoryType): Promise<IGasModel<V2RouteWithValidQuote>>;
}

/**
 * Factory for building gas models that can be used with any route to generate
 * gas estimates.
 *
 * Factory model is used so that any supporting data can be fetched once and
 * returned as part of the model.
 *
 * @export
 * @abstract
 * @class IOnChainGasModelFactory
 */
export abstract class IOnChainGasModelFactory {
  public abstract buildGasModel({
    chainId,
    gasPriceWei,
    pools: LiquidityCalculationPools,
    amountToken,
    quoteToken,
    v2poolProvider: V2poolProvider,
    l2GasDataProvider,
    providerConfig,
  }: BuildOnChainGasModelFactoryType): Promise<
    IGasModel<V3RouteWithValidQuote | MixedRouteWithValidQuote>
  >;
}
