import { describe, expect, it } from 'vitest';

import { NewsService } from '@/services/news.service';

describe('NewsService', () => {
  it('resolves query from asset metadata and returns normalized news feed', async () => {
    const service = new NewsService({
      getNews: async (input) => ({
        items: [
          {
            id: 'news-1',
            chain: 'bitcoin',
            chainId: null,
            assetId: 'btc',
            symbol: 'BTC',
            title: 'Bitcoin rises',
            summary: 'Headline summary',
            url: 'https://example.com/bitcoin-rises',
            sourceName: 'Example',
            language: 'en',
            publishedAt: '2026-04-10T00:00:00.000Z',
            imageUrl: null,
            raw: {
              title: 'Bitcoin rises',
            },
          },
        ],
        total: 1,
        limit: input.limit,
        offset: input.offset,
        query: input.resolvedQuery,
        source: 'stub-provider',
        updatedAt: '2026-04-10T00:00:00.000Z',
      }),
    });

    const result = await service.getNews({
      chain: 'bitcoin',
      assetId: 'btc',
      limit: 10,
      offset: 0,
    });

    expect(result.query).toBe('Bitcoin');
    expect(result.items[0]?.title).toBe('Bitcoin rises');
    expect(result.items[0]?.assetId).toBe('btc');
  });

  it('prefers explicit query over inferred asset metadata', async () => {
    const service = new NewsService({
      getNews: async (input) => ({
        items: [],
        total: 0,
        limit: input.limit,
        offset: input.offset,
        query: input.resolvedQuery,
        source: 'stub-provider',
        updatedAt: '2026-04-10T00:00:00.000Z',
      }),
    });

    const result = await service.getNews({
      chain: 'ethereum',
      symbol: 'ETH',
      query: 'Ethereum ETF',
      limit: 5,
      offset: 0,
    });

    expect(result.query).toBe('Ethereum ETF');
  });
});
