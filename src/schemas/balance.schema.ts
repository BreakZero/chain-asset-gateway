import { z } from 'zod';

import { ethereumAddressSchema } from '@/schemas/common.schema';

export const getEthereumNativeBalanceParamsSchema = z.object({
  address: ethereumAddressSchema,
});

export const getEthereumErc20BalanceParamsSchema = z.object({
  address: ethereumAddressSchema,
  contractAddress: ethereumAddressSchema,
});
