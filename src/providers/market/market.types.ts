export interface GetPriceInput {
  chain: 'bitcoin' | 'ethereum';
  network?: 'mainnet' | 'testnet';
  chainId?: number;
  assetId?: string;
  symbol?: string;
  contractAddress?: string;
}

export interface GetMarketChartInput extends GetPriceInput {
  days: number;
  interval: 'hourly' | 'daily';
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

export interface ProviderMarketCandle {
  openTime: string;
  closeTime: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

export interface ProviderMarketChart {
  chain: 'bitcoin' | 'ethereum';
  chainId: number | null;
  assetId: string;
  contractAddress: string | null;
  currency: 'USD';
  interval: 'hourly' | 'daily';
  days: number;
  candles: ProviderMarketCandle[];
  source: string;
  updatedAt: string;
}

export interface MarketProvider {
  getPrice(input: GetPriceInput): Promise<ProviderPriceQuote>;
  getMarketChart(input: GetMarketChartInput): Promise<ProviderMarketChart>;
}
