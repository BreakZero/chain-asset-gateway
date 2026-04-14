import { readFileSync, statSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { z } from 'zod';

import { AppError } from '@/utils/app-error';

const assetCatalogEntrySchema = z.object({
  chain: z.enum(['bitcoin', 'ethereum']),
  chainId: z.number().int().positive().nullable(),
  network: z.enum(['mainnet', 'testnet']),
  assetType: z.enum(['native', 'erc20']),
  assetId: z.string().trim().min(1),
  symbol: z.string().trim().min(1).nullable(),
  name: z.string().trim().min(1).nullable(),
  logoUrl: z.string().url().nullable(),
  contractAddress: z.string().trim().min(1).nullable(),
  decimals: z.number().int().nonnegative().nullable(),
  status: z.enum(['active', 'inactive']),
});

const assetCatalogSchema = z.array(assetCatalogEntrySchema);

export type AssetCatalogEntry = z.infer<typeof assetCatalogEntrySchema>;

export interface AssetCatalogRepository {
  getAssets(): AssetCatalogEntry[];
}

const resolvePackageRoot = (): string => {
  let currentDir = path.dirname(fileURLToPath(import.meta.url));

  while (true) {
    if (existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return path.dirname(fileURLToPath(import.meta.url));
    }

    currentDir = parentDir;
  }
};

export const defaultAssetCatalogPath = () =>
  path.resolve(resolvePackageRoot(), process.env.ASSET_CATALOG_PATH ?? 'data/assets.json');

export class FileAssetCatalogRepository implements AssetCatalogRepository {
  private cache?: AssetCatalogEntry[];
  private cacheMtimeMs?: number;
  private cacheSize?: number;

  constructor(private readonly filePath = defaultAssetCatalogPath()) {}

  getAssets(): AssetCatalogEntry[] {
    let fileStat: ReturnType<typeof statSync>;
    try {
      fileStat = statSync(this.filePath);
    } catch (error) {
      throw new AppError('Failed to read asset catalog file', 500, 'ASSET_CATALOG_READ_ERROR', {
        filePath: this.filePath,
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    if (this.cache && this.cacheMtimeMs === fileStat.mtimeMs && this.cacheSize === fileStat.size) {
      return this.cache;
    }

    let raw: string;
    try {
      raw = readFileSync(this.filePath, 'utf8');
    } catch (error) {
      throw new AppError('Failed to read asset catalog file', 500, 'ASSET_CATALOG_READ_ERROR', {
        filePath: this.filePath,
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch (error) {
      throw new AppError('Asset catalog file contains invalid JSON', 500, 'ASSET_CATALOG_PARSE_ERROR', {
        filePath: this.filePath,
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    const parsedCatalog = assetCatalogSchema.safeParse(parsedJson);
    if (!parsedCatalog.success) {
      throw new AppError('Asset catalog file failed schema validation', 500, 'ASSET_CATALOG_VALIDATION_ERROR', {
        filePath: this.filePath,
        issues: parsedCatalog.error.flatten(),
      });
    }

    this.cache = parsedCatalog.data;
    this.cacheMtimeMs = fileStat.mtimeMs;
    this.cacheSize = fileStat.size;
    return this.cache;
  }
}

class LazyAssetCatalogRepository implements AssetCatalogRepository {
  private repository?: FileAssetCatalogRepository;

  getAssets(): AssetCatalogEntry[] {
    if (!this.repository) {
      this.repository = new FileAssetCatalogRepository();
    }

    return this.repository.getAssets();
  }
}

export const fileAssetCatalogRepository: AssetCatalogRepository = new LazyAssetCatalogRepository();
