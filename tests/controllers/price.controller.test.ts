import { describe, expect, it } from 'vitest';

import { getPrice } from '@/controllers/price.controller';
import { AppError } from '@/utils/app-error';

describe('getPrice', () => {
  it('rejects ethereum testnet price requests', async () => {
    const request = {
      query: {
        chain: 'ethereum',
        network: 'testnet',
        assetId: 'eth',
      },
    } as never;
    const response = {
      json: () => undefined,
    } as never;

    await expect(getPrice(request, response)).rejects.toMatchObject<AppError>({
      statusCode: 501,
      code: 'TESTNET_PRICE_UNSUPPORTED',
    });
  });
});
