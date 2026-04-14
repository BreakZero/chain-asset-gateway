import { describe, expect, it } from 'vitest';

import { bitcoinAddressSchema } from '@/schemas/common.schema';

describe('bitcoinAddressSchema', () => {
  it('accepts mainnet bitcoin addresses', () => {
    expect(bitcoinAddressSchema.safeParse('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh').success).toBe(true);
    expect(bitcoinAddressSchema.safeParse('1BoatSLRHtKNngkdXEeobR76b53LETtpyT').success).toBe(true);
  });

  it('rejects testnet bitcoin addresses while testnet is unsupported', () => {
    expect(bitcoinAddressSchema.safeParse('tb1qfmv9hxgun9e6q4j6r0jwmk92mfn8l8n5rj4n8s').success).toBe(false);
    expect(bitcoinAddressSchema.safeParse('mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn').success).toBe(false);
  });
});
