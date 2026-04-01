import type { Request, Response } from 'express';

import { HealthService } from '@/services/health.service';
import { ok } from '@/utils/api-response';

const healthService = new HealthService();

export const getHealth = (_request: Request, response: Response): void => {
  response.json(ok(healthService.getStatus(), 'system'));
};
