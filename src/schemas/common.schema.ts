import { z } from 'zod';

import { EVM_CHAIN_IDS } from '@/config/constants';

export const ethereumAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

export const ethereumTxHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Ethereum transaction hash');

export const bitcoinTxHashSchema = z.string().regex(/^[a-fA-F0-9]{64}$/, 'Invalid Bitcoin transaction hash');

export const bitcoinAddressSchema = z
  .string()
  .trim()
  .regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{14,87}$/i, 'Invalid Bitcoin address');

export const optionalBitcoinTxHashSchema = bitcoinTxHashSchema.optional();

export const supportedEvmChainIdSchema = z
  .coerce.number()
  .int()
  .refine(
    (value) => value === EVM_CHAIN_IDS.ETHEREUM_MAINNET || value === EVM_CHAIN_IDS.ETHEREUM_SEPOLIA,
    'Unsupported EVM chainId',
  );

export const evmChainQuerySchema = z.object({
  chainId: supportedEvmChainIdSchema.default(EVM_CHAIN_IDS.ETHEREUM_MAINNET),
});
