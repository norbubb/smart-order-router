import {
  ChainId,
  CHAIN_TO_ADDRESSES_MAP,
  SWAP_ROUTER_02_ADDRESSES as SWAP_ROUTER_02_ADDRESSES_HELPER,
  Token,
} from '@jaguarswap/sdk-core';
import { FACTORY_ADDRESS } from '@uniswap/v3-sdk';

import { NETWORKS_WITH_SAME_UNISWAP_ADDRESSES } from './chains';
export const MIXED_ROUTE_QUOTER_V1_ADDRESSES: AddressMap = {};

export const QUOTER_V2_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0x61fFE014bA17989E743c5F6cB21bF9697530B21e'),
  [ChainId.X1]: CHAIN_TO_ADDRESSES_MAP[ChainId.X1].quoterAddress,
  [ChainId.X1_TESTNET]:
    CHAIN_TO_ADDRESSES_MAP[ChainId.X1_TESTNET].quoterAddress,
};
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...constructSameAddressMap(FACTORY_ADDRESS),
  [ChainId.X1]: CHAIN_TO_ADDRESSES_MAP[ChainId.X1].v3CoreFactoryAddress,
  [ChainId.X1_TESTNET]:
    CHAIN_TO_ADDRESSES_MAP[ChainId.X1_TESTNET].v3CoreFactoryAddress,
};
export const UNISWAP_MULTICALL_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0x1F98415757620B543A52E61c46B32eB19261F984'),
  [ChainId.X1]: CHAIN_TO_ADDRESSES_MAP[ChainId.X1].multicallAddress,
  [ChainId.X1_TESTNET]:
    CHAIN_TO_ADDRESSES_MAP[ChainId.X1_TESTNET].multicallAddress,
};

export const SWAP_ROUTER_02_ADDRESSES = (chainId: number): string => {
  return (
    SWAP_ROUTER_02_ADDRESSES_HELPER(chainId) ??
    '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
  );
};

export const OVM_GASPRICE_ADDRESS =
  '0x420000000000000000000000000000000000000F';
export const ARB_GASINFO_ADDRESS = '0x000000000000000000000000000000000000006C';
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS =
  CHAIN_TO_ADDRESSES_MAP[ChainId.X1].nonfungiblePositionManagerAddress;
export const V3_MIGRATOR_ADDRESS =
  CHAIN_TO_ADDRESSES_MAP[ChainId.X1].v3MigratorAddress;
export const MULTICALL2_ADDRESS = '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696';

export type AddressMap = { [chainId: number]: string | undefined };

export function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks: ChainId[] = []
): { [chainId: number]: T } {
  return NETWORKS_WITH_SAME_UNISWAP_ADDRESSES.concat(
    additionalNetworks
  ).reduce<{
    [chainId: number]: T;
  }>((memo, chainId) => {
    memo[chainId] = address;
    return memo;
  }, {});
}

export const WETH9: {
  [chainId in Exclude<ChainId, ChainId.X1 | ChainId.X1_TESTNET>]: Token;
} = {
  // FIXME： 替换 WETH 地址
  [ChainId.X1]: new Token(
    ChainId.X1,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [ChainId.X1_TESTNET]: new Token(
    ChainId.X1_TESTNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
  ),
};
