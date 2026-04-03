import { describe, expect, it } from 'vitest';

import { BitcoinAddressService } from '@/services/bitcoin-address.service';

describe('BitcoinAddressService', () => {
  it('returns normalized bitcoin utxos', async () => {
    const service = new BitcoinAddressService({
      getAddressBalance: async () => {
        throw new Error('not used');
      },
      getAddressUtxos: async () => [
        {
          txid: 'abc',
          vout: 0,
          value: 1500000,
          status: {
            confirmed: true,
            block_height: 100,
            block_hash: 'hash',
            block_time: 123,
          },
        },
      ],
      getAddressTransactions: async () => [],
    });

    const result = await service.getAddressUtxos('bc1qexampleaddress0000000000000000000000000');

    expect(result.total).toBe(1);
    expect(result.items[0]?.value).toBe('0.015');
    expect(result.items[0]?.status.confirmed).toBe(true);
  });

  it('returns normalized bitcoin address transactions', async () => {
    const service = new BitcoinAddressService({
      getAddressBalance: async () => {
        throw new Error('not used');
      },
      getAddressUtxos: async () => [],
      getAddressTransactions: async () => [
        {
          txid: 'def',
          status: {
            confirmed: false,
          },
        },
        {
          txid: 'ghi',
          status: {
            confirmed: true,
            block_height: 1,
          },
        },
      ],
    });

    const result = await service.getAddressTransactions('bc1qexampleaddress0000000000000000000000000', {
      limit: 1,
    });

    expect(result.total).toBe(1);
    expect(result.items[0]?.hash).toBe('def');
    expect(result.items[0]?.status).toBe('pending');
    expect(result.nextCursor).toBe('def');
  });
});
