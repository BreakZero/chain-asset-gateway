import { DEFAULT_CACHE_TTL_MS } from '@/config/constants';
import type { Balance } from '@/domain/balance';
import { BitcoinIndexerProvider } from '@/providers/bitcoin/bitcoin-indexer.provider';
import type { BitcoinAddressProvider } from '@/providers/bitcoin/bitcoin.types';
import { PriceService } from '@/services/price.service';
import { InMemoryCacheStore, type CacheStore } from '@/utils/cache';
import { formatTokenAmount, multiplyDecimalStrings, parseTokenAmount } from '@/utils/amount';
import { nowIso } from '@/utils/time';

export class BitcoinBalanceService {
  constructor(
    private readonly bitcoinAddressProvider: BitcoinAddressProvider = new BitcoinIndexerProvider(),
    private readonly priceService: PriceService = new PriceService(),
    private readonly cache: CacheStore = new InMemoryCacheStore(),
  ) {}

  async getNativeBalance(address: string, includePrice = true): Promise<Balance> {
    const normalizedAddress = address.trim();
    const cacheKey = `btc-balance:${normalizedAddress}:${includePrice}`;
    const cached = this.cache.get<Balance>(cacheKey);

    if (cached) {
      return cached;
    }

    const [balanceData, price] = await Promise.all([
      this.bitcoinAddressProvider.getAddressBalance(normalizedAddress),
      includePrice
        ? this.priceService.getPrice({
            chain: 'bitcoin',
            assetId: 'bitcoin',
          })
        : Promise.resolve(null),
    ]);

    const rawBalance = parseTokenAmount(balanceData.totalAmountBtc, 8);
    const updatedAt = nowIso();
    const formatted = formatTokenAmount(rawBalance, 8);

    const result: Balance = {
      chain: 'bitcoin',
      chainId: null,
      address: normalizedAddress,
      asset: {
        chain: 'bitcoin',
        chainId: null,
        network: 'mainnet',
        assetType: 'native',
        assetId: 'btc',
        symbol: 'BTC',
        name: 'Bitcoin',
        logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        contractAddress: null,
        decimals: 8,
        status: 'active',
        source: 'bitcoin-rpc',
        updatedAt,
      },
      amount: {
        raw: rawBalance.toString(),
        formatted,
        decimals: 8,
      },
      priceUsd: price?.price ?? null,
      valueUsd: price?.price ? multiplyDecimalStrings(formatted, price.price) : null,
      source: 'bitcoin-rpc',
      updatedAt,
    };

    this.cache.set(cacheKey, result, DEFAULT_CACHE_TTL_MS.BALANCE);

    return result;
  }
}
