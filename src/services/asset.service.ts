import type { Asset } from '@/domain/asset';
import {
  fileAssetCatalogRepository,
  type AssetCatalogEntry,
  type AssetCatalogRepository,
} from '@/repositories/asset-catalog.repository';
import type { GetAssetsQuery } from '@/schemas/asset.schema';
import { nowIso } from '@/utils/time';

export class AssetService {
  private readonly source = 'data:assets-json';

  constructor(private readonly assetCatalogRepository: AssetCatalogRepository = fileAssetCatalogRepository) {}

  getAssets(query: GetAssetsQuery): Asset[] {
    const updatedAt = nowIso();
    const normalizedSymbol = query.symbol?.toUpperCase();

    return this.assetCatalogRepository
      .getAssets()
      .filter((asset) => {
        if (asset.network !== query.network) {
          return false;
        }

        if (query.chain && asset.chain !== query.chain) {
          return false;
        }

        if (query.chainId !== undefined && asset.chainId !== query.chainId) {
          return false;
        }

        if (query.assetType && asset.assetType !== query.assetType) {
          return false;
        }

        if (normalizedSymbol && asset.symbol !== normalizedSymbol) {
          return false;
        }

        return true;
      })
      .map((asset: AssetCatalogEntry) => ({
        ...asset,
        source: this.source,
        updatedAt,
      }));
  }
}
