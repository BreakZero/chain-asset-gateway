import { describe, expect, it } from 'vitest';

import { BitcoinBalanceService } from '@/services/bitcoin-balance.service';
import { InMemoryCacheStore } from '@/utils/cache';

describe('BitcoinBalanceService', () => {
  it('returns normalized bitcoin native balances', async () => {
    const service = new BitcoinBalanceService(
      {
        getAddressUtxos: async () => [],
        getAddressBalance: async (address) => ({
          address,
          totalAmountBtc: '0.01500000',
          unspentOutputs: 2,
        }),
      },
      {
        getPrice: async () => ({
          chain: 'bitcoin',
          chainId: null,
          assetId: 'bitcoin',
          contractAddress: null,
          currency: 'USD',
          price: '68000',
          source: 'stub-provider',
          updatedAt: '2026-04-02T00:00:00.000Z',
        }),
      } as never,
      new InMemoryCacheStore(),
    );

    const result = await service.getNativeBalance('bc1qexampleaddress0000000000000000000000000', true);

    expect(result.chain).toBe('bitcoin');
    expect(result.asset.symbol).toBe('BTC');
    expect(result.amount.raw).toBe('1500000');
    expect(result.amount.formatted).toBe('0.015');
    expect(result.valueUsd).toBe('1020.00');
  });
});
