import { mapProviderNewsFeedToNewsFeed } from '@/mappers/news.mapper';
import { BlockchairNewsProvider } from '@/providers/news/blockchair-news.provider';
import type { GetNewsInput, NewsProvider } from '@/providers/news/news.types';
import {
  fileAssetCatalogRepository,
  type AssetCatalogEntry,
  type AssetCatalogRepository,
} from '@/repositories/asset-catalog.repository';
import type { NewsFeed } from '@/domain/news';
import { AppError } from '@/utils/app-error';

export class NewsService {
  constructor(
    private readonly newsProvider: NewsProvider = new BlockchairNewsProvider(),
    private readonly assetCatalogRepository: AssetCatalogRepository = fileAssetCatalogRepository,
  ) {}

  async getNews(input: GetNewsInput): Promise<NewsFeed> {
    const resolvedQuery = this.resolveQuery(input);
    const feed = await this.newsProvider.getNews({
      ...input,
      resolvedQuery,
    });

    return mapProviderNewsFeedToNewsFeed(feed);
  }

  private resolveQuery(input: GetNewsInput): string {
    if (input.rawQuery?.trim()) {
      return input.rawQuery.trim();
    }

    if (input.query?.trim()) {
      return input.query.trim();
    }

    const matchedAsset = this.assetCatalogRepository.getAssets().find((asset: AssetCatalogEntry) => {
      if (input.contractAddress && asset.contractAddress?.toLowerCase() === input.contractAddress.toLowerCase()) {
        return true;
      }

      if (input.chain && asset.chain !== input.chain) {
        return false;
      }

      if (input.chainId !== undefined && asset.chainId !== input.chainId) {
        return false;
      }

      if (input.assetId && asset.assetId.toLowerCase() === input.assetId.toLowerCase()) {
        return true;
      }

      if (input.symbol && asset.symbol?.toUpperCase() === input.symbol.toUpperCase()) {
        return true;
      }

      return false;
    });

    const resolved =
      matchedAsset?.name ??
      matchedAsset?.symbol ??
      input.symbol?.trim() ??
      input.assetId?.trim() ??
      input.contractAddress?.trim() ??
      input.chain;

    if (!resolved) {
      throw new AppError(
        'News lookup requires query, rawQuery, assetId, symbol, contractAddress, or chain',
        400,
        'VALIDATION_ERROR',
        input,
      );
    }

    return resolved;
  }
}
