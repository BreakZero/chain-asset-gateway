import type { Request, Response } from 'express';

import { getBitcoinNativeBalanceParamsSchema } from '@/schemas/balance.schema';
import { getBitcoinAddressTransactionsQuerySchema } from '@/schemas/transaction.schema';
import { BitcoinAddressService } from '@/services/bitcoin-address.service';
import { BitcoinBalanceService } from '@/services/bitcoin-balance.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';

export const getBitcoinNativeBalance = async (request: Request, response: Response): Promise<void> => {
  const parsed = getBitcoinNativeBalanceParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    throw new AppError('Invalid Bitcoin balance request', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  const bitcoinBalanceService = new BitcoinBalanceService();
  const includePrice = request.query.includePrice !== 'false';
  const result = await bitcoinBalanceService.getNativeBalance(parsed.data.address, includePrice);

  response.json(ok(result, result.source));
};

export const getBitcoinAddressUtxos = async (request: Request, response: Response): Promise<void> => {
  const parsed = getBitcoinNativeBalanceParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    throw new AppError('Invalid Bitcoin UTXO request', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  const bitcoinAddressService = new BitcoinAddressService();
  const result = await bitcoinAddressService.getAddressUtxos(parsed.data.address);

  response.json(ok(result, result.source));
};

export const getBitcoinAddressTransactions = async (request: Request, response: Response): Promise<void> => {
  const parsed = getBitcoinNativeBalanceParamsSchema.safeParse(request.params);
  const query = getBitcoinAddressTransactionsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError(
      'Invalid Bitcoin address transactions request',
      400,
      'VALIDATION_ERROR',
      parsed.error.flatten(),
    );
  }
  if (!query.success) {
    throw new AppError(
      'Invalid Bitcoin address transactions query',
      400,
      'VALIDATION_ERROR',
      query.error.flatten(),
    );
  }

  const bitcoinAddressService = new BitcoinAddressService();
  const result = await bitcoinAddressService.getAddressTransactions(parsed.data.address, query.data);

  response.json(ok(result, result.source));
};
