import type { Balance } from '@/domain/balance';

export interface PortfolioItem {
  chain: 'ethereum';
  chainId: number;
  address: string;
  balance: Balance;
  includedInTotal: boolean;
}

export interface Portfolio {
  chain: 'ethereum';
  chainId: number;
  address: string;
  items: PortfolioItem[];
  totalValueUsd: string | null;
  source: string;
  updatedAt: string;
  warnings: string[];
}
