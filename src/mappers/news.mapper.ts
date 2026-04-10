import type { NewsArticle, NewsFeed } from '@/domain/news';
import type { ProviderNewsFeed } from '@/providers/news/news.types';

export const mapProviderNewsFeedToNewsFeed = (input: ProviderNewsFeed): NewsFeed => ({
  items: input.items.map<NewsArticle>((item) => ({
    id: item.id,
    chain: item.chain,
    chainId: item.chainId,
    assetId: item.assetId,
    symbol: item.symbol,
    title: item.title,
    summary: item.summary,
    url: item.url,
    sourceName: item.sourceName,
    language: item.language,
    publishedAt: item.publishedAt,
    imageUrl: item.imageUrl,
    raw: item.raw,
  })),
  limit: input.limit,
  offset: input.offset,
  source: input.source
});
