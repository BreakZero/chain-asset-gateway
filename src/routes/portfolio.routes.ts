import { Router } from 'express';

import { getEthereumPortfolio } from '@/controllers/portfolio.controller';
import { asyncHandler } from '@/utils/async-handler';

export const portfolioRouter = Router();

portfolioRouter.get('/portfolio/ethereum/:address', asyncHandler(getEthereumPortfolio));
