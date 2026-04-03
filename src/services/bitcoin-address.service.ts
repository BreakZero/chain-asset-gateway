import type { BitcoinAddressTransactionList, BitcoinUtxoList } from '@/domain/bitcoin-address';
import type { TransactionSummary } from '@/domain/transaction';
import { BitcoinIndexerProvider } from '@/providers/bitcoin/bitcoin-indexer.provider';
import type {
  BitcoinAddressProvider,
  BitcoinAddressTransaction,
  BitcoinAddressUtxo,
} from '@/providers/bitcoin/bitcoin.types';
import { formatTokenAmount } from '@/utils/amount';
import { nowIso } from '@/utils/time';

export class BitcoinAddressService {
  constructor(private readonly bitcoinAddressProvider: BitcoinAddressProvider = new BitcoinIndexerProvider()) {}

  async getAddressUtxos(address: string): Promise<BitcoinUtxoList> {
    const utxos = await this.bitcoinAddressProvider.getAddressUtxos(address);
    const updatedAt = nowIso();

    return {
      address,
      items: utxos.map((utxo) => this.mapUtxo(utxo)),
      total: utxos.length,
      source: 'bitcoin-indexer',
      updatedAt,
    };
  }

  async getAddressTransactions(
    address: string,
    options: {
      lastSeenTxid?: string;
      limit: number;
    },
  ): Promise<BitcoinAddressTransactionList> {
    const transactions = await this.bitcoinAddressProvider.getAddressTransactions(address, options.lastSeenTxid);
    const updatedAt = nowIso();
    const items = transactions.slice(0, options.limit).map((tx) => this.mapTransaction(tx, updatedAt));

    return {
      address,
      items,
      total: items.length,
      nextCursor: items.length === options.limit && items.length > 0 ? items[items.length - 1]?.hash ?? null : null,
      source: 'bitcoin-indexer',
      updatedAt,
    };
  }

  private mapUtxo(utxo: BitcoinAddressUtxo): BitcoinUtxoList['items'][number] {
    return {
      txid: utxo.txid,
      vout: utxo.vout,
      value: formatTokenAmount(BigInt(utxo.value), 8),
      status: {
        confirmed: utxo.status.confirmed,
        blockHeight: utxo.status.block_height ?? null,
        blockHash: utxo.status.block_hash ?? null,
        blockTime: utxo.status.block_time ?? null,
      },
    };
  }

  private mapTransaction(tx: BitcoinAddressTransaction, updatedAt: string): TransactionSummary {
    return {
      chain: 'bitcoin',
      chainId: null,
      hash: tx.txid,
      status: tx.status.confirmed ? 'confirmed' : 'pending',
      blockNumber: tx.status.block_height ? String(tx.status.block_height) : null,
      from: null,
      to: null,
      valueRaw: null,
      valueFormatted: null,
      decimals: 8,
      updatedAt,
      source: 'bitcoin-indexer',
    };
  }
}
