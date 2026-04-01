import assetCatalog from '@/config/assets.json';
import type { Asset } from '@/domain/asset';
import type { GetAssetsQuery } from '@/schemas/asset.schema';
import { nowIso } from '@/utils/time';

interface SupportedAssetConfig {
  chain: Asset['chain'];
  chainId: Asset['chainId'];
  network: Asset['network'];
  assetType: Asset['assetType'];
  assetId: string;
  symbol: string | null;
  name: string | null;
  contractAddress: string | null;
  decimals: number | null;
  status: Asset['status'];
}

export class AssetService {
  private readonly source = 'config:assets-json';
  private readonly assets = assetCatalog as SupportedAssetConfig[];

  getAssets(query: GetAssetsQuery): Asset[] {
    const updatedAt = nowIso();
    const normalizedSymbol = query.symbol?.toUpperCase();

    return this.assets
      .filter((asset) => {
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
      .map((asset) => ({
        ...asset,
        source: this.source,
        updatedAt,
      }));
  }
}
