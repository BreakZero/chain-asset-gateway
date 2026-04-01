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

export interface BitcoinProvider {
  getChainInfo(): Promise<BitcoinChainInfo>;
  getRawTransaction(txHash: string): Promise<BitcoinTransactionRaw | null>;
  broadcastTransaction(rawTx: string): Promise<{ txHash: string }>;
  getAddressUtxos(address: string): Promise<unknown[]>;
}
