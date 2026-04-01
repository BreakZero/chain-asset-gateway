# API Examples

## Purpose

This document provides practical request examples, expected response shapes, and common failure cases for the currently implemented MVP endpoints.

## Prerequisites

- The server is running with `pnpm dev`
- `.env` is configured
- `ETHEREUM_RPC_URL` is required for Ethereum balance and transaction endpoints
- `SEPOLIA_RPC_URL` is required for Sepolia balance and transaction endpoints
- `COINGECKO_BASE_URL` is required for price lookups
- `COINGECKO_API_KEY` may be required depending on the upstream plan

Base URL used below:

```text
http://localhost:3000
```

## 0. Supported Assets

### Request

Get all supported assets:

```bash
curl "http://localhost:3000/v1/assets"
```

Filter by chain:

```bash
curl "http://localhost:3000/v1/assets?chain=ethereum"
```

Filter by Sepolia:

```bash
curl "http://localhost:3000/v1/assets?chain=ethereum&chainId=11155111"
```

Filter by symbol:

```bash
curl "http://localhost:3000/v1/assets?symbol=USDT"
```

### Expected Response

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
        "contractAddress": null,
        "decimals": 8,
        "status": "active",
        "source": "config:assets-json",
        "updatedAt": "2026-04-01T00:00:00.000Z"
      },
      {
        "chain": "ethereum",
        "chainId": 1,
        "network": "mainnet",
        "assetType": "native",
        "assetId": "eth",
        "symbol": "ETH",
        "name": "Ethereum",
        "contractAddress": null,
        "decimals": 18,
        "status": "active",
        "source": "config:assets-json",
        "updatedAt": "2026-04-01T00:00:00.000Z"
      }
    ],
    "total": 2
  },
  "meta": {
    "source": "config:assets-json",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### Common Failure Cases

- Invalid `chain` or `assetType` query value: `400 VALIDATION_ERROR`
- No matched assets: returns `success: true` with an empty `items` array and `total: 0`

## 1. Health

### Request

```bash
curl "http://localhost:3000/health"
```

### Expected Response

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

### Common Failure Cases

- Server not running: connection refused from `curl`
- Wrong port: 404 or connection error depending on the target

## 2. Native Price

### Request

Bitcoin by asset id:

```bash
curl "http://localhost:3000/v1/prices?chain=bitcoin&assetId=bitcoin"
```

Ethereum by symbol:

```bash
curl "http://localhost:3000/v1/prices?chain=ethereum&symbol=ETH"
```

Sepolia native ETH price using mainnet ETH market reference:

```bash
curl "http://localhost:3000/v1/prices?chain=ethereum&chainId=11155111&assetId=ethereum"
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "chainId": 1,
    "assetId": "ethereum",
    "contractAddress": null,
    "currency": "USD",
    "price": "3200.12",
    "source": "coingecko",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  },
  "meta": {
    "source": "coingecko",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### Common Failure Cases

- Missing or invalid query parameters: `400 VALIDATION_ERROR`
- Asset not found upstream: `404 PRICE_NOT_FOUND`
- CoinGecko unavailable or rate-limited: `5xx` provider failure
- Sepolia ERC20 pricing: `501 TESTNET_PRICE_UNSUPPORTED`

Example invalid request:

```bash
curl "http://localhost:3000/v1/prices?chain=bitcoin"
```

Example error shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid price query",
    "details": {}
  },
  "meta": {
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

## 3. ERC20 Price

### Request

USDC on Ethereum:

```bash
curl "http://localhost:3000/v1/prices?chain=ethereum&contractAddress=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "assetId": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "currency": "USD",
    "price": "1",
    "source": "coingecko",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  },
  "meta": {
    "source": "coingecko",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### Common Failure Cases

- Invalid contract address: `400 VALIDATION_ERROR`
- Contract has no CoinGecko price mapping: `404 PRICE_NOT_FOUND`

## 4. Ethereum Native Balance

### Request

```bash
curl "http://localhost:3000/v1/balances/ethereum/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/native"
```

Sepolia:

```bash
curl "http://localhost:3000/v1/balances/ethereum/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/native?chainId=11155111"
```

Without price lookup:

```bash
curl "http://localhost:3000/v1/balances/ethereum/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/native?includePrice=false"
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "chainId": 1,
    "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    "asset": {
      "chain": "ethereum",
      "chainId": 1,
      "network": "mainnet",
      "assetType": "native",
      "assetId": "eth",
      "symbol": "ETH",
      "name": "Ethereum",
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
    "priceUsd": "3200.12",
    "valueUsd": "3200.12",
    "source": "ethereum-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  },
  "meta": {
    "source": "ethereum-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### Common Failure Cases

- Invalid wallet address: `400 VALIDATION_ERROR`
- Missing `ETHEREUM_RPC_URL`: `500 EVM_PROVIDER_NOT_CONFIGURED`
- Missing `SEPOLIA_RPC_URL` while using `chainId=11155111`: `500 EVM_PROVIDER_NOT_CONFIGURED`
- Upstream RPC timeout or failure: `5xx` provider failure

## 5. Ethereum ERC20 Balance

### Request

USDC balance:

```bash
curl "http://localhost:3000/v1/balances/ethereum/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/erc20/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
```

Sepolia ERC20 by contract address:

```bash
curl "http://localhost:3000/v1/balances/ethereum/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/erc20/0x0000000000000000000000000000000000000000?chainId=11155111&includePrice=false"
```

Without price lookup:

```bash
curl "http://localhost:3000/v1/balances/ethereum/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/erc20/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48?includePrice=false"
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "chainId": 1,
    "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    "asset": {
      "chain": "ethereum",
      "chainId": 1,
      "network": "mainnet",
      "assetType": "erc20",
      "assetId": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "symbol": "USDC",
      "name": "USD Coin",
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

### Common Failure Cases

- Invalid wallet address: `400 VALIDATION_ERROR`
- Invalid token contract address: `400 VALIDATION_ERROR`
- RPC does not support the token call path or token ABI read fails: `5xx` provider failure
- Sepolia ERC20 with `includePrice=true`: `501 TESTNET_PRICE_UNSUPPORTED`
- Token has no price upstream: price lookup may fail and surface upstream errors

## 6. Ethereum Transaction Detail

### Request

```bash
curl "http://localhost:3000/v1/transactions/ethereum/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
```

Sepolia:

```bash
curl "http://localhost:3000/v1/transactions/ethereum/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?chainId=11155111"
```

### Expected Response

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
      "status": "success",
      "blockNumber": "123"
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

### Common Failure Cases

- Invalid transaction hash: `400 VALIDATION_ERROR`
- Transaction not found: `404 TRANSACTION_NOT_FOUND`
- Missing `ETHEREUM_RPC_URL`: `500 EVM_PROVIDER_NOT_CONFIGURED`
- Missing `SEPOLIA_RPC_URL` while using `chainId=11155111`: `500 EVM_PROVIDER_NOT_CONFIGURED`
- Receipt unavailable for pending transaction: status may be `pending`, fee fields may be `null`

## 7. Ethereum Portfolio

### Request

```bash
curl "http://localhost:3000/v1/portfolio/ethereum/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
```

Sepolia:

```bash
curl "http://localhost:3000/v1/portfolio/ethereum/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?chainId=11155111"
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "chainId": 1,
    "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    "items": [
      {
        "chain": "ethereum",
        "chainId": 1,
        "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        "balance": {
          "chain": "ethereum",
          "chainId": 1,
          "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
          "asset": {
            "chain": "ethereum",
            "chainId": 1,
            "network": "mainnet",
            "assetType": "native",
            "assetId": "eth",
            "symbol": "ETH",
            "name": "Ethereum",
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
          "priceUsd": "3200.12",
          "valueUsd": "3200.12",
          "source": "ethereum-rpc",
          "updatedAt": "2026-04-01T00:00:00.000Z"
        },
        "includedInTotal": true
      }
    ],
    "totalValueUsd": "3200.12",
    "source": "ethereum-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z",
    "warnings": [
      "ERC20 auto-discovery is not implemented in this MVP. Raw Ethereum JSON-RPC alone is not sufficient for reliable wallet-wide token discovery without an indexer or curated token list."
    ]
  },
  "meta": {
    "source": "ethereum-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### Common Failure Cases

- Invalid address: `400 VALIDATION_ERROR`
- Missing `ETHEREUM_RPC_URL`: `500 EVM_PROVIDER_NOT_CONFIGURED`
- Missing `SEPOLIA_RPC_URL` while using `chainId=11155111`: `500 EVM_PROVIDER_NOT_CONFIGURED`

## 8. Bitcoin Transaction Detail

### Request

```bash
curl "http://localhost:3000/v1/transactions/bitcoin/<txHash>"
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "chain": "bitcoin",
    "hash": "<txHash>",
    "status": "confirmed",
    "blockNumber": null,
    "from": null,
    "to": null,
    "valueRaw": null,
    "valueFormatted": null,
    "decimals": 8,
    "feeRaw": null,
    "feeFormatted": null,
    "symbol": "BTC",
    "raw": {},
    "updatedAt": "2026-04-01T00:00:00.000Z",
    "source": "bitcoin-rpc"
  },
  "meta": {
    "source": "bitcoin-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### Common Failure Cases

- Invalid tx hash: `400 VALIDATION_ERROR`
- Transaction not found: `404 TRANSACTION_NOT_FOUND`
- Missing Bitcoin RPC config: `500 BITCOIN_PROVIDER_NOT_CONFIGURED`

## 9. Bitcoin Broadcast

### Request

```bash
curl -X POST "http://localhost:3000/v1/transactions/bitcoin/broadcast" \
  -H "Content-Type: application/json" \
  -d '{"rawTx":"<raw-hex>"}'
```

### Expected Response

Success case:

```json
{
  "success": true,
  "data": {
    "accepted": true,
    "txHash": "<txHash>",
    "warning": null
  },
  "meta": {
    "source": "bitcoin-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

Placeholder/failure case:

```json
{
  "success": true,
  "data": {
    "accepted": false,
    "txHash": null,
    "warning": "Broadcast failed or provider is not configured. A production setup should validate rawTx, apply policy checks, and use a hardened Bitcoin broadcast provider."
  },
  "meta": {
    "source": "bitcoin-rpc",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

### Common Failure Cases

- Missing `rawTx`: `400 VALIDATION_ERROR`
- Provider unavailable or broadcast rejected: placeholder warning response with `accepted: false`

## Notes

- Response examples are representative and will vary by upstream state.
- `updatedAt` timestamps are runtime-generated.
- Price and balance values depend on live RPC and market providers.
