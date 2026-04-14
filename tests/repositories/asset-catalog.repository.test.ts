import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  FileAssetCatalogRepository,
  fileAssetCatalogRepository,
} from '@/repositories/asset-catalog.repository';
import { AppError } from '@/utils/app-error';

describe('FileAssetCatalogRepository', () => {
  it('loads and validates the asset catalog file', () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), 'asset-catalog-'));
    const filePath = path.join(tempDir, 'assets.json');

    writeFileSync(
      filePath,
      JSON.stringify([
        {
          chain: 'bitcoin',
          chainId: null,
          network: 'mainnet',
          assetType: 'native',
          assetId: 'btc',
          symbol: 'BTC',
          name: 'Bitcoin',
          logoUrl: 'https://example.com/btc.png',
          contractAddress: null,
          decimals: 8,
          status: 'active',
        },
      ]),
    );

    const repository = new FileAssetCatalogRepository(filePath);

    expect(repository.getAssets()).toHaveLength(1);
    expect(repository.getAssets()[0]?.assetId).toBe('btc');
  });

  it('throws an app error when the file content is invalid', () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), 'asset-catalog-'));
    const filePath = path.join(tempDir, 'assets.json');

    writeFileSync(filePath, JSON.stringify([{ assetId: 'btc' }]));

    const repository = new FileAssetCatalogRepository(filePath);

    expect(() => repository.getAssets()).toThrow(AppError);
    expect(() => repository.getAssets()).toThrow(/schema validation/i);
  });

  it('reloads the asset catalog when the file changes', async () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), 'asset-catalog-'));
    const filePath = path.join(tempDir, 'assets.json');

    writeFileSync(
      filePath,
      JSON.stringify([
        {
          chain: 'bitcoin',
          chainId: null,
          network: 'mainnet',
          assetType: 'native',
          assetId: 'btc',
          symbol: 'BTC',
          name: 'Bitcoin',
          logoUrl: 'https://example.com/btc.png',
          contractAddress: null,
          decimals: 8,
          status: 'active',
        },
      ]),
    );

    const repository = new FileAssetCatalogRepository(filePath);

    expect(repository.getAssets()[0]?.assetId).toBe('btc');

    await new Promise((resolve) => setTimeout(resolve, 5));

    writeFileSync(
      filePath,
      JSON.stringify([
        {
          chain: 'ethereum',
          chainId: 1,
          network: 'mainnet',
          assetType: 'native',
          assetId: 'eth',
          symbol: 'ETH',
          name: 'Ethereum',
          logoUrl: 'https://example.com/eth.png',
          contractAddress: null,
          decimals: 18,
          status: 'active',
        },
      ]),
    );

    expect(repository.getAssets()[0]?.assetId).toBe('eth');
  });

  it('resolves ASSET_CATALOG_PATH lazily from process.env', () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), 'asset-catalog-'));
    const filePath = path.join(tempDir, 'assets.json');
    const previousPath = process.env.ASSET_CATALOG_PATH;

    writeFileSync(
      filePath,
      JSON.stringify([
        {
          chain: 'bitcoin',
          chainId: null,
          network: 'mainnet',
          assetType: 'native',
          assetId: 'btc',
          symbol: 'BTC',
          name: 'Bitcoin',
          logoUrl: 'https://example.com/btc.png',
          contractAddress: null,
          decimals: 8,
          status: 'active',
        },
      ]),
    );

    process.env.ASSET_CATALOG_PATH = filePath;

    try {
      expect(fileAssetCatalogRepository.getAssets()[0]?.assetId).toBe('btc');
    } finally {
      if (previousPath === undefined) {
        delete process.env.ASSET_CATALOG_PATH;
      } else {
        process.env.ASSET_CATALOG_PATH = previousPath;
      }
    }
  });
});
