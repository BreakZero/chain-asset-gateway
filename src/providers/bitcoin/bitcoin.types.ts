export interface BitcoinChainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestBlockHash: string;
}

export interface BitcoinTransactionRaw {
  txid: string;
  hex?: string;
  blockhash?: string;
  confirmations?: number;
  time?: number;
  details?: unknown;
  raw: Record<string, unknown>;
}

export interface BitcoinAddressBalance {
  address: string;
  totalAmountBtc: string;
  unspentOutputs: number;
}

export interface BitcoinAddressUtxo {
  txid: string;
  vout: number;
  value: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface BitcoinAddressTransaction {
  txid: string;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface BitcoinProvider {
  getChainInfo(): Promise<BitcoinChainInfo>;
  getRawTransaction(txHash: string): Promise<BitcoinTransactionRaw | null>;
  broadcastTransaction(rawTx: string): Promise<{ txHash: string }>;
}

export interface BitcoinAddressProvider {
  getAddressBalance(address: string): Promise<BitcoinAddressBalance>;
  getAddressUtxos(address: string): Promise<BitcoinAddressUtxo[]>;
  getAddressTransactions(address: string, lastSeenTxid?: string): Promise<BitcoinAddressTransaction[]>;
}
