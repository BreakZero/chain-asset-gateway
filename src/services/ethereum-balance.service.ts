import { DEFAULT_CACHE_TTL_MS } from '@/config/constants';
import { EVM_CHAIN_IDS } from '@/config/constants';
import type { Balance } from '@/domain/balance';
import { mapErc20EthereumBalance, mapNativeEthereumBalance } from '@/mappers/balance.mapper';
import { ViemEvmProvider } from '@/providers/evm/evm.provider';
import type { EvmProvider } from '@/providers/evm/evm.types';
import { PriceService } from '@/services/price.service';
import { InMemoryCacheStore, type CacheStore } from '@/utils/cache';
import { nowIso } from '@/utils/time';

export class EthereumBalanceService {
  constructor(
    private readonly chainId = EVM_CHAIN_IDS.ETHEREUM_MAINNET,
    private readonly evmProvider: EvmProvider = new ViemEvmProvider(chainId),
    private readonly priceService: PriceService = new PriceService(),
    private readonly cache: CacheStore = new InMemoryCacheStore(),
  ) {}

  async getNativeBalance(address: string, includePrice = true): Promise<Balance> {
    const cacheKey = `eth-balance:${this.chainId}:${address.toLowerCase()}:${includePrice}`;
    const cached = this.cache.get<Balance>(cacheKey);

    if (cached) {
      return cached;
    }

    const [rawBalance, price] = await Promise.all([
      this.evmProvider.getNativeBalance(address),
      includePrice
        ? this.priceService.getPrice({
            chain: 'ethereum',
            chainId: this.chainId,
            assetId: 'ethereum',
          })
        : Promise.resolve(null),
    ]);

    const balance = mapNativeEthereumBalance({
      chainId: this.chainId,
      address: address.toLowerCase(),
      rawBalance,
      priceUsd: price?.price ?? null,
      updatedAt: nowIso(),
      source: 'ethereum-rpc',
    });

    this.cache.set(cacheKey, balance, DEFAULT_CACHE_TTL_MS.BALANCE);

    return balance;
  }

  async getErc20Balance(address: string, contractAddress: string, includePrice = true): Promise<Balance> {
    const normalizedAddress = address.toLowerCase();
    const normalizedContractAddress = contractAddress.toLowerCase();
    const cacheKey = `erc20-balance:${this.chainId}:${normalizedAddress}:${normalizedContractAddress}:${includePrice}`;
    const cached = this.cache.get<Balance>(cacheKey);

    if (cached) {
      return cached;
    }

    const [metadata, rawBalance] = await Promise.all([
      this.evmProvider.getErc20Metadata(normalizedContractAddress),
      this.evmProvider.getErc20Balance(normalizedAddress, normalizedContractAddress),
    ]);

    const price = includePrice
        ? await this.priceService.getPrice({
            chain: 'ethereum',
            chainId: this.chainId,
            contractAddress: normalizedContractAddress,
          })
      : null;

    const balance = mapErc20EthereumBalance({
      chainId: this.chainId,
      address: normalizedAddress,
      rawBalance,
      metadata,
      priceUsd: price?.price ?? null,
      updatedAt: nowIso(),
      source: 'ethereum-rpc',
    });

    this.cache.set(cacheKey, balance, DEFAULT_CACHE_TTL_MS.BALANCE);

    return balance;
  }
}
