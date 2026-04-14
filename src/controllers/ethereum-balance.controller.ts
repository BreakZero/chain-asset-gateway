import type { Request, Response } from 'express';

import {
  getEthereumErc20BalanceParamsSchema,
  getEthereumNativeBalanceParamsSchema,
} from '@/schemas/balance.schema';
import { evmChainQuerySchema } from '@/schemas/common.schema';
import { EthereumBalanceService } from '@/services/ethereum-balance.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';
import { resolveEthereumNetworkSelection } from '@/utils/network';

export const getEthereumNativeBalance = async (request: Request, response: Response): Promise<void> => {
  const parsed = getEthereumNativeBalanceParamsSchema.safeParse(request.params);
  const query = evmChainQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError('Invalid balance request', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }
  if (!query.success) {
    throw new AppError('Invalid balance query', 400, 'VALIDATION_ERROR', query.error.flatten());
  }

  const networkSelection = resolveEthereumNetworkSelection(query.data);
  const ethereumBalanceService = new EthereumBalanceService(networkSelection.chainId);
  const includePrice = request.query.includePrice !== 'false';
  const result = await ethereumBalanceService.getNativeBalance(parsed.data.address, includePrice);

  response.json(ok(result, result.source));
};

export const getEthereumErc20Balance = async (request: Request, response: Response): Promise<void> => {
  const parsed = getEthereumErc20BalanceParamsSchema.safeParse(request.params);
  const query = evmChainQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError('Invalid ERC20 balance request', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }
  if (!query.success) {
    throw new AppError('Invalid ERC20 balance query', 400, 'VALIDATION_ERROR', query.error.flatten());
  }

  const networkSelection = resolveEthereumNetworkSelection(query.data);
  const ethereumBalanceService = new EthereumBalanceService(networkSelection.chainId);
  const includePrice = request.query.includePrice !== 'false';
  const result = await ethereumBalanceService.getErc20Balance(
    parsed.data.address,
    parsed.data.contractAddress,
    includePrice,
  );

  response.json(ok(result, result.source));
};
