import type { ChainId } from '@/domain/asset';

export interface MarketCandle {
  openTime: string;
  closeTime: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

export interface MarketChart {
  chain: ChainId;
  chainId: number | null;
  assetId: string;
  contractAddress: string | null;
  currency: 'USD';
  interval: 'hourly' | 'daily';
  days: number;
  candles: MarketCandle[];
  source: string;
  updatedAt: string;
}
