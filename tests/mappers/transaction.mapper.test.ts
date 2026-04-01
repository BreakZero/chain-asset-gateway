import { describe, expect, it } from 'vitest';

import { mapEvmTransactionToDetail } from '@/mappers/transaction.mapper';

describe('mapEvmTransactionToDetail', () => {
  it('uses receipt-backed gas fields to derive status and fee', () => {
    const result = mapEvmTransactionToDetail({
      chainId: 11155111,
      hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      blockNumber: 123n,
      from: '0x1111111111111111111111111111111111111111',
      to: '0x2222222222222222222222222222222222222222',
      value: 1000000000000000000n,
      gas: 21000n,
      gasPrice: 1000000000n,
      effectiveGasPrice: 2000000000n,
      gasUsed: 21000n,
      status: 'confirmed',
      blockHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      transactionIndex: 1,
      raw: {},
    });

    expect(result.status).toBe('confirmed');
    expect(result.chainId).toBe(11155111);
    expect(result.feeRaw).toBe('42000000000000');
    expect(result.valueFormatted).toBe('1');
  });
});
