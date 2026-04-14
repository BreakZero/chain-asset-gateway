import { describe, expect, it } from 'vitest';

import { getMarketChart } from '@/controllers/market.controller';
import { AppError } from '@/utils/app-error';

describe('getMarketChart', () => {
  it('rejects ethereum testnet market chart requests', async () => {
    const request = {
      query: {
        chain: 'ethereum',
        network: 'testnet',
        assetId: 'eth',
        days: '7',
        interval: 'daily',
      },
    } as never;
    const response = {
      json: () => undefined,
    } as never;

    await expect(getMarketChart(request, response)).rejects.toMatchObject<AppError>({
      statusCode: 501,
      code: 'TESTNET_MARKET_CHART_UNSUPPORTED',
    });
  });
});
