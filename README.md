# Chain Asset Gateway

Lightweight Node.js + TypeScript aggregation API for frontend-integrated Web3 asset data. This MVP focuses on Bitcoin and Ethereum raw on-chain data plus USD market prices.

Detailed request and response examples are available in [doc/api-examples.md](./doc/api-examples.md).

## Supported Scope

- Bitcoin raw chain info and transaction lookup through a Bitcoin Core compatible JSON-RPC provider
- Ethereum mainnet and Sepolia raw on-chain balance and transaction access via JSON-RPC
- Market prices for BTC, ETH, and Ethereum ERC20 tokens through CoinGecko
- Config-backed supported asset catalog endpoint for frontend asset selection
- Normalized frontend-friendly API response shapes

## Not Included Yet

- Wallet signing
- Swaps or trading
- Authentication
- User accounts
- Database persistence
- Redis
- Full ERC20 wallet discovery from raw RPC alone

## Current Limitations

- `GET /v1/portfolio/ethereum/:address` currently returns ETH only and documents ERC20 discovery limits
- Bitcoin address and UTXO indexing is intentionally minimal because pure Bitcoin Core RPC is limited for address-based queries without extra indexing infrastructure
- Bitcoin broadcast is exposed as a placeholder flow and needs production policy checks before use
- CoinGecko asset resolution is intentionally simple for this starter project
- Sepolia is supported for raw EVM reads through `chainId=11155111`; Sepolia ERC20 market pricing is not supported in this MVP
- Bitcoin remains mainnet-only for now, but response models now reserve `chainId` so network expansion can be added later without changing the overall shape

## Environment Variables

Copy `.env.example` to `.env` and fill in the provider settings.

```env
PORT=3000
NODE_ENV=development
ETHEREUM_RPC_URL=
SEPOLIA_RPC_URL=
BITCOIN_RPC_URL=
BITCOIN_RPC_USERNAME=
BITCOIN_RPC_PASSWORD=
BITCOIN_INDEXER_BASE_URL=https://mempool.space/api
COINGECKO_API_KEY=
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
```

Notes:

- `ETHEREUM_RPC_URL` is required for Ethereum balance and transaction endpoints
- `SEPOLIA_RPC_URL` is required when calling EVM endpoints with `chainId=11155111`
- `BITCOIN_RPC_URL` and Bitcoin RPC auth values are required for Bitcoin transaction endpoints
- `BITCOIN_INDEXER_BASE_URL` is used for Bitcoin address balance and UTXO-style lookups
- `COINGECKO_API_KEY` may be needed depending on your CoinGecko plan
- TODO: Replace public/shared endpoints with production-managed providers and secret management

## Local Development

1. Install dependencies with `pnpm install`
2. Create `.env` from `.env.example`
3. Start the server with `pnpm dev`
4. Build with `pnpm build`
5. Run tests with `pnpm test`

The app starts with one command in development:

```bash
pnpm dev
```

## API Conventions

- Unified wrapper shape: `success`, `data`, `meta`
- Timestamps use ISO strings in `updatedAt`
- Chains are normalized as `bitcoin` and `ethereum`
- Asset types are normalized as `native` and `erc20`
- Token amounts should include `raw`, `formatted`, and `decimals`
- Nullable fields are preferred over shape drift

## Implemented Endpoints

### `GET /v1/assets`

Returns the currently supported assets from a local JSON config source. This is an MVP management mechanism and is intended to move to a database-backed catalog later.

Optional query params:

- `chain`
- `chainId`
- `network`
- `assetType`
- `symbol`

Behavior:

- default `network=mainnet`
- use `network=testnet` to get the supported testnet asset list

