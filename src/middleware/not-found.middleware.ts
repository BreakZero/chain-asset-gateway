import type { Request, Response } from 'express';

export const notFoundMiddleware = (_request: Request, response: Response): void => {
  response.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      details: null,
    },
    meta: {
      updatedAt: new Date().toISOString(),
    },
  });
};
