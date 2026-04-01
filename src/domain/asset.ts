export type ChainId = 'bitcoin' | 'ethereum';
export type AssetType = 'native' | 'erc20';
export type NetworkType = 'mainnet' | 'testnet';
export type AssetStatus = 'active' | 'inactive';

export interface Asset {
  chain: ChainId;
  chainId: number | null;
  network: NetworkType;
  assetType: AssetType;
  assetId: string;
  symbol: string | null;
  name: string | null;
  contractAddress: string | null;
  decimals: number | null;
  status: AssetStatus;
  source: string;
  updatedAt: string;
}
