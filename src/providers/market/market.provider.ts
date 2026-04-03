import type { AxiosInstance } from 'axios';
import axios from 'axios';

import { CHAINS, CURRENCIES, EVM_CHAIN_IDS } from '@/config/constants';
import { env } from '@/config/env';
import type {
  GetMarketChartInput,
  GetPriceInput,
  MarketProvider,
  ProviderMarketChart,
  ProviderPriceQuote,
} from '@/providers/market/market.types';
import { AppError } from '@/utils/app-error';
import { nowIso } from '@/utils/time';

const COINGECKO_PLATFORM = 'ethereum';
const COINGECKO_NATIVE_IDS = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
} as const;

export class CoinGeckoMarketProvider implements MarketProvider {
  private readonly client: AxiosInstance;

  constructor(client?: AxiosInstance) {
    this.client =
      client ??
      axios.create({
        baseURL: env.COINGECKO_BASE_URL,
        timeout: 10_000,
        headers: env.COINGECKO_API_KEY
          ? {
              'x-cg-demo-api-key': env.COINGECKO_API_KEY,
            }
          : undefined,
      });
  }

  async getPrice(input: GetPriceInput): Promise<ProviderPriceQuote> {
    if (input.chain === CHAINS.ETHEREUM && input.chainId === EVM_CHAIN_IDS.ETHEREUM_SEPOLIA && input.contractAddress) {
      throw new AppError(
        'Sepolia ERC20 market prices are not supported in this MVP',
        501,
        'TESTNET_PRICE_UNSUPPORTED',
        input,
      );
    }

    if (input.contractAddress) {
      return this.getTokenPrice(input.contractAddress, input.chainId ?? EVM_CHAIN_IDS.ETHEREUM_MAINNET);
    }

    const resolvedAssetId = this.resolveAssetId(input);

    const response = await this.client.get<Record<string, { usd?: number }>>('/simple/price', {
      params: {
        ids: resolvedAssetId,
        vs_currencies: 'usd',
      },
    });

    const usdPrice = response.data[resolvedAssetId]?.usd;
    if (usdPrice === undefined) {
      throw new AppError('Price not found', 404, 'PRICE_NOT_FOUND', input);
    }

    return {
      chain: input.chain,
      chainId:
        input.chain === CHAINS.ETHEREUM ? (input.chainId ?? EVM_CHAIN_IDS.ETHEREUM_MAINNET) : null,
      assetId: resolvedAssetId,
      contractAddress: null,
      currency: CURRENCIES.USD,
      priceUsd: String(usdPrice),
      source: 'coingecko',
      updatedAt: nowIso(),
    };
  }

  async getMarketChart(input: GetMarketChartInput): Promise<ProviderMarketChart> {
    if (input.chain === CHAINS.ETHEREUM && input.chainId === EVM_CHAIN_IDS.ETHEREUM_SEPOLIA && input.contractAddress) {
      throw new AppError(
        'Sepolia ERC20 market chart data is not supported in this MVP',
        501,
        'TESTNET_MARKET_CHART_UNSUPPORTED',
        input,
      );
    }

    if (input.contractAddress) {
      const response = await this.client.get<{ prices?: [number, number][] }>(
        `/coins/${COINGECKO_NATIVE_IDS.ethereum}/contract/${input.contractAddress.toLowerCase()}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: input.days,
            interval: input.interval === 'daily' ? 'daily' : undefined,
          },
        },
      );

      return {
        chain: CHAINS.ETHEREUM,
        chainId: input.chainId ?? EVM_CHAIN_IDS.ETHEREUM_MAINNET,
        assetId: input.contractAddress.toLowerCase(),
        contractAddress: input.contractAddress.toLowerCase(),
        currency: CURRENCIES.USD,
        interval: input.interval,
        days: input.days,
        candles: this.mapPricePointsToCandles(response.data.prices ?? [], input.interval),
        source: 'coingecko',
        updatedAt: nowIso(),
      };
    }

    const resolvedAssetId = this.resolveAssetId(input);
    const response = await this.client.get<{ prices?: [number, number][] }>(`/coins/${resolvedAssetId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: input.days,
        interval: input.interval === 'daily' ? 'daily' : undefined,
      },
    });

    return {
      chain: input.chain,
      chainId:
        input.chain === CHAINS.ETHEREUM ? (input.chainId ?? EVM_CHAIN_IDS.ETHEREUM_MAINNET) : null,
      assetId: resolvedAssetId,
      contractAddress: null,
      currency: CURRENCIES.USD,
      interval: input.interval,
      days: input.days,
      candles: this.mapPricePointsToCandles(response.data.prices ?? [], input.interval),
      source: 'coingecko',
      updatedAt: nowIso(),
    };
  }

  private async getTokenPrice(contractAddress: string, chainId: number): Promise<ProviderPriceQuote> {
    const response = await this.client.get<Record<string, { usd?: number }>>(
      `/simple/token_price/${COINGECKO_PLATFORM}`,
      {
        params: {
          contract_addresses: contractAddress,
          vs_currencies: 'usd',
        },
      },
    );

    const usdPrice = response.data[contractAddress.toLowerCase()]?.usd;
    if (usdPrice === undefined) {
      throw new AppError('Token price not found', 404, 'PRICE_NOT_FOUND', {
        chain: CHAINS.ETHEREUM,
        contractAddress,
      });
    }

    return {
      chain: CHAINS.ETHEREUM,
      chainId,
      assetId: contractAddress.toLowerCase(),
      contractAddress: contractAddress.toLowerCase(),
      currency: CURRENCIES.USD,
      priceUsd: String(usdPrice),
      source: 'coingecko',
      updatedAt: nowIso(),
    };
  }

  private resolveAssetId(input: GetPriceInput): string {
    if (input.assetId) {
      return input.assetId.toLowerCase();
    }

    if (input.symbol) {
      const symbol = input.symbol.toLowerCase();
      if (symbol === 'btc') {
        return COINGECKO_NATIVE_IDS.bitcoin;
      }

      if (symbol === 'eth') {
        return COINGECKO_NATIVE_IDS.ethereum;
      }
    }

    if (input.chain === CHAINS.BITCOIN) {
      return COINGECKO_NATIVE_IDS.bitcoin;
    }

    return COINGECKO_NATIVE_IDS.ethereum;
  }

  private mapPricePointsToCandles(
    points: [number, number][],
    interval: 'hourly' | 'daily',
  ): ProviderMarketChart['candles'] {
    const buckets = new Map<number, number[]>();
    const bucketMs = interval === 'daily' ? 86_400_000 : 3_600_000;

    for (const [timestamp, price] of points) {
      const bucketStart = Math.floor(timestamp / bucketMs) * bucketMs;
      const bucket = buckets.get(bucketStart) ?? [];
      bucket.push(price);
      buckets.set(bucketStart, bucket);
    }

    return Array.from(buckets.entries())
      .sort((left, right) => left[0] - right[0])
      .map(([bucketStart, prices]) => ({
        openTime: new Date(bucketStart).toISOString(),
        closeTime: new Date(bucketStart + bucketMs).toISOString(),
        open: String(prices[0]),
        high: String(Math.max(...prices)),
        low: String(Math.min(...prices)),
        close: String(prices[prices.length - 1]),
      }));
  }
}
