import { EVM_CHAIN_IDS } from '@/config/constants';
import type { Request, Response } from 'express';

import { getPriceQuerySchema } from '@/schemas/price.schema';
import { PriceService } from '@/services/price.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';

export const getPrice = async (request: Request, response: Response): Promise<void> => {
  const priceService = new PriceService();
  const parsed = getPriceQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError('Invalid price query', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  const result = await priceService.getPrice({
    ...parsed.data,
    chainId: parsed.data.chain === 'ethereum' ? (parsed.data.chainId ?? EVM_CHAIN_IDS.ETHEREUM_MAINNET) : undefined,
  });
  response.json(ok(result, result.source));
};
