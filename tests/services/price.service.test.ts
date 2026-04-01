import { describe, expect, it } from 'vitest';

import { PriceService } from '@/services/price.service';
import { InMemoryCacheStore } from '@/utils/cache';

describe('PriceService', () => {
  it('returns normalized price data from the provider', async () => {
    const service = new PriceService(
      {
        getPrice: async () => ({
          chain: 'bitcoin',
          chainId: null,
          assetId: 'bitcoin',
          contractAddress: null,
          currency: 'USD',
          priceUsd: '68000',
          source: 'stub-provider',
          updatedAt: '2026-04-01T00:00:00.000Z',
        }),
      },
      new InMemoryCacheStore(),
    );

    const result = await service.getPrice({
      chain: 'bitcoin',
      assetId: 'bitcoin',
    });

    expect(result.price).toBe('68000');
    expect(result.chain).toBe('bitcoin');
    expect(result.chainId).toBeNull();
    expect(result.source).toBe('stub-provider');
  });
});
