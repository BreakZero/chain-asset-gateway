# AGENT.md

## Purpose

This repository is a production-oriented Node.js + TypeScript backend starter for a Web3 asset aggregation API. The current MVP scope is intentionally narrow:

- Bitcoin raw on-chain data
- Ethereum mainnet and Sepolia raw on-chain data
- Ethereum ERC20 raw token data
- USD market price data

Do not expand scope into wallet signing, swaps, trading, auth, persistence, user systems, Redis, or database modeling unless explicitly requested.

## Stack

- Node.js
- TypeScript with strict mode
- Express
- pnpm
- zod
- axios
- viem
- dotenv
- tsx for local dev
- tsup for builds
- Vitest for tests

## Working Rules

- Keep abstractions small and boring.
- Prefer explicit provider and mapper layers over inline upstream handling in controllers.
- Keep controllers thin.
- Put business logic in services.
- Keep external response normalization inside mappers.
- Use environment variables for all provider URLs and API keys.
- Be honest about upstream/provider limitations. Do not fake completeness.
- Add `TODO:` markers where production infrastructure or provider-specific behavior is still needed.
- Prefer nullable fields over inconsistent response shapes.
- Preserve unified frontend-friendly responses.
- Prefer extending existing modules over creating parallel patterns for the same concern.
- If a new feature touches transport, validation, service logic, and mapping, keep each change in its own layer.
- Avoid broad refactors unless the requested change clearly requires them.
- Do not silently change response contracts for existing routes.

## Normalized Domain Conventions

### Chains

- `bitcoin`
- `ethereum`

### Asset Types

- `native`
- `erc20`

### Amount Shape

Token and coin amounts should use:

- `raw`
- `formatted`
- `decimals`

### Response Wrapper

Use the shared `ApiResponse<T>`-style shape:

- `success`
- `data`
- `meta`

Error responses should go through the centralized error middleware.

## Directory Responsibilities

### Root

- `package.json`: scripts and dependency declarations
- `tsconfig.json`: strict TypeScript config
- `tsup.config.ts`: build config
- `vitest.config.ts`: test config
- `.env.example`: required runtime variables
- `README.md`: public project overview and limitations

### Source

- `src/app.ts`: Express app wiring
- `src/server.ts`: process entrypoint

### Config

- `src/config/env.ts`: env loading and validation
- `src/config/constants.ts`: shared constants and normalized identifiers

### Domain

- `src/domain/*`: internal normalized domain models

### Schemas

- `src/schemas/*`: zod request validation schemas

### Routes

- `src/routes/*`: route registration only

### Controllers

- `src/controllers/*`: parse request input, call services, return normalized responses

### Services

- `src/services/*`: business logic and orchestration across providers and mappers

### Providers

- `src/providers/evm/*`: Ethereum JSON-RPC access through viem
- `src/providers/bitcoin/*`: Bitcoin Core compatible JSON-RPC access
- `src/providers/market/*`: CoinGecko-based market price access

### Mappers

- `src/mappers/*`: isolate upstream-to-domain normalization

### Middleware

- `src/middleware/*`: error and 404 handling

### Utils

- `src/utils/*`: generic helpers only, not business logic

### Tests

- `tests/*`: unit-focused tests for mappers and services

## Change Boundaries

- If changing request parsing, update `src/schemas/*` first.
- If changing response shape, update domain models and mapper output together.
- If adding upstream integration logic, put it under `src/providers/*` and keep transport details there.
- If adding orchestration or fallback behavior across providers, put it in `src/services/*`.
- If adding a new route, wire it in this order:
  1. schema
  2. controller
  3. service
  4. provider or mapper updates
  5. route registration
  6. README example update if the endpoint is user-facing

## API Contract Expectations

- Existing normalized identifiers must stay stable:
  - chains: `bitcoin`, `ethereum`
  - asset types: `native`, `erc20`
- Prefer `null` instead of omitting known-but-unavailable fields.
- Include `updatedAt` whenever returning normalized business data.
- Include `source` whenever upstream provenance helps clients reason about the data.
- Keep amount fields string-based in API responses.
- Do not leak raw upstream response shapes directly from controllers.

## Environment And Configuration Rules

