import { z } from 'zod';

import { bitcoinTxHashSchema, ethereumTxHashSchema } from '@/schemas/common.schema';

export const getEthereumTransactionParamsSchema = z.object({
  txHash: ethereumTxHashSchema,
});

export const getBitcoinTransactionParamsSchema = z.object({
  txHash: bitcoinTxHashSchema,
});

export const broadcastBitcoinTransactionBodySchema = z.object({
  rawTx: z.string().min(1, 'rawTx is required'),
});
