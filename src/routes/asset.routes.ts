import { Router } from 'express';

import { getAssets } from '@/controllers/asset.controller';

export const assetRouter = Router();

assetRouter.get('/assets', getAssets);
