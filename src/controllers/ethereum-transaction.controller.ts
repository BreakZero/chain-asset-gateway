import { EVM_CHAIN_IDS } from '@/config/constants';
import type { Request, Response } from 'express';

import { evmChainQuerySchema } from '@/schemas/common.schema';
import { getEthereumTransactionParamsSchema } from '@/schemas/transaction.schema';
import { TransactionService } from '@/services/transaction.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';

export const getEthereumTransaction = async (request: Request, response: Response): Promise<void> => {
  const parsed = getEthereumTransactionParamsSchema.safeParse(request.params);
  const query = evmChainQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError('Invalid Ethereum transaction hash', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }
  if (!query.success) {
    throw new AppError('Invalid Ethereum transaction query', 400, 'VALIDATION_ERROR', query.error.flatten());
  }

  const transactionService = new TransactionService(query.data.chainId ?? EVM_CHAIN_IDS.ETHEREUM_MAINNET);
  const result = await transactionService.getEthereumTransaction(parsed.data.txHash);
  response.json(ok(result, result.source));
};
