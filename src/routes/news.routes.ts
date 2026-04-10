import { Router } from 'express';

import { getNews } from '@/controllers/news.controller';
import { asyncHandler } from '@/utils/async-handler';

export const newsRouter = Router();

newsRouter.get('/news', asyncHandler(getNews));
