import type { ChainId } from '@/domain/asset';

export interface NewsArticle {
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

export interface NewsFeed {
  items: NewsArticle[];
  limit: number;
  offset: number;
  source: string;
}
