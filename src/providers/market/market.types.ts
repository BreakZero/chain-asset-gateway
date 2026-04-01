export interface GetPriceInput {
  chain: 'bitcoin' | 'ethereum';
  chainId?: number;
  assetId?: string;
  symbol?: string;
  contractAddress?: string;
}

export interface ProviderPriceQuote {
  chain: 'bitcoin' | 'ethereum';
  chainId: number | null;
  assetId: string;
  contractAddress: string | null;
  currency: 'USD';
  priceUsd: string;
  source: string;
  updatedAt: string;
}

export interface MarketProvider {
  getPrice(input: GetPriceInput): Promise<ProviderPriceQuote>;
}
