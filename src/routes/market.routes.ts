import { Router } from 'express';

import { getMarketChart } from '@/controllers/market.controller';
import { asyncHandler } from '@/utils/async-handler';

export const marketRouter = Router();

marketRouter.get('/market/chart', asyncHandler(getMarketChart));
