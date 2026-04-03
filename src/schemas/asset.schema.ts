import { z } from 'zod';

import { ASSET_TYPES, CHAINS } from '@/config/constants';
import { supportedEvmChainIdSchema } from '@/schemas/common.schema';

export const getAssetsQuerySchema = z.object({
  chain: z.enum([CHAINS.BITCOIN, CHAINS.ETHEREUM]).optional(),
  chainId: supportedEvmChainIdSchema.optional(),
  network: z.enum(['mainnet', 'testnet']).default('mainnet'),
  assetType: z.enum([ASSET_TYPES.NATIVE, ASSET_TYPES.ERC20]).optional(),
  symbol: z.string().trim().min(1).optional(),
});

export type GetAssetsQuery = z.infer<typeof getAssetsQuerySchema>;