Example response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "chain": "bitcoin",
        "chainId": null,
        "network": "mainnet",
        "assetType": "native",
        "assetId": "btc",
        "symbol": "BTC",
        "name": "Bitcoin",
        "logoUrl": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        "contractAddress": null,
        "decimals": 8,
        "status": "active",
        "source": "config:assets-json",
        "updatedAt": "2026-04-01T00:00:00.000Z"
      }
    ],
    "total": 1
  },
  "meta": {
    "source": "config:assets-json",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

Example testnet request:

```bash
curl "http://localhost:3000/v1/assets?network=testnet"
```

### `GET /v1/market/chart`

Returns lightweight K-line chart data for BTC, ETH, and supported Ethereum ERC20 assets using CoinGecko market chart data mapped into candles.

Optional query params:

- `chain`
- `chainId`
- `assetId`
- `contractAddress`
- `symbol`
- `days`
- `interval`

Notes:

- `currency` is normalized to `USD`
- `interval` currently supports `hourly` and `daily`
- `Sepolia ERC20` market chart data is not supported in this MVP

Example response:

```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "chainId": 1,
    "assetId": "ethereum",
    "contractAddress": null,
    "currency": "USD",
    "interval": "daily",
    "days": 7,
    "candles": [
      {
        "openTime": "2026-04-01T00:00:00.000Z",
        "closeTime": "2026-04-02T00:00:00.000Z",
        "open": "3200",
        "high": "3300",
        "low": "3100",
        "close": "3250"
      }
    ],
    "source": "coingecko",
    "updatedAt": "2026-04-02T00:00:00.000Z"
  },
  "meta": {
    "source": "coingecko",
    "updatedAt": "2026-04-02T00:00:00.000Z"
  }
}
```

### `GET /health`

Example response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "environment": "development"
  },
  "meta": {
    "source": "system",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### `GET /v1/prices?chain=bitcoin&assetId=bitcoin`

Also supports:

- `chain=bitcoin&symbol=BTC`
- `chain=ethereum&assetId=ethereum`
- `chain=ethereum&symbol=ETH`
- `chain=ethereum&chainId=11155111&assetId=ethereum`
- `chain=ethereum&contractAddress=0x...`

Example response:

```json
{
  "success": true,
  "data": {
    "chain": "bitcoin",
    "chainId": null,
    "assetId": "bitcoin",
    "contractAddress": null,
    "currency": "USD",
    "price": "68000",
    "source": "coingecko",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  },
  "meta": {
    "source": "coingecko",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### `GET /v1/balances/ethereum/:address/native`

Optional query:

- `chainId=1` for Ethereum mainnet
- `chainId=11155111` for Sepolia
- `includePrice=false`

Example response:

```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "chainId": 1,
    "address": "0x0000000000000000000000000000000000000000",
    "asset": {
      "chain": "ethereum",
      "chainId": 1,
      "network": "mainnet",
      "assetType": "native",
      "assetId": "eth",
      "symbol": "ETH",
      "name": "Ethereum",
      "logoUrl": "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      "contractAddress": null,
      "decimals": 18,
      "status": "active",
      "source": "ethereum-rpc",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    },
    "amount": {
      "raw": "1000000000000000000",
      "formatted": "1",
      "decimals": 18
    },
    "priceUsd": "3200",
    "valueUsd": "3200.00",
    "source": "ethereum-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  },
  "meta": {
    "source": "ethereum-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### `GET /v1/balances/bitcoin/:address/native`

Optional query:

- `includePrice=false`

Notes:

- This MVP implementation uses a mempool/Esplora-style Bitcoin indexer API through the provider layer
- Bitcoin Core RPC remains responsible for raw transaction and broadcast flows

Example response:

```json
{
  "success": true,
  "data": {
    "chain": "bitcoin",
    "chainId": null,
    "address": "bc1qexampleaddress0000000000000000000000000",
    "asset": {
      "chain": "bitcoin",
      "chainId": null,
      "network": "mainnet",
      "assetType": "native",
      "assetId": "btc",
      "symbol": "BTC",
      "name": "Bitcoin",
      "logoUrl": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      "contractAddress": null,
      "decimals": 8,
      "status": "active",
      "source": "bitcoin-rpc",
      "updatedAt": "2026-04-02T00:00:00.000Z"
    },
    "amount": {
      "raw": "1500000",
      "formatted": "0.015",
      "decimals": 8
    },
    "priceUsd": "68000",
    "valueUsd": "1020.00",
    "source": "bitcoin-rpc",
    "updatedAt": "2026-04-02T00:00:00.000Z"
  },
  "meta": {
    "source": "bitcoin-rpc",
    "updatedAt": "2026-04-02T00:00:00.000Z"
  }
}
```

### `GET /v1/addresses/bitcoin/:address/utxos`

Returns the current unspent outputs for a Bitcoin address using the configured Bitcoin indexer provider.

Example response:

```json
{
  "success": true,
  "data": {
    "address": "bc1qexampleaddress0000000000000000000000000",
    "items": [
      {
        "txid": "abc",
        "vout": 0,
        "value": "0.015",
        "status": {
          "confirmed": true,
          "blockHeight": 100,
          "blockHash": "hash",
          "blockTime": 123
        }
      }
    ],
    "total": 1,
    "source": "bitcoin-indexer",
    "updatedAt": "2026-04-02T00:00:00.000Z"
  },
  "meta": {
    "source": "bitcoin-indexer",
    "updatedAt": "2026-04-02T00:00:00.000Z"
  }
}
```

### `GET /v1/addresses/bitcoin/:address/transactions`

Returns a lightweight Bitcoin address transaction list using the configured Bitcoin indexer provider.

Optional query:

- `lastSeenTxid`
- `limit` default `25`, max `25`

Example response:

```json
{
  "success": true,
  "data": {
    "address": "bc1qexampleaddress0000000000000000000000000",
    "items": [
      {
        "chain": "bitcoin",
        "chainId": null,
        "hash": "def",
        "status": "pending",
        "blockNumber": null,
        "from": null,
        "to": null,
        "valueRaw": null,
        "valueFormatted": null,
        "decimals": 8,
        "updatedAt": "2026-04-02T00:00:00.000Z",
        "source": "bitcoin-indexer"
      }
    ],
    "total": 1,
    "nextCursor": "def",
    "source": "bitcoin-indexer",
    "updatedAt": "2026-04-02T00:00:00.000Z"
  },
  "meta": {
    "source": "bitcoin-indexer",
    "updatedAt": "2026-04-02T00:00:00.000Z"
  }
}
```

### `GET /v1/balances/ethereum/:address/erc20/:contractAddress`

Optional query:

- `chainId=1` for Ethereum mainnet
- `chainId=11155111` for Sepolia
- `includePrice=false`

Example response:

```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "chainId": 1,
    "address": "0x0000000000000000000000000000000000000000",
    "asset": {
      "chain": "ethereum",
      "chainId": 1,
      "network": "mainnet",
      "assetType": "erc20",
      "assetId": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "symbol": "USDC",
      "name": "USD Coin",
      "logoUrl": null,
      "contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "decimals": 6,
      "status": "active",
      "source": "ethereum-rpc",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    },
    "amount": {
      "raw": "1234500",
      "formatted": "1.2345",
      "decimals": 6
    },
    "priceUsd": "1",
    "valueUsd": "1.23",
    "source": "ethereum-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  },
  "meta": {
    "source": "ethereum-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### `GET /v1/transactions/ethereum/:txHash`

Returns a normalized Ethereum transaction detail with:

- `chainId` to identify Ethereum mainnet vs Sepolia
- receipt-backed status when available
- fee derived from `gasUsed * effectiveGasPrice` when available
- raw upstream fields included under `raw`

Example response:

```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "chainId": 1,
    "hash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "status": "confirmed",
    "blockNumber": "123",
    "from": "0x1111111111111111111111111111111111111111",
    "to": "0x2222222222222222222222222222222222222222",
    "valueRaw": "1000000000000000000",
    "valueFormatted": "1",
    "decimals": 18,
    "feeRaw": "42000000000000",
    "feeFormatted": "0.000042",
    "symbol": "ETH",
    "raw": {
      "status": "success"
    },
    "updatedAt": "2026-04-01T00:00:00.000Z",
    "source": "ethereum-rpc"
  },
  "meta": {
    "source": "ethereum-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

## Scaffolded Endpoints

- `GET /v1/portfolio/ethereum/:address`
- `GET /v1/transactions/bitcoin/:txHash`
- `POST /v1/transactions/bitcoin/broadcast`

These routes are present in the project. Some are partial MVP implementations, others intentionally return placeholders or warnings where the data source constraints are real.

## Project Structure

```text
src/
  app.ts
  server.ts
  config/
  controllers/
  domain/
  mappers/
  middleware/
  providers/
    bitcoin/
    evm/
    market/
  routes/
  schemas/
  services/
  types/
  utils/
tests/
```

## Production Hardening Suggestions

- Add structured logging with request IDs
- Add retry and circuit-breaker behavior for upstream providers
- Replace in-memory cache with Redis
- Add rate limiting for public endpoints
- Introduce indexer-backed ERC20 portfolio discovery
- Add outbound timeout policies and metrics
- Add integration tests against sandbox or mocked providers
- Move secrets to managed secret storage
