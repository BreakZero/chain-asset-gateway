import type { Request, Response } from 'express';

import { getPriceQuerySchema } from '@/schemas/price.schema';
import { PriceService } from '@/services/price.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';
import { resolveEthereumNetworkSelection } from '@/utils/network';

export const getPrice = async (request: Request, response: Response): Promise<void> => {
  const priceService = new PriceService();
  const parsed = getPriceQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError('Invalid price query', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  const ethereumSelection =
    parsed.data.chain === 'ethereum'
      ? resolveEthereumNetworkSelection(parsed.data)
      : { network: parsed.data.network ?? 'mainnet', chainId: undefined };

  if (parsed.data.chain === 'ethereum' && ethereumSelection.network === 'testnet') {
    throw new AppError(
      'Ethereum testnet price data is not supported in this MVP',
      501,
      'TESTNET_PRICE_UNSUPPORTED',
      parsed.data,
    );
  }

  const result = await priceService.getPrice({
    ...parsed.data,
    network: ethereumSelection.network,
    chainId: ethereumSelection.chainId,
  });
  response.json(ok(result, result.source));
};
