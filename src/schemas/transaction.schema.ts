import { z } from 'zod';

import {
  bitcoinTxHashSchema,
  ethereumTxHashSchema,
  networkSchema,
  optionalBitcoinTxHashSchema,
} from '@/schemas/common.schema';

export const getEthereumTransactionParamsSchema = z.object({
  txHash: ethereumTxHashSchema,
});

export const getBitcoinTransactionParamsSchema = z.object({
  txHash: bitcoinTxHashSchema,
});

export const broadcastBitcoinTransactionBodySchema = z.object({
  rawTx: z.string().min(1, 'rawTx is required'),
});

export const getBitcoinAddressTransactionsQuerySchema = z.object({
  network: networkSchema.default('mainnet'),
  lastSeenTxid: optionalBitcoinTxHashSchema,
  limit: z.coerce.number().int().positive().max(25).default(25),
});
