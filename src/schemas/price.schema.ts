import { z } from 'zod';

import { CHAINS } from '@/config/constants';
import { ethereumAddressSchema, networkSchema, supportedEvmChainIdSchema } from '@/schemas/common.schema';

export const getPriceQuerySchema = z
  .object({
    chain: z.enum([CHAINS.BITCOIN, CHAINS.ETHEREUM]),
    network: networkSchema.optional(),
    chainId: supportedEvmChainIdSchema.optional(),
    assetId: z.string().optional(),
    contractAddress: ethereumAddressSchema.optional(),
    symbol: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.chain === CHAINS.ETHEREUM && value.chainId !== undefined && value.network !== undefined) {
      const expectedNetwork = value.chainId === 11155111 ? 'testnet' : 'mainnet';

      if (value.network !== expectedNetwork) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'network and chainId must match for ethereum requests',
          path: ['chainId'],
        });
      }
    }

    if (value.chain === CHAINS.BITCOIN && !value.assetId && !value.symbol) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bitcoin price lookup requires assetId or symbol',
      });
    }

    if (value.chain === CHAINS.ETHEREUM && !value.assetId && !value.symbol && !value.contractAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ethereum price lookup requires assetId, symbol, or contractAddress',
      });
    }
  });
