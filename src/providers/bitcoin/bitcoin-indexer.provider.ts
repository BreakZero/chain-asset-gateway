import axios, { type AxiosInstance } from 'axios';

import { env } from '@/config/env';
import type {
  BitcoinAddressBalance,
  BitcoinAddressProvider,
  BitcoinAddressTransaction,
  BitcoinAddressUtxo,
} from '@/providers/bitcoin/bitcoin.types';
import { AppError } from '@/utils/app-error';

interface MempoolAddressStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

interface MempoolAddressResponse {
  address: string;
  chain_stats: MempoolAddressStats;
  mempool_stats: MempoolAddressStats;
}

export class BitcoinIndexerProvider implements BitcoinAddressProvider {
  private readonly client: AxiosInstance;

  constructor(client?: AxiosInstance) {
    this.client =
      client ??
      axios.create({
        baseURL: env.BITCOIN_INDEXER_BASE_URL,
        timeout: 10_000,
      });
  }

  async getAddressBalance(address: string): Promise<BitcoinAddressBalance> {
    try {
      const [addressResponse, utxoResponse] = await Promise.all([
        this.client.get<MempoolAddressResponse>(`/address/${address}`),
        this.client.get<unknown[]>(`/address/${address}/utxo`),
      ]);

      const chainStats = addressResponse.data.chain_stats;
      const mempoolStats = addressResponse.data.mempool_stats;
      const confirmedBalanceSats = chainStats.funded_txo_sum - chainStats.spent_txo_sum;
      const mempoolBalanceSats = mempoolStats.funded_txo_sum - mempoolStats.spent_txo_sum;
      const totalBalanceSats = confirmedBalanceSats + mempoolBalanceSats;

      return {
        address,
        totalAmountBtc: (totalBalanceSats / 100_000_000).toFixed(8),
        unspentOutputs: Array.isArray(utxoResponse.data) ? utxoResponse.data.length : 0,
      };
    } catch (error) {
      throw this.wrapIndexerError(error, address);
    }
  }

  async getAddressUtxos(address: string): Promise<unknown[]> {
    try {
      const response = await this.client.get<BitcoinAddressUtxo[]>(`/address/${address}/utxo`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw this.wrapIndexerError(error, address);
    }
  }

  async getAddressTransactions(address: string, lastSeenTxid?: string): Promise<BitcoinAddressTransaction[]> {
    try {
      const endpoint = lastSeenTxid
        ? `/address/${address}/txs/chain/${lastSeenTxid}`
        : `/address/${address}/txs`;
      const response = await this.client.get<BitcoinAddressTransaction[]>(endpoint);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw this.wrapIndexerError(error, address);
    }
  }

  private wrapIndexerError(error: unknown, address: string): AppError {
    if (axios.isAxiosError(error)) {
      return new AppError(
        error.message,
        error.response?.status ?? 502,
        'BITCOIN_INDEXER_ERROR',
        {
          address,
          status: error.response?.status ?? null,
          data: error.response?.data ?? null,
        },
      );
    }

    if (error instanceof AppError) {
      return error;
    }

    return new AppError('Bitcoin indexer request failed', 502, 'BITCOIN_INDEXER_ERROR', {
      address,
    });
  }
}
