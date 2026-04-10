import type { Request, Response } from 'express';

import { getNewsQuerySchema } from '@/schemas/news.schema';
import { NewsService } from '@/services/news.service';
import { AppError } from '@/utils/app-error';
import { ok } from '@/utils/api-response';

export const getNews = async (request: Request, response: Response): Promise<void> => {
  const parsed = getNewsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError('Invalid news query', 400, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  const newsService = new NewsService();
  const result = await newsService.getNews(parsed.data);

  response.json(ok(result, result.source));
};
