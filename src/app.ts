import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { assetRouter } from '@/routes/asset.routes';
import { balanceRouter } from '@/routes/balance.routes';
import { healthRouter } from '@/routes/health.routes';
import { marketRouter } from '@/routes/market.routes';
import { portfolioRouter } from '@/routes/portfolio.routes';
import { priceRouter } from '@/routes/price.routes';
import { transactionRouter } from '@/routes/transaction.routes';
import { errorMiddleware } from '@/middleware/error.middleware';
import { notFoundMiddleware } from '@/middleware/not-found.middleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use(healthRouter);
  app.use('/v1', assetRouter);
  app.use('/v1', marketRouter);
  app.use('/v1', priceRouter);
  app.use('/v1', balanceRouter);
  app.use('/v1', portfolioRouter);
  app.use('/v1', transactionRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
