import type { Request, Response } from 'express';

import { getAssetsQuerySchema } from '@/schemas/asset.schema';
import { AssetService } from '@/services/asset.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';

export const getAssets = (request: Request, response: Response): void => {
  const parsed = getAssetsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError('Invalid assets query', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  const assetService = new AssetService();
  const result = assetService.getAssets(parsed.data);

  response.json(ok({ items: result, total: result.length }, 'config:assets-json'));
};