- All provider URLs and credentials belong in environment variables.
- Do not hardcode RPC endpoints, API keys, token addresses, or chain-specific secrets.
- If a new env var is introduced, update all of:
  - `.env.example`
  - `src/config/env.ts`
  - `README.md`
- If a provider is optional, fail honestly at runtime when the dependent endpoint is called rather than inventing fallback data.

## Implementation Boundaries

### What is already working

- `GET /health`
- `GET /v1/prices`
- `GET /v1/balances/ethereum/:address/native`

### What is scaffolded or partial

- `GET /v1/balances/ethereum/:address/erc20/:contractAddress`
- `GET /v1/portfolio/ethereum/:address`
- `GET /v1/transactions/ethereum/:txHash`
- `GET /v1/transactions/bitcoin/:txHash`
- `POST /v1/transactions/bitcoin/broadcast`

When extending these endpoints, keep existing response conventions intact.

## Provider Constraints

### Ethereum

- Native balance via JSON-RPC is straightforward.
- Current supported EVM chain ids are `1` and `11155111`.
- ERC20 metadata and `balanceOf` should go through the EVM provider.
- Full wallet-wide ERC20 discovery is not reliably supported by raw RPC alone.
- If portfolio discovery is improved later, do it behind a provider abstraction.

### Bitcoin

- Bitcoin Core RPC is acceptable for chain info and raw transaction lookup.
- Address/UTXO queries are intentionally limited.
- Pure Bitcoin Core setups do not provide robust address indexing by default.
- Broadcast must remain conservative and clearly marked until policy checks are added.

### Market Data

- CoinGecko is the current price provider abstraction.
- USD is the only normalized fiat currency for now.
- Contract-address token pricing should stay isolated to the market provider layer.

## Error Handling Rules

- Throw `AppError` for expected operational failures.
- Let centralized middleware shape API errors.
- Use `400` for validation failures, `404` for missing resources, `501` for intentional placeholders, and `5xx` for provider/configuration failures.
- Do not return ad hoc error payloads from deep service or provider layers.
- Wrap async route handlers so promise rejections always reach the error middleware.

## Coding Guidance

- Use `async/await` consistently.
- Avoid magic strings when a shared constant is appropriate.
- Add comments only when they clarify non-obvious behavior.
- Do not move provider calls directly into controllers.
- Do not add new global state casually.
- Keep cache usage behind the cache abstraction in `src/utils/cache.ts`.
- Keep future Redis migration easy by preserving the cache interface.
- Prefer constructor injection for services and providers when it improves testability.
- Keep utility functions generic; if logic is domain-specific, it probably belongs in a mapper or service.
- Be conservative with dependencies. Add a library only if it meaningfully reduces complexity.

## Testing Guidance

- Prefer small unit tests around mappers and services.
- Avoid overbuilding the test setup at this stage.
- Add regression tests when changing normalization rules.
- If a feature is scaffolded but not implemented, leave a clear `TODO:` and avoid fake tests for nonexistent behavior.
- When fixing bugs in mapping or normalization, add or update a focused unit test in the same change.
- Prefer provider stubs in service tests over live network assumptions.

## Documentation Rules

- Keep `README.md` aligned with actual implemented behavior.
- Do not document a route as complete if it is partial or placeholder-only.
- When a limitation is due to upstream provider constraints, state that limitation directly.
- If a new endpoint is implemented enough for frontend use, add at least one example request or response to the README.

## Review Checklist

Before considering a change complete, verify:

1. Request validation is explicit and lives in `src/schemas/*`
2. Controller remains thin
3. Service owns business orchestration
4. Provider-specific transport details stay inside `src/providers/*`
5. Response shape stays normalized and frontend-friendly
6. New env vars are documented
7. Relevant tests or TODO markers were added
8. README still matches reality

## Safe Extension Order

When continuing work on this repository, prefer this order:

1. Finish ERC20 balance endpoint using `metadata + balanceOf + optional USD price`
2. Improve Ethereum transaction normalization
3. Harden Bitcoin transaction and broadcast behavior
4. Add a real token discovery strategy behind a provider interface
5. Replace in-memory cache with Redis without changing service contracts

## Avoid

- NestJS
- Prisma
- Postgres
- Redis integration before it is explicitly requested
- Dockerization by default
- Hidden provider assumptions
- Pretending that raw RPC can do full portfolio indexing when it cannot
