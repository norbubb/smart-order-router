import { ChainId } from '@jaguarswap/sdk-core';

import { AlphaRouterConfig, LowerCaseStringArray } from './alpha-router';

export const DEFAULT_ROUTING_CONFIG_BY_CHAIN = (
  chainId: ChainId
): AlphaRouterConfig => {
  switch (chainId) {
    default:
      return {
        v2PoolSelection: {
          topN: 3,
          topNDirectSwaps: 1,
          topNTokenInOut: 5,
          topNSecondHop: 2,
          tokensToAvoidOnSecondHops: new LowerCaseStringArray(
            '0xd46ba6d942050d489dbd938a2c909a5d5039a161' // AMPL on Mainnet
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
export const ETH_GAS_STATION_API_URL =
  'https://ethgasstation.info/api/ethgasAPI.json';
