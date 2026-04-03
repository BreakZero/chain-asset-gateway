import { describe, expect, it } from 'vitest';

import { mapErc20EthereumBalance } from '@/mappers/balance.mapper';

describe('mapErc20EthereumBalance', () => {
  it('maps ERC20 balances into the normalized balance shape', () => {
    const result = mapErc20EthereumBalance({
      chainId: 1,
      address: '0x1111111111111111111111111111111111111111',
      rawBalance: 1234500n,
      metadata: {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
      priceUsd: '1',
      updatedAt: '2026-04-01T00:00:00.000Z',
      source: 'ethereum-rpc',
    });

    expect(result.asset.assetType).toBe('erc20');
    expect(result.asset.chainId).toBe(1);
    expect(result.asset.network).toBe('mainnet');
    expect(result.asset.status).toBe('active');
    expect(result.asset.logoUrl).toBeNull();
    expect(result.amount.formatted).toBe('1.2345');
    expect(result.valueUsd).toBe('1.23');
  });
});
