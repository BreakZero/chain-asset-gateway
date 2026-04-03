import type { TransactionSummary } from '@/domain/transaction';

export interface BitcoinUtxo {
  txid: string;
  vout: number;
  value: string;
  status: {
    confirmed: boolean;
    blockHeight: number | null;
    blockHash: string | null;
    blockTime: number | null;
  };
}

export interface BitcoinUtxoList {
  address: string;
  items: BitcoinUtxo[];
  total: number;
  source: string;
  updatedAt: string;
}

export interface BitcoinAddressTransactionList {
  address: string;
  items: TransactionSummary[];
  total: number;
  nextCursor: string | null;
  source: string;
  updatedAt: string;
}
