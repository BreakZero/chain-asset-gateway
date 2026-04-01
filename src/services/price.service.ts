import { DEFAULT_CACHE_TTL_MS } from '@/config/constants';
import type { Price } from '@/domain/price';
import { mapProviderPriceToPrice } from '@/mappers/price.mapper';
import { CoinGeckoMarketProvider } from '@/providers/market/coingecko.client';
import type { GetPriceInput, MarketProvider } from '@/providers/market/market.types';
import { InMemoryCacheStore, type CacheStore } from '@/utils/cache';

export class PriceService {
  constructor(
    private readonly marketProvider: MarketProvider = new CoinGeckoMarketProvider(),
    private readonly cache: CacheStore = new InMemoryCacheStore(),
  ) {}

  async getPrice(input: GetPriceInput): Promise<Price> {
    const cacheKey = `price:${input.chain}:${input.chainId ?? 'null'}:${input.assetId ?? ''}:${input.symbol ?? ''}:${input.contractAddress ?? ''}`;
    const cached = this.cache.get<Price>(cacheKey);

    if (cached) {
      return cached;
    }

    const quote = await this.marketProvider.getPrice(input);
    const price = mapProviderPriceToPrice(quote);

    this.cache.set(cacheKey, price, DEFAULT_CACHE_TTL_MS.PRICE);

    return price;
  }
}
