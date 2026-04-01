import { env } from '@/config/env';

export class HealthService {
  getStatus(): { status: string; environment: string } {
    return {
      status: 'ok',
      environment: env.NODE_ENV,
    };
  }
}
