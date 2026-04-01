import { Router } from 'express';

import { getPrice } from '@/controllers/price.controller';
import { asyncHandler } from '@/utils/async-handler';

export const priceRouter = Router();

priceRouter.get('/prices', asyncHandler(getPrice));
