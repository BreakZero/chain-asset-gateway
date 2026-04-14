import type { Request, Response } from 'express';

import { getMarketChartQuerySchema } from '@/schemas/market.schema';
import { MarketService } from '@/services/market.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';
import { resolveEthereumNetworkSelection } from '@/utils/network';

export const getMarketChart = async (request: Request, response: Response): Promise<void> => {
  const parsed = getMarketChartQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError('Invalid market chart query', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  const ethereumSelection =
    parsed.data.chain === 'ethereum'
      ? resolveEthereumNetworkSelection(parsed.data)
      : { network: parsed.data.network ?? 'mainnet', chainId: undefined };

  if (parsed.data.chain === 'ethereum' && ethereumSelection.network === 'testnet') {
    throw new AppError(
      'Ethereum testnet market chart data is not supported in this MVP',
      501,
      'TESTNET_MARKET_CHART_UNSUPPORTED',
      parsed.data,
    );
  }

  const marketService = new MarketService();
  const result = await marketService.getMarketChart({
    ...parsed.data,
    network: ethereumSelection.network,
    chainId: ethereumSelection.chainId,
  });

  response.json(ok(result, result.source));
};
