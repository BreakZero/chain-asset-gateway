import type { MarketCandle, MarketChart } from '@/domain/market';
import type { ProviderMarketChart } from '@/providers/market/market.types';

export const mapProviderMarketChartToMarketChart = (input: ProviderMarketChart): MarketChart => ({
  chain: input.chain,
  chainId: input.chainId,
  assetId: input.assetId,
  contractAddress: input.contractAddress,
  currency: input.currency,
  interval: input.interval,
  days: input.days,
  candles: input.candles.map<MarketCandle>((candle) => ({
    openTime: candle.openTime,
    closeTime: candle.closeTime,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  })),
  source: input.source,
  updatedAt: input.updatedAt,
});
