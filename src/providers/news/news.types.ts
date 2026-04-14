import type { ChainId } from '@/domain/asset';

export interface GetNewsInput {
  chain?: ChainId;
  chainId?: number;
  assetId?: string;
  symbol?: string;
  contractAddress?: string;
  query?: string;
  rawQuery?: string;
  limit: number;
  offset: number;
}

export interface ProviderNewsArticle {
  id: string;
  chain: ChainId | null;
  chainId: number | null;
  assetId: string | null;
  symbol: string | null;
  title: string;
  summary: string | null;
  url: string | null;
  sourceName: string | null;
  language: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
  raw: Record<string, unknown>;
}

export interface ProviderNewsFeed {
  items: ProviderNewsArticle[];
  total: number;
  limit: number;
  offset: number;
  query: string;
  source: string;
  updatedAt: string;
}

export interface NewsProvider {
  getNews(input: GetNewsInput & { resolvedQuery: string }): Promise<ProviderNewsFeed>;
}
