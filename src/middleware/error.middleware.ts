import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/utils/app-error';
import { logger } from '@/utils/logger';

export const errorMiddleware = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? null,
      },
      meta: {
        updatedAt: new Date().toISOString(),
      },
    });
    return;
  }

  logger.error('Unhandled error', {
    error: error instanceof Error ? error.message : String(error),
  });

  response.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
      details: null,
    },
    meta: {
      updatedAt: new Date().toISOString(),
    },
  });
};
