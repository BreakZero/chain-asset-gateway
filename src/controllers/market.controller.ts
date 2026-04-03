import type { Request, Response } from 'express';

import { EVM_CHAIN_IDS } from '@/config/constants';
import { getMarketChartQuerySchema } from '@/schemas/market.schema';
import { MarketService } from '@/services/market.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';

export const getMarketChart = async (request: Request, response: Response): Promise<void> => {
  const parsed = getMarketChartQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError('Invalid market chart query', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  const marketService = new MarketService();
  const result = await marketService.getMarketChart({
    ...parsed.data,
    chainId: parsed.data.chain === 'ethereum' ? (parsed.data.chainId ?? EVM_CHAIN_IDS.ETHEREUM_MAINNET) : undefined,
  });

  response.json(ok(result, result.source));
};
