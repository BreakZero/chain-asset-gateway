import { describe, expect, it } from 'vitest';

import { mapProviderMarketChartToMarketChart } from '@/mappers/market.mapper';

describe('mapProviderMarketChartToMarketChart', () => {
  it('maps provider chart data into normalized candles', () => {
    const result = mapProviderMarketChartToMarketChart({
      chain: 'ethereum',
      chainId: 1,
      assetId: 'ethereum',
      contractAddress: null,
      currency: 'USD',
      interval: 'daily',
      days: 7,
      candles: [
        {
          openTime: '2026-04-01T00:00:00.000Z',
          closeTime: '2026-04-02T00:00:00.000Z',
          open: '100',
          high: '120',
          low: '90',
          close: '110',
        },
      ],
      source: 'coingecko',
      updatedAt: '2026-04-02T00:00:00.000Z',
    });

    expect(result.chain).toBe('ethereum');
    expect(result.interval).toBe('daily');
    expect(result.candles[0]?.high).toBe('120');
  });
});
