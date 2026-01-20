# Surflux SDK

<div align="center">

<img src="https://surflux.dev/logo/logo-teal.svg" alt="Surflux Logo" width="400">

**Ship faster on Sui: consume real-time Surflux streams and indexed data with a simple TypeScript SDK.**

[![npm version](https://img.shields.io/npm/v/@surflux/sdk.svg)](https://www.npmjs.com/package/@surflux/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

[Documentation](#) • [Examples](./examples/) • [Changelog](./CHANGELOG.md) • [Contributing](./CONTRIBUTING.md)

</div>

---

## Overview

The Surflux SDK is a production-ready TypeScript SDK for interacting with the Surflux platform on Sui blockchain. It provides real-time event streaming, comprehensive NFT APIs, and Deepbook trading data access with full type safety and IntelliSense support.

### Key Features

- **Real-time Event Streaming** - Server-Sent Events (SSE) for Sui package events and Deepbook trading events
- **Automatic Type Generation** - Generate TypeScript types directly from Sui package events
- **NFT API** - Query NFT collections, tokens, and holders with pagination support
- **Deepbook API** - Access trading pools, order books, trades, and OHLCV data
- **Full Type Safety** - Complete TypeScript support with IntelliSense
- **Framework Agnostic** - Works with NestJS, React, Next.js, and any TypeScript project
- **Cross-Platform** - Works in both browser and Node.js environments

---

## Installation

```bash
npm install @surflux/sdk
```

### Requirements

- Node.js 18+ and npm 9+
- TypeScript 4.0+ (recommended)
- Surflux API key and stream key (see [Quick Start](#quick-start) for details)

---

## Quick Start

### 1. Get Your API Key

Visit [Surflux](https://surflux.dev) to get your API key.

### 2. Get Your Stream Key (For Event Streaming)

For real-time event streaming (Deepbook Events and Package Events), you'll also need a stream key. Visit [Surflux](https://surflux.dev) to get your stream key.

---

## Usage

### Package Event Streaming

The `SurfluxPackageEventsClient` provides real-time access to Sui package events via Server-Sent Events (SSE).

#### Basic Usage

```typescript
import { SurfluxPackageEventsClient, SurfluxNetwork } from '@surflux/sdk';

const client = new SurfluxPackageEventsClient({
  streamKey: 'your-stream-key',
  network: SurfluxNetwork.TESTNET
});

await client.connect();

// Subscribe to a specific event type
client.onEvent('MyEvent', (event) => {
  console.log('Event received:', event);
});
```

#### Advanced Features

**Subscribe to All Events:**
```typescript
client.onAll((event) => {
  console.log('Event:', event.type, event.tx_hash);
});
```

**Wait for Specific Event:**
```typescript
const event = await client.waitFor('MyEvent', 5000);
```

**Pattern Matching:**
```typescript
// Match all events from a module
client.on('0x123::module::*', (event) => {
  console.log(event);
});

// Match events by name only (last part after ::)
client.on('MyEvent', (event) => {
  console.log(event);
});
```

**Typed Handlers:**
```typescript
// Use createTypedHandlers for type-safe event handling
client.createTypedHandlers({
  Transfer: (event: TransferEvent) => {
    console.log('Transfer:', event);
  },
  Mint: (event: MintEvent) => {
    console.log('Mint:', event);
  }
});
```

#### Generate Event Types (Optional)

For type-safe event handling with `createTypedHandlers`, you can generate TypeScript types from your Sui package events:

```bash
npx @surflux/sdk <packageId> <network> -o ./sui-events
```

**Supported Networks:**
- `mainnet`
- `testnet`
- `devnet`
- Custom RPC URL

The generated types can then be imported and used with typed handlers:

```typescript
import { TransferEvent, MintEvent } from './sui-events';

client.createTypedHandlers({
  Transfer: (event: TransferEvent) => {
    // event is now fully typed
  },
  Mint: (event: MintEvent) => {
    // event is now fully typed
  }
});
```

For more detailed examples, see the [examples directory](./examples/).

---

### NFT API

Query NFT collections, tokens, and holders with full type safety.

#### Initialize Client

```typescript
import { SurfluxNFTClient, SurfluxNetwork } from '@surflux/sdk';

const client = new SurfluxNFTClient({
  apiKey: 'your-api-key',
  network: SurfluxNetwork.TESTNET
});
```

#### Get NFT by ID

```typescript
const nft = await client.getNFTById({
  object_id: '0x123...'
});
```

#### Get NFTs for Owner

```typescript
const result = await client.getNFTsForOwner({
  address: '0x123...',
  page: 1,
  per_page: 20
});

console.log(result.items);      // NFTToken[]
console.log(result.isLastPage); // boolean
console.log(result.currentPage); // number
console.log(result.perPage);     // number
```

#### Get NFTs for Collection

```typescript
const result = await client.getNFTsForCollection({
  type: '0x123::duck_nft::DuckNFT',
  page: 1,
  per_page: 10
});
```

#### Get Collection Holders

```typescript
const holders = await client.getCollectionHolders({
  type: '0x123::duck_nft::DuckNFT',
  page: 1,
  per_page: 50
});
```

---

### Deepbook API

Access trading pools, order books, trades, and OHLCV data.

#### Initialize Client

```typescript
import { SurfluxDeepbookClient, SurfluxNetwork } from '@surflux/sdk';

const client = new SurfluxDeepbookClient({
  apiKey: 'your-api-key',
  network: SurfluxNetwork.TESTNET
});
```

#### Get All Pools

```typescript
const pools = await client.getPools();
```

#### Get Trades

```typescript
const trades = await client.getTrades({
  pool_name: 'SUI-USDC',
  from: 1699999999,  // Unix timestamp in seconds
  to: 1700000000,
  limit: 100
});
```

#### Get Order Book

```typescript
const orderBook = await client.getOrderBook({
  pool_name: 'SUI-USDC',
  limit: 20
});
```

#### Get OHLCV Candles

```typescript
const candles = await client.getOHLCV({
  pool_name: 'SUI-USDC',
  timeframe: '1h',  // '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  from: 1699999999,
  to: 1700000000,
  limit: 100
});
```

---

### Deepbook Event Streaming

The `SurfluxDeepbookEventsClient` provides real-time access to Deepbook trading events via Server-Sent Events (SSE).

#### All Updates Stream

Receive all Deepbook events (live trades, order book depth, order placements, cancellations, modifications, and expirations):

```typescript
import { SurfluxDeepbookEventsClient, DeepbookStreamType, SurfluxNetwork } from '@surflux/sdk';

const client = new SurfluxDeepbookEventsClient({
  streamKey: 'your-stream-key',
  poolName: 'SUI-USDC',
  streamType: DeepbookStreamType.ALL_UPDATES,
  network: SurfluxNetwork.TESTNET
});

await client.connect();

// Subscribe to specific event types (all 6 event types available)
client.on('deepbook_live_trades', (trade) => {
  console.log('Live trade:', trade);
});

client.on('deepbook_order_book_depth', (depth) => {
  console.log('Order book depth:', depth);
});

client.on('deepbook_all_updates_placed', (order) => {
  console.log('Order placed:', order);
});

// ... and more event types
```

#### Live Trades Stream

Receive only live trades and order book depth updates:

```typescript
const client = new SurfluxDeepbookEventsClient({
  streamKey: 'your-stream-key',
  poolName: 'SUI-USDC',
  streamType: DeepbookStreamType.LIVE_TRADES,
  network: SurfluxNetwork.TESTNET
});

await client.connect();

// Only live_trades and order_book_depth available
client.on('deepbook_live_trades', (trade) => {
  console.log('Trade:', trade);
});
```

#### Connect with Filters

```typescript
// Connect from a specific event ID
await client.connect({
  lastId: '1755091934020-0'
});

// For ALL_UPDATES stream, filter by event type
await client.connect({
  lastId: '1755091934020-0',
  type: 'deepbook_live_trades'
});
```

#### Additional Methods

```typescript
// Subscribe to all events
client.onAll((event) => {
  console.log('Event type:', event.type);
  console.log('Event data:', event.data);
});

// Wait for specific event
const trade = await client.waitFor('deepbook_live_trades', 5000);

// Disconnect
await client.disconnect();
```

---

## Framework Integration

### NestJS

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SurfluxPackageEventsClient, SurfluxNetwork } from '@surflux/sdk';

@Injectable()
export class EventsService implements OnModuleInit {
  private client = new SurfluxPackageEventsClient({
    streamKey: process.env.SURFLUX_STREAM_KEY!,
    network: SurfluxNetwork.TESTNET
  });

  async onModuleInit() {
    await this.client.connect();
    this.client.onEvent('MyEvent', (event) => {
      console.log('Event:', event);
    });
  }
}
```

**Important:** When using multiple stream clients (e.g., multiple `SurfluxPackageEventsClient` or `SurfluxDeepbookEventsClient` instances), each client must be in a separate NestJS service. This ensures proper lifecycle management and prevents connection conflicts.

### React

```typescript
import { useEffect, useState } from 'react';
import { SurfluxPackageEventsClient, SurfluxNetwork } from '@surflux/sdk';

function useSuiEvents(streamKey: string, packageId: string) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const client = new SurfluxPackageEventsClient({
      streamKey,
      network: SurfluxNetwork.TESTNET
    });

    client.connect().then(() => {
      client.onEvent('MyEvent', (event) => {
        setEvents(prev => [...prev, event]);
      });
    });

    return () => client.disconnect();
  }, [streamKey, packageId]);

  return events;
}
```

---

## API Reference

### SurfluxPackageEventsClient

#### Constructor

```typescript
new SurfluxPackageEventsClient(config: {
  streamKey: string;
  network?: SurfluxNetwork;
})
```

#### Methods

| Method | Description |
|--------|-------------|
| `connect(): Promise<void>` | Connect to event stream |
| `disconnect(): void` | Disconnect from stream |
| `on<T>(eventType: string, handler: (event: T) => void): void` | Subscribe to event |
| `off(eventType: string, handler?: Function): void` | Unsubscribe from event |
| `onAll(handler: (event) => void): void` | Subscribe to all events |
| `onEvent<T>(eventTypeName: string, handler: (event: T) => void): void` | Typed subscription |
| `waitFor<T>(eventType: string, timeout?: number): Promise<T>` | Wait for event |
| `createTypedHandlers(handlers: Record<string, Function>): void` | Batch handlers |

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `connected` | `boolean` | Connection status |

---

### SurfluxNFTClient

#### Methods

```typescript
getNFTById(params: { object_id: string }): Promise<NFTToken>
getNFTsForOwner(params: {
  address: string;
  collections?: string[];
  page?: number;
  per_page?: number;
}): Promise<NftsResponseDto>
getNFTsForCollection(params: {
  type: string;
  fields?: object;
  page?: number;
  per_page?: number;
}): Promise<NftsResponseDto>
getCollectionHolders(params: {
  type: string;
  page?: number;
  per_page?: number;
}): Promise<CollectionHoldersDto>
```

---

### SurfluxDeepbookClient

#### Methods

```typescript
getPools(): Promise<PoolInfo[]>
getTrades(params: {
  pool_name: string;
  from?: number;
  to?: number;
  limit?: number;
}): Promise<Trade[]>
getOrderBook(params: {
  pool_name: string;
  limit?: number;
}): Promise<OrderBookDepth>
getOHLCV(params: {
  pool_name: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  from?: number;
  to?: number;
  limit?: number;
}): Promise<OHLCVCandle[]>
```

---

### SurfluxDeepbookEventsClient

#### Constructor

```typescript
new SurfluxDeepbookEventsClient<T extends DeepbookStreamType>(config: {
  streamKey: string;
  poolName: string;
  streamType: T;
  network?: SurfluxNetwork;
})
```

#### Stream Types

**`DeepbookStreamType.ALL_UPDATES`** - All 6 event types:
- `deepbook_live_trades`
- `deepbook_order_book_depth`
- `deepbook_all_updates_canceled`
- `deepbook_all_updates_placed`
- `deepbook_all_updates_modified`
- `deepbook_all_updates_expired`

**`DeepbookStreamType.LIVE_TRADES`** - Only 2 event types:
- `deepbook_live_trades`
- `deepbook_order_book_depth`

The client is type-safe - TypeScript will only allow subscribing to event types that are available for the selected stream type.

#### Methods

| Method | Description |
|--------|-------------|
| `connect(params?: ConnectParams): Promise<void>` | Connect to stream |
| `disconnect(): void` | Disconnect from stream |
| `on(eventType: AllowedEventType, handler: Function): void` | Subscribe to event (type-safe) |
| `off(eventType: string, handler?: Function): void` | Unsubscribe from event |
| `onAll(handler: Function): void` | Subscribe to all events |
| `waitFor(eventType: AllowedEventType, timeout?: number): Promise<EventData>` | Wait for event (type-safe) |

---

## Error Handling

The SDK provides custom error classes for better error handling:

```typescript
import {
  SurfluxError,
  SurfluxAPIError,
  SurfluxAuthenticationError,
  SurfluxRateLimitError,
  SurfluxNotFoundError,
  SurfluxNetworkError,
  SurfluxTimeoutError,
  SurfluxStreamError
} from '@surflux/sdk';

try {
  await client.getNFTById({ object_id: '0x123...' });
} catch (error) {
  if (error instanceof SurfluxAuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof SurfluxRateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof SurfluxNotFoundError) {
    console.error('NFT not found');
  }
}
```

---

## Examples

Comprehensive examples are available in the [examples directory](./examples/):

- [Package Events Basic](./examples/package-events-basic.ts)
- [Package Events Typed](./examples/package-events-typed.ts)
- [Deepbook Events Basic](./examples/deepbook-events-basic.ts)
- [Deepbook Events Live Trades](./examples/deepbook-events-live-trades.ts)
- [NFT Basic](./examples/nft-basic.ts)
- [NFT Collection Explorer](./examples/nft-collection-explorer.ts)
- [Deepbook Basic](./examples/deepbook-basic.ts)
- [Deepbook OHLCV Chart](./examples/deepbook-ohlcv-chart.ts)

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Security

For security vulnerabilities, please email [contact@surflux.dev](mailto:contact@surflux.dev) instead of using the issue tracker. See our [Security Policy](./SECURITY.md) for more details.

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Links

- [Surflux Documentation](https://surflux.dev/docs)
- [Sui Documentation](https://docs.sui.io)
- [Report an Issue](https://github.com/surflux-dev/surflux-sdk/issues)
- [Discussions](https://github.com/surflux-dev/surflux-sdk/discussions)

---

<div align="center">

Made by [Surflux](https://surflux.dev)

</div>
