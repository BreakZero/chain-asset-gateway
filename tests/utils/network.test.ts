import { describe, expect, it } from 'vitest';

import { AppError } from '@/utils/app-error';
import { evmChainQuerySchema } from '@/schemas/common.schema';
import { resolveEthereumNetworkSelection } from '@/utils/network';

describe('resolveEthereumNetworkSelection', () => {
  it('defaults mainnet requests to Ethereum mainnet', () => {
    expect(resolveEthereumNetworkSelection({ network: 'mainnet' })).toEqual({
      network: 'mainnet',
      chainId: 1,
    });
  });

  it('maps testnet requests to Sepolia', () => {
    expect(resolveEthereumNetworkSelection({ network: 'testnet' })).toEqual({
      network: 'testnet',
      chainId: 11155111,
    });
  });

  it('rejects mismatched ethereum network and chainId', () => {
    expect(() => resolveEthereumNetworkSelection({ network: 'testnet', chainId: 1 })).toThrow(AppError);
  });

  it('allows chainId-only ethereum requests for backward compatibility', () => {
    const parsed = evmChainQuerySchema.safeParse({ chainId: 11155111 });

    expect(parsed.success).toBe(true);
  });
});
