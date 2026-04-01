import type { Asset } from '@/domain/asset';

export interface Price {
  chain: Asset['chain'];
  chainId: number | null;
  assetId: string;
  contractAddress: string | null;
  currency: 'USD';
  price: string;
  source: string;
  updatedAt: string;
}
