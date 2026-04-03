import { describe, expect, it } from 'vitest';

import { AssetService } from '@/services/asset.service';

describe('AssetService', () => {
  it('returns configured supported assets', () => {
    const service = new AssetService();

    const result = service.getAssets({
      network: 'mainnet',
    });

    expect(result).toHaveLength(6);
    expect(result.map((asset) => `${asset.symbol}:${asset.chainId ?? 'null'}`)).toEqual([
      'BTC:null',
      'ETH:1',
      'UNI:1',
      'USDT:1',
      'LINK:1',
      'AAVE:1',
    ]);
    expect(result.every((asset) => typeof asset.logoUrl === 'string' && asset.logoUrl.length > 0)).toBe(true);
    expect(result.every((asset) => asset.network === 'mainnet')).toBe(true);
  });

  it('filters supported assets by chain and symbol', () => {
    const service = new AssetService();

    const result = service.getAssets({
      chain: 'ethereum',
      network: 'mainnet',
      symbol: 'usdt',
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.symbol).toBe('USDT');
    expect(result[0]?.contractAddress).toBe('0xdac17f958d2ee523a2206206994597c13d831ec7');
  });

  it('returns testnet assets when network=testnet', () => {
    const service = new AssetService();

    const result = service.getAssets({
      network: 'testnet',
    });

    expect(result).toHaveLength(2);
    expect(result.map((asset) => asset.symbol)).toEqual(['ETH', 'LINK']);
    expect(result.every((asset) => asset.chainId === 11155111)).toBe(true);
    expect(result.every((asset) => asset.network === 'testnet')).toBe(true);
  });

  it('filters supported assets by chainId within the selected network', () => {
    const service = new AssetService();

    const result = service.getAssets({
      chain: 'ethereum',
      chainId: 11155111,
      network: 'testnet',
    });

    expect(result).toHaveLength(2);
    expect(result.map((asset) => asset.symbol)).toEqual(['ETH', 'LINK']);
  });
});
