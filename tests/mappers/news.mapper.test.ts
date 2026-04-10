import { describe, expect, it } from 'vitest';

import { mapProviderNewsFeedToNewsFeed } from '@/mappers/news.mapper';

describe('mapProviderNewsFeedToNewsFeed', () => {
  it('maps provider news feed into domain news feed', () => {
    const result = mapProviderNewsFeedToNewsFeed({
      items: [
        {
          id: 'article-1',
          chain: 'bitcoin',
          chainId: null,
          assetId: 'btc',
          symbol: 'BTC',
          title: 'Bitcoin ETF headlines',
          summary: 'Summary',
          url: 'https://example.com/news/1',
          sourceName: 'Example',
          language: 'en',
          publishedAt: '2026-04-10T00:00:00.000Z',
          imageUrl: null,
          raw: {
            id: 'article-1',
          },
        },
      ],
      total: 1,
      limit: 10,
      offset: 0,
      query: 'Bitcoin',
      source: 'blockchair',
      updatedAt: '2026-04-10T00:00:00.000Z',
    });

    expect(result.query).toBe('Bitcoin');
    expect(result.items[0]?.sourceName).toBe('Example');
    expect(result.items[0]?.raw).toEqual({ id: 'article-1' });
  });
});
