import { EVM_CHAIN_IDS } from '@/config/constants';
import type { MarketChart } from '@/domain/market';
import { mapProviderMarketChartToMarketChart } from '@/mappers/market.mapper';
import { CoinGeckoMarketProvider } from '@/providers/market/coingecko.client';
import type { GetMarketChartInput, MarketProvider } from '@/providers/market/market.types';

export class MarketService {
  constructor(private readonly marketProvider: MarketProvider = new CoinGeckoMarketProvider()) {}

  async getMarketChart(input: GetMarketChartInput): Promise<MarketChart> {
    const chart = await this.marketProvider.getMarketChart({
      ...input,
      chainId: input.chain === 'ethereum' ? (input.chainId ?? EVM_CHAIN_IDS.ETHEREUM_MAINNET) : undefined,
    });

    return mapProviderMarketChartToMarketChart(chart);
  }
}
