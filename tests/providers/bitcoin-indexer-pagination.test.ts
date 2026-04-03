import { describe, expect, it } from 'vitest';

import { BitcoinIndexerProvider } from '@/providers/bitcoin/bitcoin-indexer.provider';

describe('BitcoinIndexerProvider pagination', () => {
  it('uses the chain pagination endpoint when lastSeenTxid is provided', async () => {
    const calls: string[] = [];
    const client = {
      get: async <T>(url: string): Promise<{ data: T }> => {
        calls.push(url);
        return { data: [] as T };
      },
    };

    const provider = new BitcoinIndexerProvider(client as never);
    await provider.getAddressTransactions(
      'bc1qzkc8h2hsghd7acntvrfv9yeqnuyjlnevj0nkmr',
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    );

    expect(calls).toEqual([
      '/address/bc1qzkc8h2hsghd7acntvrfv9yeqnuyjlnevj0nkmr/txs/chain/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ]);
  });
});
