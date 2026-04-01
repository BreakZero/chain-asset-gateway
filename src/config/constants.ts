export const CHAINS = {
  BITCOIN: 'bitcoin',
  ETHEREUM: 'ethereum',
} as const;

export const EVM_CHAIN_IDS = {
  ETHEREUM_MAINNET: 1,
  ETHEREUM_SEPOLIA: 11155111,
} as const;

export const BITCOIN_NETWORKS = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
} as const;

export const ASSET_TYPES = {
  NATIVE: 'native',
  ERC20: 'erc20',
} as const;

export const CURRENCIES = {
  USD: 'USD',
} as const;

export const CACHE_KEYS = {
  PRICE: 'price',
  ETH_BALANCE: 'eth-balance',
} as const;

export const DEFAULT_CACHE_TTL_MS = {
  PRICE: 30_000,
  BALANCE: 15_000,
} as const;
