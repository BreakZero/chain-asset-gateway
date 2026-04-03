import { Router } from 'express';

import {
  getBitcoinAddressTransactions,
  getBitcoinAddressUtxos,
  getBitcoinNativeBalance,
} from '@/controllers/bitcoin-address.controller';
import {
  getEthereumErc20Balance,
  getEthereumNativeBalance,
} from '@/controllers/ethereum-balance.controller';
import { asyncHandler } from '@/utils/async-handler';

export const balanceRouter = Router();

balanceRouter.get('/balances/bitcoin/:address/native', asyncHandler(getBitcoinNativeBalance));
balanceRouter.get('/addresses/bitcoin/:address/utxos', asyncHandler(getBitcoinAddressUtxos));
balanceRouter.get('/addresses/bitcoin/:address/transactions', asyncHandler(getBitcoinAddressTransactions));
balanceRouter.get('/balances/ethereum/:address/native', asyncHandler(getEthereumNativeBalance));
balanceRouter.get(
  '/balances/ethereum/:address/erc20/:contractAddress',
  asyncHandler(getEthereumErc20Balance),
);
