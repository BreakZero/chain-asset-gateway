import { describe, expect, it } from 'vitest';

import { MarketService } from '@/services/market.service';

describe('MarketService', () => {
  it('returns normalized market chart data from the provider', async () => {
    const service = new MarketService({
      getPrice: async () => {
        throw new Error('not used');
      },
      getMarketChart: async () => ({
        chain: 'bitcoin',
        chainId: null,
        assetId: 'bitcoin',
        contractAddress: null,
        currency: 'USD',
        interval: 'daily',
        days: 7,
        candles: [
          {
            openTime: '2026-04-01T00:00:00.000Z',
            closeTime: '2026-04-02T00:00:00.000Z',
            open: '68000',
            high: '69000',
            low: '67000',
            close: '68500',
          },
        ],
        source: 'stub-provider',
        updatedAt: '2026-04-02T00:00:00.000Z',
      }),
    });

    const result = await service.getMarketChart({
      chain: 'bitcoin',
      assetId: 'bitcoin',
      days: 7,
      interval: 'daily',
    });

    expect(result.assetId).toBe('bitcoin');
    expect(result.candles).toHaveLength(1);
    expect(result.candles[0]?.close).toBe('68500');
  });
});
