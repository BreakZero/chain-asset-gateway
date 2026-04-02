import { describe, expect, it } from 'vitest';

import { AssetService } from '@/services/asset.service';

describe('AssetService', () => {
  it('returns configured supported assets', () => {
    const service = new AssetService();

    const result = service.getAssets({});

    expect(result).toHaveLength(8);
    expect(result.map((asset) => `${asset.symbol}:${asset.chainId ?? 'null'}`)).toEqual([
      'BTC:null',
      'ETH:1',
      'ETH:11155111',
      'UNI:1',
      'USDT:1',
      'LINK:1',
      'LINK:11155111',
      'AAVE:1',
    ]);
  });

  it('filters supported assets by chain and symbol', () => {
    const service = new AssetService();

    const result = service.getAssets({
      chain: 'ethereum',
      symbol: 'usdt',
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.symbol).toBe('USDT');
    expect(result[0]?.contractAddress).toBe('0xdac17f958d2ee523a2206206994597c13d831ec7');
  });

  it('filters supported assets by chainId', () => {
    const service = new AssetService();

    const result = service.getAssets({
      chain: 'ethereum',
      chainId: 11155111,
    });

    expect(result).toHaveLength(2);
    expect(result.map((asset) => asset.symbol)).toEqual(['ETH', 'LINK']);
    expect(result.every((asset) => asset.chainId === 11155111)).toBe(true);
    expect(result.every((asset) => asset.network === 'testnet')).toBe(true);
  });
});
