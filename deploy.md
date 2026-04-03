# Deploy Guide

## Purpose

This document describes a simple production-oriented deployment flow for the current Node.js + TypeScript backend.

The project is built as a lightweight API service. The deployment steps below assume:

- a Linux remote server
- Node.js installed on the target machine
- process management handled by `systemd`
- reverse proxy handled by Nginx

This guide intentionally keeps the setup simple. It does not introduce Docker, Kubernetes, or CI/CD pipelines.

## Deployment Strategy

Recommended flow:

1. Build locally or in CI
2. Upload the application files to the remote server
3. Install production dependencies on the server
4. Configure environment variables
5. Start the service with `systemd`
6. Put Nginx in front of the service

## Runtime Requirements

Recommended runtime versions:

- Node.js 20+
- npm 10+ or pnpm 10+

Current project notes:

- local development uses `tsx`
- production runtime should use the built `dist/server.js`
- tests are optional for deployment, but should be run before release

## Files Needed On The Remote Server

Minimum required files:

- `package.json`
- `package-lock.json` or `pnpm-lock.yaml` if you use one
- `dist/`
- `.env`

Useful to keep on the server:

- `README.md`
- `doc/`
- `AGENT.md`

Do not upload:

- `node_modules/`
- local editor files
- local caches
- test coverage output

## Environment Variables

Create a production `.env` file on the server.

Example:

```env
PORT=3000
NODE_ENV=production
ETHEREUM_RPC_URL=https://your-ethereum-mainnet-rpc
SEPOLIA_RPC_URL=https://your-sepolia-rpc
BITCOIN_RPC_URL=https://your-bitcoin-core-rpc
BITCOIN_RPC_USERNAME=
BITCOIN_RPC_PASSWORD=
BITCOIN_INDEXER_BASE_URL=https://mempool.space/api
COINGECKO_API_KEY=
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
```

Notes:

- `BITCOIN_RPC_URL` is used for Bitcoin raw transaction and broadcast flows
- `BITCOIN_INDEXER_BASE_URL` is used for Bitcoin address balance, UTXO, and address transaction lookups
- use private or managed RPC endpoints for production
- do not commit production `.env` files

## Local Build

Run these commands locally before upload:

```bash
npm test
npm run build
```

Expected output:

- a fresh `dist/` directory

If you use pnpm locally:

```bash
pnpm test
pnpm build
```

## Package And Upload

One simple packaging approach:

```bash
tar -czf chain-asset-gateway.tar.gz \
  dist \
  package.json \
  package-lock.json \
  README.md \
  AGENT.md \
  doc
```

Upload to the server:

```bash
scp chain-asset-gateway.tar.gz user@your-server:/opt/
```

## Remote Server Setup

Connect to the server:

```bash
ssh user@your-server
```

Create a target directory:

```bash
sudo mkdir -p /opt/chain-asset-gateway
sudo chown -R $USER:$USER /opt/chain-asset-gateway
cd /opt/chain-asset-gateway
```

Extract the uploaded package:

```bash
tar -xzf /opt/chain-asset-gateway.tar.gz -C /opt/chain-asset-gateway
```

Install production dependencies:

```bash
npm install --omit=dev
```

Create the production `.env`:

```bash
cp /path/to/your/secure/env .env
```

## Manual Startup Check

Before wiring process management, test the service directly:

```bash
node dist/server.js
```

Then check:

```bash
curl http://127.0.0.1:3000/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "environment": "production"
  }
}
```

Stop the process after verification.

## systemd Service

Create the service file:

```bash
sudo vi /etc/systemd/system/chain-asset-gateway.service
```

Example service:

```ini
[Unit]
Description=Chain Asset Gateway
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/chain-asset-gateway
ExecStart=/usr/bin/node /opt/chain-asset-gateway/dist/server.js
Restart=always
RestartSec=5
EnvironmentFile=/opt/chain-asset-gateway/.env
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Reload and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable chain-asset-gateway
sudo systemctl start chain-asset-gateway
```

Check status:

```bash
sudo systemctl status chain-asset-gateway
```

Read logs:

```bash
sudo journalctl -u chain-asset-gateway -f
```

## Nginx Reverse Proxy

Example Nginx config:

```nginx
server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Deployment Update Flow

For later updates:

1. build locally
2. upload new package
3. extract over the existing release directory
4. run `npm install --omit=dev` if dependencies changed
5. restart the service

Example:

```bash
scp chain-asset-gateway.tar.gz user@your-server:/opt/
ssh user@your-server
cd /opt/chain-asset-gateway
tar -xzf /opt/chain-asset-gateway.tar.gz -C /opt/chain-asset-gateway
npm install --omit=dev
sudo systemctl restart chain-asset-gateway
```

## Post-Deploy Checks

Run these checks after each deploy:

```bash
curl http://127.0.0.1:3000/health
curl "http://127.0.0.1:3000/v1/assets"
curl "http://127.0.0.1:3000/v1/prices?chain=bitcoin&assetId=bitcoin"
```

If Bitcoin indexer is configured:

```bash
curl "http://127.0.0.1:3000/v1/balances/bitcoin/bc1qzkc8h2hsghd7acntvrfv9yeqnuyjlnevj0nkmr/native"
```

## Common Issues

### Service starts but requests fail

Check:

- `.env` values
- RPC endpoint availability
- `BITCOIN_INDEXER_BASE_URL`
- `journalctl` logs

### Ethereum requests fail

Common causes:

- invalid `ETHEREUM_RPC_URL`
- invalid `SEPOLIA_RPC_URL`
- upstream RPC rate limiting

### Bitcoin balance, UTXO, or address transaction requests fail

Common causes:

- invalid `BITCOIN_INDEXER_BASE_URL`
- upstream indexer timeout
- upstream indexer rate limiting

### Bitcoin raw transaction or broadcast requests fail

Common causes:

- invalid `BITCOIN_RPC_URL`
- RPC auth mismatch
- node policy rejecting the request

### Port conflicts

If port `3000` is already used:

- change `PORT` in `.env`
- update the Nginx upstream target

## Hardening Suggestions

Recommended next steps for a more production-ready deployment:

- terminate TLS with Nginx and Certbot
- add request rate limiting
- use private RPC and indexer infrastructure
- rotate secrets outside plain `.env` files
- add structured logs and request IDs
- deploy from CI instead of manual tar uploads
- add release directories and symlink-based rollback
