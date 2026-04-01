import { Router } from 'express';

import {
  broadcastBitcoinTransaction,
  getBitcoinTransaction,
} from '@/controllers/bitcoin-transaction.controller';
import { getEthereumTransaction } from '@/controllers/ethereum-transaction.controller';
import { asyncHandler } from '@/utils/async-handler';

export const transactionRouter = Router();

transactionRouter.get('/transactions/ethereum/:txHash', asyncHandler(getEthereumTransaction));
transactionRouter.get('/transactions/bitcoin/:txHash', asyncHandler(getBitcoinTransaction));
transactionRouter.post('/transactions/bitcoin/broadcast', asyncHandler(broadcastBitcoinTransaction));
