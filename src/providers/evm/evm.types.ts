export interface EvmTokenMetadata {
  chainId: number;
  name: string | null;
  symbol: string | null;
  decimals: number;
  contractAddress: string;
}

export interface EvmTransactionRaw {
  chainId: number;
  hash: string;
  blockNumber: bigint | null;
  from: string;
  to: string | null;
  value: bigint;
  gas: bigint;
  gasPrice: bigint | null;
  effectiveGasPrice: bigint | null;
  gasUsed: bigint | null;
  status: 'pending' | 'confirmed' | 'failed';
  blockHash: string | null;
  transactionIndex: number | null;
  raw: Record<string, unknown>;
}

export interface EvmProvider {
  getNativeBalance(address: string): Promise<bigint>;
  getErc20Metadata(contractAddress: string): Promise<EvmTokenMetadata>;
  getErc20Balance(address: string, contractAddress: string): Promise<bigint>;
  getTransactionByHash(txHash: string): Promise<EvmTransactionRaw | null>;
  getBlockNumber(): Promise<bigint>;
}
