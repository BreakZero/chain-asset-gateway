import { z } from 'zod';

import { CHAINS } from '@/config/constants';
import { ethereumAddressSchema, supportedEvmChainIdSchema } from '@/schemas/common.schema';

export const getNewsQuerySchema = z
  .object({
    chain: z.enum([CHAINS.BITCOIN, CHAINS.ETHEREUM]).optional(),
    chainId: supportedEvmChainIdSchema.optional(),
    assetId: z.string().trim().min(1).optional(),
    symbol: z.string().trim().min(1).optional(),
    contractAddress: ethereumAddressSchema.optional(),
    query: z.string().trim().min(1).optional(),
    rawQuery: z.string().trim().min(1).optional(),
    limit: z.coerce.number().int().positive().max(50).default(10),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((value, ctx) => {
    if (!value.query && !value.rawQuery && !value.assetId && !value.symbol && !value.contractAddress && !value.chain) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'News lookup requires query, rawQuery, assetId, symbol, contractAddress, or chain',
      });
    }

    if (value.chainId !== undefined && value.chain !== CHAINS.ETHEREUM) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'chainId is only supported for ethereum news queries',
      });
    }
  });
