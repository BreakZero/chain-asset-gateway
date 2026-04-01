import { ASSET_TYPES, CHAINS } from '@/config/constants';
import type { Asset } from '@/domain/asset';
import type { Balance } from '@/domain/balance';
import type { EvmTokenMetadata } from '@/providers/evm/evm.types';
import { formatTokenAmount, multiplyDecimalStrings } from '@/utils/amount';

export interface NativeEthereumBalanceMapperInput {
  chainId: number;
  address: string;
  rawBalance: bigint;
  priceUsd: string | null;
  updatedAt: string;
  source: string;
}

export const mapNativeEthereumBalance = (input: NativeEthereumBalanceMapperInput): Balance => {
  const asset: Asset = {
    chain: CHAINS.ETHEREUM,
    chainId: input.chainId,
    network: input.chainId === 11155111 ? 'testnet' : 'mainnet',
    assetType: ASSET_TYPES.NATIVE,
    assetId: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    contractAddress: null,
    decimals: 18,
    status: 'active',
    source: input.source,
    updatedAt: input.updatedAt,
  };

  const formatted = formatTokenAmount(input.rawBalance, 18);

  return {
    chain: CHAINS.ETHEREUM,
    chainId: input.chainId,
    address: input.address,
    asset,
    amount: {
      raw: input.rawBalance.toString(),
      formatted,
      decimals: 18,
    },
    priceUsd: input.priceUsd,
    valueUsd: input.priceUsd ? multiplyDecimalStrings(formatted, input.priceUsd) : null,
    source: input.source,
    updatedAt: input.updatedAt,
  };
};

export interface Erc20EthereumBalanceMapperInput {
  chainId: number;
  address: string;
  rawBalance: bigint;
  metadata: EvmTokenMetadata;
  priceUsd: string | null;
  updatedAt: string;
  source: string;
}

export const mapErc20EthereumBalance = (input: Erc20EthereumBalanceMapperInput): Balance => {
  const asset: Asset = {
    chain: CHAINS.ETHEREUM,
    chainId: input.chainId,
    network: input.chainId === 11155111 ? 'testnet' : 'mainnet',
    assetType: ASSET_TYPES.ERC20,
    assetId: input.metadata.contractAddress,
    symbol: input.metadata.symbol,
    name: input.metadata.name,
    contractAddress: input.metadata.contractAddress,
    decimals: input.metadata.decimals,
    status: 'active',
    source: input.source,
    updatedAt: input.updatedAt,
  };

  const formatted = formatTokenAmount(input.rawBalance, input.metadata.decimals);

  return {
    chain: CHAINS.ETHEREUM,
    chainId: input.chainId,
    address: input.address,
    asset,
    amount: {
      raw: input.rawBalance.toString(),
      formatted,
      decimals: input.metadata.decimals,
    },
    priceUsd: input.priceUsd,
    valueUsd: input.priceUsd ? multiplyDecimalStrings(formatted, input.priceUsd) : null,
    source: input.source,
    updatedAt: input.updatedAt,
  };
};
