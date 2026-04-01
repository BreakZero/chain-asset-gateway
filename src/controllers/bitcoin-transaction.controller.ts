import type { Request, Response } from 'express';

import {
  broadcastBitcoinTransactionBodySchema,
  getBitcoinTransactionParamsSchema,
} from '@/schemas/transaction.schema';
import { TransactionService } from '@/services/transaction.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';

export const getBitcoinTransaction = async (request: Request, response: Response): Promise<void> => {
  const transactionService = new TransactionService();
  const parsed = getBitcoinTransactionParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    throw new AppError('Invalid Bitcoin transaction hash', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  const result = await transactionService.getBitcoinTransaction(parsed.data.txHash);
  response.json(ok(result, result.source));
};

export const broadcastBitcoinTransaction = async (request: Request, response: Response): Promise<void> => {
  const transactionService = new TransactionService();
  const parsed = broadcastBitcoinTransactionBodySchema.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError('Invalid Bitcoin broadcast request', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  const result = await transactionService.broadcastBitcoinTransaction(parsed.data.rawTx);
  response.status(result.accepted ? 200 : 501).json(ok(result, 'bitcoin-rpc'));
};
