import { z } from 'zod';

import { bitcoinAddressSchema, ethereumAddressSchema } from '@/schemas/common.schema';

export const getBitcoinNativeBalanceParamsSchema = z.object({
  address: bitcoinAddressSchema,
});

export const getEthereumNativeBalanceParamsSchema = z.object({
  address: ethereumAddressSchema,
});

export const getEthereumErc20BalanceParamsSchema = z.object({
  address: ethereumAddressSchema,
  contractAddress: ethereumAddressSchema,
});
