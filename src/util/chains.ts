import {
  ChainId,
  Currency,
  Ether,
  NativeCurrency,
  Token,
} from '@jaguarswap/sdk-core';

// WIP: Gnosis, Moonbeam
export const SUPPORTED_CHAINS: ChainId[] = [
  ChainId.X1,
  ChainId.X1_TESTNET,
  // Gnosis and Moonbeam don't yet have contracts deployed yet
];

export const V2_SUPPORTED = [];

export const HAS_L1_FEE = [];

export const NETWORKS_WITH_SAME_UNISWAP_ADDRESSES: ChainId[] = [];

export const ID_TO_CHAIN_ID = (id: number): ChainId => {
  switch (id) {
    case 196:
      return ChainId.X1;
    case 195:
      return ChainId.X1_TESTNET;
    default:
      throw new Error(`Unknown chain id: ${id}`);
  }
};

export enum ChainName {
  X1 = 'x1',
  X1_TESTNET = 'x1-testnet',
}

export enum NativeCurrencyName {
  // Strings match input for CLI
  ETHER = 'ETH',
  MATIC = 'MATIC',
  CELO = 'CELO',
  GNOSIS = 'XDAI',
  MOONBEAM = 'GLMR',
  BNB = 'BNB',
  AVALANCHE = 'AVAX',
  OKB = 'OKB',
}

export const NATIVE_NAMES_BY_ID: { [chainId: number]: string[] } = {
  [ChainId.X1]: ['OKB', 'OKB', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'],
  [ChainId.X1_TESTNET]: [
    'OKB',
    'OKB',
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ],
};

export const NATIVE_CURRENCY: { [chainId: number]: NativeCurrencyName } = {
  [ChainId.X1_TESTNET]: NativeCurrencyName.OKB,
};

export const ID_TO_NETWORK_NAME = (id: number): ChainName => {
  switch (id) {
    case 195:
      return ChainName.X1_TESTNET;
    default:
      throw new Error(`Unknown chain id: ${id}`);
  }
};

export const CHAIN_IDS_LIST = Object.values(ChainId).map((c) =>
  c.toString()
) as string[];

export const ID_TO_PROVIDER = (id: ChainId): string => {
  switch (id) {
    case ChainId.X1_TESTNET:
      return process.env.JSON_RPC_PROVIDER_X1TESTNET!;
    default:
      throw new Error(`Chain id: ${id} not supported`);
  }
};

export const WRAPPED_NATIVE_CURRENCY: { [chainId in ChainId]: Token } = {
  [ChainId.X1]: new Token(
    ChainId.X1,
    '0xee1a9629cce8f26deb1ecffbd8f306bef2117423',
    18,
    'WOKB',
    'Wrapped OKB'
  ),
  [ChainId.X1_TESTNET]: new Token(
    ChainId.X1_TESTNET,
    '0xee1a9629cce8f26deb1ecffbd8f306bef2117423',
    18,
    'WOKB',
    'Wrapped OKB'
  ),
};

function isX1(chainId: number): chainId is ChainId.X1 {
  return chainId === ChainId.X1;
}

class X1NativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    if (!isX1(this.chainId)) throw new Error('Not X1');
    const nativeCurrency = WRAPPED_NATIVE_CURRENCY[this.chainId];
    if (nativeCurrency) {
      return nativeCurrency;
    }
    throw new Error(`Does not support this chain ${this.chainId}`);
  }

  public constructor(chainId: number) {
    if (!isX1Testnet(chainId)) throw new Error('Not X1 Testnet');
    super(chainId, 18, 'OKB', 'X1Layer');
  }
}

function isX1Testnet(chainId: number): chainId is ChainId.X1_TESTNET {
  return chainId === ChainId.X1_TESTNET;
}

class X1TestnetNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    if (!isX1Testnet(this.chainId)) throw new Error('Not X1 Testnet');
    const nativeCurrency = WRAPPED_NATIVE_CURRENCY[this.chainId];
    if (nativeCurrency) {
      return nativeCurrency;
    }
    throw new Error(`Does not support this chain ${this.chainId}`);
  }

  public constructor(chainId: number) {
    if (!isX1Testnet(chainId)) throw new Error('Not X1 Testnet');
    super(chainId, 18, 'OKB', 'X1Layer');
  }
}
export class ExtendedEther extends Ether {
  public get wrapped(): Token {
    if (this.chainId in WRAPPED_NATIVE_CURRENCY) {
      return WRAPPED_NATIVE_CURRENCY[this.chainId as ChainId];
    }
    throw new Error('Unsupported chain ID');
  }

  private static _cachedExtendedEther: { [chainId: number]: NativeCurrency } =
    {};

  public static onChain(chainId: number): ExtendedEther {
    return (
      this._cachedExtendedEther[chainId] ??
      (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId))
    );
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency } = {};

export function nativeOnChain(chainId: number): NativeCurrency {
  if (cachedNativeCurrency[chainId] != undefined) {
    return cachedNativeCurrency[chainId]!;
  }
  if (isX1(chainId)) {
    cachedNativeCurrency[chainId] = new X1NativeCurrency(chainId);
  } else if (isX1Testnet(chainId)) {
    cachedNativeCurrency[chainId] = new X1TestnetNativeCurrency(chainId);
  } else {
    cachedNativeCurrency[chainId] = ExtendedEther.onChain(chainId);
  }

  return cachedNativeCurrency[chainId]!;
}
