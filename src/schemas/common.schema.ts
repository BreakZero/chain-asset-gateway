import { z } from 'zod';

import { BITCOIN_NETWORKS, EVM_CHAIN_IDS } from '@/config/constants';

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

export const networkSchema = z.enum([BITCOIN_NETWORKS.MAINNET, BITCOIN_NETWORKS.TESTNET]);

export const evmChainQuerySchema = z
  .object({
    network: networkSchema.optional(),
    chainId: supportedEvmChainIdSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.chainId === undefined || value.network === undefined) {
      return;
    }

    const expectedNetwork =
      value.chainId === EVM_CHAIN_IDS.ETHEREUM_SEPOLIA ? BITCOIN_NETWORKS.TESTNET : BITCOIN_NETWORKS.MAINNET;

    if (value.network !== expectedNetwork) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'network and chainId must match for ethereum requests',
        path: ['chainId'],
      });
    }
  });

export const bitcoinNetworkQuerySchema = z.object({
  network: networkSchema.default(BITCOIN_NETWORKS.MAINNET),
});
