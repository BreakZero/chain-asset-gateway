import { describe, expect, it } from 'vitest';

import { BitcoinIndexerProvider } from '@/providers/bitcoin/bitcoin-indexer.provider';

describe('BitcoinIndexerProvider', () => {
  it('maps address stats and utxos into a normalized bitcoin balance', async () => {
    const responses = new Map<string, unknown>([
      [
        '/address/bc1qzkc8h2hsghd7acntvrfv9yeqnuyjlnevj0nkmr',
        {
          address: 'bc1qzkc8h2hsghd7acntvrfv9yeqnuyjlnevj0nkmr',
          chain_stats: {
            funded_txo_count: 2,
            funded_txo_sum: 2_000_000,
            spent_txo_count: 1,
            spent_txo_sum: 500_000,
            tx_count: 2,
          },
          mempool_stats: {
            funded_txo_count: 1,
            funded_txo_sum: 100_000,
            spent_txo_count: 0,
            spent_txo_sum: 0,
            tx_count: 1,
          },
        },
      ],
      [
        '/address/bc1qzkc8h2hsghd7acntvrfv9yeqnuyjlnevj0nkmr/utxo',
        [{}, {}],
      ],
    ]);

    const client = {
      get: async <T>(url: string): Promise<{ data: T }> => ({
        data: responses.get(url) as T,
      }),
    };

    const provider = new BitcoinIndexerProvider(client as never);
    const result = await provider.getAddressBalance('bc1qzkc8h2hsghd7acntvrfv9yeqnuyjlnevj0nkmr');

    expect(result.totalAmountBtc).toBe('0.01600000');
    expect(result.unspentOutputs).toBe(2);
  });
});
