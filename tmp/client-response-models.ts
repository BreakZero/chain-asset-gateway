export type Chain = 'bitcoin' | 'ethereum';
export type AssetType = 'native' | 'erc20';
export type NetworkType = 'mainnet' | 'testnet';
export type AssetStatus = 'active' | 'inactive';
export type FiatCurrency = 'USD';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'unknown';

export interface ApiResponseMeta {
  requestId?: string;
  source?: string;
  updatedAt?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details: unknown | null;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: ApiResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta?: ApiResponseMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface AssetModel {
  chain: Chain;
  chainId: number | null;
  network: NetworkType;
  assetType: AssetType;
  assetId: string;
  symbol: string | null;
  name: string | null;
  logoUrl: string | null;
  contractAddress: string | null;
  decimals: number | null;
  status: AssetStatus;
  source: string;
  updatedAt: string;
}

export interface AmountModel {
  raw: string;
  formatted: string;
  decimals: number;
}

export interface PriceModel {
  chain: Chain;
  chainId: number | null;
  assetId: string;
  contractAddress: string | null;
  currency: FiatCurrency;
  price: string;
  source: string;
  updatedAt: string;
}

export interface MarketCandleModel {
  openTime: string;
  closeTime: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

export interface MarketChartModel {
  chain: Chain;
  chainId: number | null;
  assetId: string;
  contractAddress: string | null;
  currency: FiatCurrency;
  interval: 'hourly' | 'daily';
  days: number;
  candles: MarketCandleModel[];
  source: string;
  updatedAt: string;
}

export interface BalanceModel {
  chain: Chain;
  chainId: number | null;
  address: string;
  asset: AssetModel;
  amount: AmountModel;
  priceUsd: string | null;
  valueUsd: string | null;
  source: string;
  updatedAt: string;
}

export interface PortfolioItemModel {
  chain: 'ethereum';
  chainId: number;
  address: string;
  balance: BalanceModel;
  includedInTotal: boolean;
}

export interface PortfolioModel {
  chain: 'ethereum';
  chainId: number;
  address: string;
  items: PortfolioItemModel[];
  totalValueUsd: string | null;
  source: string;
  updatedAt: string;
  warnings: string[];
}

export interface TransactionSummaryModel {
  chain: Chain;
  chainId: number | null;
  hash: string;
  status: TransactionStatus;
  blockNumber: string | null;
  from: string | null;
  to: string | null;
  valueRaw: string | null;
  valueFormatted: string | null;
  decimals: number | null;
  updatedAt: string;
  source: string;
}

export interface TransactionDetailModel extends TransactionSummaryModel {
  feeRaw: string | null;
  feeFormatted: string | null;
  symbol: string | null;
  raw: Record<string, unknown> | null;
}

export interface HealthModel {
  status: 'ok';
  environment: 'development' | 'test' | 'production';
}

export interface AssetsListModel {
  items: AssetModel[];
  total: number;
}

export interface BitcoinBroadcastResultModel {
  accepted: boolean;
  txHash: string | null;
  warning: string | null;
}

export type HealthResponse = ApiResponse<HealthModel>;
export type AssetsResponse = ApiResponse<AssetsListModel>;
export type PriceResponse = ApiResponse<PriceModel>;
export type MarketChartResponse = ApiResponse<MarketChartModel>;
export type BalanceResponse = ApiResponse<BalanceModel>;
export type PortfolioResponse = ApiResponse<PortfolioModel>;
export type TransactionDetailResponse = ApiResponse<TransactionDetailModel>;
export type BitcoinBroadcastResponse = ApiResponse<BitcoinBroadcastResultModel>;
