import { EVM_CHAIN_IDS } from '@/config/constants';
import type { Request, Response } from 'express';

import { ethereumAddressSchema, evmChainQuerySchema } from '@/schemas/common.schema';
import { PortfolioService } from '@/services/portfolio.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';

export const getEthereumPortfolio = async (request: Request, response: Response): Promise<void> => {
  const parsed = ethereumAddressSchema.safeParse(request.params.address);
  const query = evmChainQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError('Invalid Ethereum address', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }
  if (!query.success) {
    throw new AppError('Invalid portfolio query', 400, 'VALIDATION_ERROR', query.error.flatten());
  }

  const portfolioService = new PortfolioService(query.data.chainId ?? EVM_CHAIN_IDS.ETHEREUM_MAINNET);
  const result = await portfolioService.getEthereumPortfolio(parsed.data);
  response.json(ok(result, result.source));
};
