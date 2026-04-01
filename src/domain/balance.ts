import type { Asset } from '@/domain/asset';

export interface AmountValue {
  raw: string;
  formatted: string;
  decimals: number;
}

export interface Balance {
  chain: Asset['chain'];
  chainId: number | null;
  address: string;
  asset: Asset;
  amount: AmountValue;
  priceUsd: string | null;
  valueUsd: string | null;
  source: string;
  updatedAt: string;
}
