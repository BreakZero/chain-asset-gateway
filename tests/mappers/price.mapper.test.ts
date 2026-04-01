import { describe, expect, it } from 'vitest';

import { mapProviderPriceToPrice } from '@/mappers/price.mapper';

describe('mapProviderPriceToPrice', () => {
  it('maps provider price quotes into normalized price objects', () => {
    const result = mapProviderPriceToPrice({
      chain: 'ethereum',
      chainId: 1,
      assetId: 'ethereum',
      contractAddress: null,
      currency: 'USD',
      priceUsd: '3200.12',
      source: 'coingecko',
      updatedAt: '2026-04-01T00:00:00.000Z',
    });

    expect(result).toEqual({
      chain: 'ethereum',
      chainId: 1,
      assetId: 'ethereum',
      contractAddress: null,
      currency: 'USD',
      price: '3200.12',
      source: 'coingecko',
      updatedAt: '2026-04-01T00:00:00.000Z',
    });
  });
});
