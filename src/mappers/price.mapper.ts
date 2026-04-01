import { ASSET_TYPES } from '@/config/constants';
import type { Price } from '@/domain/price';
import type { ProviderPriceQuote } from '@/providers/market/market.types';

export const mapProviderPriceToPrice = (quote: ProviderPriceQuote): Price => ({
  chain: quote.chain,
  chainId: quote.chainId,
  assetId: quote.assetId,
  contractAddress: quote.contractAddress,
  currency: quote.currency,
  price: quote.priceUsd,
  source: quote.source,
  updatedAt: quote.updatedAt,
});

export const inferAssetTypeFromPrice = (price: Price): 'native' | 'erc20' =>
  price.contractAddress ? ASSET_TYPES.ERC20 : ASSET_TYPES.NATIVE;
