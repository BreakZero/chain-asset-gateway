import { z } from 'zod';

import { CHAINS } from '@/config/constants';
import { ethereumAddressSchema, supportedEvmChainIdSchema } from '@/schemas/common.schema';

export const getMarketChartQuerySchema = z
  .object({
    chain: z.enum([CHAINS.BITCOIN, CHAINS.ETHEREUM]),
    chainId: supportedEvmChainIdSchema.optional(),
    assetId: z.string().optional(),
    contractAddress: ethereumAddressSchema.optional(),
    symbol: z.string().optional(),
    days: z.coerce.number().int().positive().max(365).default(7),
    interval: z.enum(['hourly', 'daily']).default('daily'),
  })
  .superRefine((value, ctx) => {
    if (value.chain === CHAINS.BITCOIN && !value.assetId && !value.symbol) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bitcoin market chart lookup requires assetId or symbol',
      });
    }

    if (value.chain === CHAINS.ETHEREUM && !value.assetId && !value.symbol && !value.contractAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ethereum market chart lookup requires assetId, symbol, or contractAddress',
      });
    }
  });
