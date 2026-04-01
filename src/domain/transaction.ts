import type { ChainId } from '@/domain/asset';

export interface TransactionSummary {
  chain: ChainId;
  chainId: number | null;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed' | 'unknown';
  blockNumber: string | null;
  from: string | null;
  to: string | null;
  valueRaw: string | null;
  valueFormatted: string | null;
  decimals: number | null;
  updatedAt: string;
  source: string;
}

export interface TransactionDetail extends TransactionSummary {
  feeRaw: string | null;
  feeFormatted: string | null;
  symbol: string | null;
  raw: Record<string, unknown> | null;
}
