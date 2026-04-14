import type { AxiosInstance } from 'axios';
import axios from 'axios';

import { env } from '@/config/env';
import type { GetNewsInput, NewsProvider, ProviderNewsArticle, ProviderNewsFeed } from '@/providers/news/news.types';
import { nowIso } from '@/utils/time';

interface BlockchairNewsResponse {
  data?: unknown[];
  context?: {
    limit?: number;
    offset?: number;
    results?: number;
  };
}

type BlockchairNewsRecord = Record<string, unknown>;

const stringOrNull = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const numberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const pickString = (record: BlockchairNewsRecord, keys: string[]): string | null => {
  for (const key of keys) {
    const value = stringOrNull(record[key]);
    if (value) {
      return value;
    }
  }

  return null;
};

const pickId = (record: BlockchairNewsRecord): string => {
  const directId = pickString(record, ['id', 'article_id', 'slug', 'guid', 'uuid']);
  if (directId) {
    return directId;
  }

  const url = pickString(record, ['link', 'url', 'source_url']);
  if (url) {
    return url;
  }

  return `news-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const mapBlockchairRecord = (
  record: BlockchairNewsRecord,
  input: Pick<GetNewsInput, 'chain' | 'chainId' | 'assetId' | 'symbol'>,
): ProviderNewsArticle => ({
  id: pickId(record),
  chain: input.chain ?? null,
  chainId: input.chain === 'ethereum' ? (input.chainId ?? 1) : null,
  assetId: input.assetId?.toLowerCase() ?? null,
  symbol: input.symbol?.toUpperCase() ?? null,
  title: pickString(record, ['title', 'headline']) ?? 'Untitled',
  summary: pickString(record, ['description', 'summary', 'snippet', 'lead']),
  url: pickString(record, ['link', 'url', 'source_url']),
  sourceName: pickString(record, ['source', 'source_name', 'site', 'domain']),
  language: pickString(record, ['language', 'lang']),
  publishedAt: pickString(record, ['published', 'published_at', 'time', 'date']),
  imageUrl: pickString(record, ['image', 'image_url', 'thumbnail']),
  raw: record,
});

export class BlockchairNewsProvider implements NewsProvider {
  private readonly client: AxiosInstance;

  constructor(client?: AxiosInstance) {
    this.client =
      client ??
      axios.create({
        baseURL: env.BLOCKCHAIR_BASE_URL,
        timeout: 10_000,
      });
  }

  async getNews(input: GetNewsInput & { resolvedQuery: string }): Promise<ProviderNewsFeed> {
    const params: Record<string, number | string> = {
      limit: input.limit,
      offset: input.offset,
      q: input.rawQuery?.trim() || input.resolvedQuery,
    };

    if (env.BLOCKCHAIR_API_KEY) {
      params.key = env.BLOCKCHAIR_API_KEY;
    }

    const response = await this.client.get<BlockchairNewsResponse>('/news', { params });
    const rows = Array.isArray(response.data.data) ? response.data.data : [];
    const items = rows
      .filter((row): row is BlockchairNewsRecord => !!row && typeof row === 'object' && !Array.isArray(row))
      .map((row) => mapBlockchairRecord(row, input));

    return {
      items,
      total: numberOrNull(response.data.context?.results) ?? items.length,
      limit: numberOrNull(response.data.context?.limit) ?? input.limit,
      offset: numberOrNull(response.data.context?.offset) ?? input.offset,
      query: input.resolvedQuery,
      source: 'blockchair',
      updatedAt: nowIso(),
    };
  }
}
