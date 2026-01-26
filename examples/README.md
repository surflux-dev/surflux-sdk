# Surflux SDK Examples

This directory contains practical examples demonstrating how to use the Surflux SDK. Each example file includes "HOW TO RUN" instructions at the top.

## Quick Start

1. **Install dependencies and build:**
   ```bash
   npm install
   npm run build
   ```

2. **Configure your keys:**
   - Open `examples/keys.ts`
   - Follow the instructions to get your keys from https://dashboard.surflux.dev
   - Replace the placeholder values with your actual API key and stream key
   - Optionally change the network (default is TESTNET)

3. **Run an example:**
   ```bash
   npx tsx examples/deepbook-basic.ts
   ```

## Example Files

| File | Description | Key Type |
|------|-------------|----------|
| `deepbook-basic.ts` | REST API: pools, trades, order books, OHLCV | API Key |
| `deepbook-events-basic.ts` | Event streaming: all Deepbook events | Stream Key |
| `deepbook-events-live-trades.ts` | Event streaming: live trades only | Stream Key |
| `package-events-basic.ts` | Package events: basic subscription patterns | Stream Key |
| `package-events-typed.ts` | Package events: type-safe handlers | Stream Key |

## Configuration

All examples use the centralized configuration in `examples/keys.ts`:

- **API Key** - Used for REST API clients (`SurfluxIndexerClient`)
- **Stream Key** - Used for event streaming clients (`SurfluxPackageEventsClient`, `SurfluxDeepbookEventsClient`)
- **Network** - Default is `TESTNET`, change to `MAINNET` for production

The `keys.ts` file includes detailed instructions on how to obtain your keys from the Surflux dashboard.

## Running Examples

### Using tsx (Recommended)

```bash
npx tsx examples/deepbook-basic.ts
npx tsx examples/deepbook-events-basic.ts
npx tsx examples/package-events-basic.ts
```

### Using ts-node

```bash
npx ts-node examples/deepbook-basic.ts
npx ts-node examples/deepbook-events-basic.ts
npx ts-node examples/package-events-basic.ts
```

### Using Compiled JavaScript

```bash
npm run build
node dist/examples/deepbook-basic.js
```

## Key Concepts

### Deepbook API
- Pool names use underscore format: `SUI_USDC`
- Prices and quantities are raw numbers (apply decimals for display)
- Timestamps are in Unix seconds

### Deepbook Event Streaming
- Pool names use hyphen format: `SUI_USDC`
- `on()` handlers receive event data directly
- `onAll()` handlers receive full event object with metadata
- Two stream types: `ALL_UPDATES` (6 events) or `LIVE_TRADES` (2 events)

### Package Event Streaming
- Subscribe by full type (`0x123::module::Event`) or name only (`Event`)
- Pattern matching with wildcards: `0x123::module::*`
- `on()` handlers receive event contents
- `onAll()` handlers receive full event object
- Generate types with: `npx @surflux/sdk <packageId> <network> -o ./sui-events`

## Advanced Patterns

### Custom Cache Adapter

Use a persistent cache to prevent duplicate events after reconnection:

```typescript
import { SurfluxPackageEventsClient, SurfluxNetwork } from '../dist';
import { SURFLUX_STREAM_KEY, SURFLUX_NETWORK } from './keys';

const cacheAdapter = {
  get: async (key: string) => {
    // Your cache get logic
    return await yourCache.get(key);
  },
  set: async (key: string, value: string) => {
    // Your cache set logic
    await yourCache.set(key, value);
  },
};

const client = new SurfluxPackageEventsClient({
  streamKey: SURFLUX_STREAM_KEY,
  network: SURFLUX_NETWORK,
  cache: cacheAdapter,
});
```

### Resuming from Specific Event

For Deepbook events, resume from a specific event ID:

```typescript
await client.connect({
  lastId: '1755091934020-0', // Format: timestamp-sequence
});

// For ALL_UPDATES, filter by event type
await client.connect({
  lastId: '1755091934020-0',
  type: 'deepbook_live_trades',
});
```

## Notes

- All examples use TESTNET by default (configured in `keys.ts`)
- Event streaming examples run until stopped with Ctrl+C
- The `keys.ts` file is in `.gitignore` to prevent committing your keys
- Each example file has detailed "HOW TO RUN" instructions at the top

For more information, see the [main README](../README.md).
