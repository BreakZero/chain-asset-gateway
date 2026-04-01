import { Router } from 'express';

import {
  getEthereumErc20Balance,
  getEthereumNativeBalance,
} from '@/controllers/ethereum-balance.controller';
import { asyncHandler } from '@/utils/async-handler';

export const balanceRouter = Router();

balanceRouter.get('/balances/ethereum/:address/native', asyncHandler(getEthereumNativeBalance));
balanceRouter.get(
  '/balances/ethereum/:address/erc20/:contractAddress',
  asyncHandler(getEthereumErc20Balance),
);
