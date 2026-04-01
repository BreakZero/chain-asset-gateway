import { EVM_CHAIN_IDS } from '@/config/constants';
import type { TransactionDetail } from '@/domain/transaction';
import { mapBitcoinTransactionToDetail, mapEvmTransactionToDetail } from '@/mappers/transaction.mapper';
import { BitcoinCoreProvider } from '@/providers/bitcoin/bitcoin.provider';
import type { BitcoinProvider } from '@/providers/bitcoin/bitcoin.types';
import { ViemEvmProvider } from '@/providers/evm/evm.provider';
import type { EvmProvider } from '@/providers/evm/evm.types';
import { AppError } from '@/utils/app-error';

export class TransactionService {
  constructor(
    private readonly chainId = EVM_CHAIN_IDS.ETHEREUM_MAINNET,
    private readonly evmProvider: EvmProvider = new ViemEvmProvider(chainId),
    private readonly bitcoinProvider: BitcoinProvider = new BitcoinCoreProvider(),
  ) {}

  async getEthereumTransaction(txHash: string): Promise<TransactionDetail> {
    const tx = await this.evmProvider.getTransactionByHash(txHash);
    if (!tx) {
      throw new AppError('Ethereum transaction not found', 404, 'TRANSACTION_NOT_FOUND', {
        chain: 'ethereum',
        txHash,
      });
    }

    return mapEvmTransactionToDetail(tx);
  }

  async getBitcoinTransaction(txHash: string): Promise<TransactionDetail> {
    const tx = await this.bitcoinProvider.getRawTransaction(txHash);
    if (!tx) {
      throw new AppError('Bitcoin transaction not found', 404, 'TRANSACTION_NOT_FOUND', {
        chain: 'bitcoin',
        txHash,
      });
    }

    return mapBitcoinTransactionToDetail(tx);
  }

  async broadcastBitcoinTransaction(rawTx: string): Promise<{ accepted: boolean; txHash: string | null; warning: string | null }> {
    // TODO: Add policy controls, mempool checks, and request rate limiting before enabling this in production.
    try {
      const result = await this.bitcoinProvider.broadcastTransaction(rawTx);
      return {
        accepted: true,
        txHash: result.txHash,
        warning: null,
      };
    } catch {
      return {
        accepted: false,
        txHash: null,
        warning:
          'Broadcast failed or provider is not configured. A production setup should validate rawTx, apply policy checks, and use a hardened Bitcoin broadcast provider.',
      };
    }
  }
}
