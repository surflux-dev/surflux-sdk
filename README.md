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

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [NFT API](#nft-api)
  - [Deepbook API](#deepbook-api)
  - [Package Event Streaming](#package-event-streaming)
  - [Deepbook Event Streaming](#deepbook-event-streaming)
  - [SurfluxIndexerClient](#surfluxindexerclient)
- [Framework Integration](#framework-integration)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Links](#links)

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


### NFT API

Query NFT collections, tokens, and holders with full type safety.

#### Initialize Client

```typescript
import { SurfluxIndexerClient, SurfluxNetwork } from '@surflux/sdk';

const surfluxClient = new SurfluxIndexerClient({
  apiKey: 'your-api-key',
  network: SurfluxNetwork.MAINNET
});
```

#### Get NFT by ID

Retrieve a single NFT by its object ID with complete metadata, display properties, and Kiosk information.

```typescript
const nft = await surfluxClient.nft.getNFTById({
  object_id: '0x0000000000000000000000000000000000000000000000000000000000000000' // 32-byte hex string (64 chars)
});
```

#### Get NFTs by Address

Retrieve all NFTs owned by a specific wallet address.

```typescript
const {
  items, // NFTToken[]
  isLastPage, // boolean
  currentPage, // number
  perPage // number
} = await surfluxClient.nft.getNFTsByOwner({
  address: '0x0000000000000000000000000000000000000000000000000000000000000000', // 32-byte hex string (64 chars)
  page: 1,
  per_page: 20
});
```

#### Get NFTs by Collection

Retrieve all NFTs from a specific collection.

```typescript
const {
  items, // NFTToken[]
  isLastPage, // boolean
  currentPage, // number
  perPage // number
} = await surfluxClient.nft.getNFTsByCollection({
  type: '0x123::module::NFT', // Collection type (e.g., '0x123::module::NFT')
  page: 1,
  per_page: 10
});
```

#### Get Collection Holders

Get a list of holders for a specific collection.

```typescript
const {
  holders, // { owner: string; count: number }[]
  isLastPage, // boolean
  currentPage, // number
  perPage, // number
} = await surfluxClient.nft.getCollectionHolders({
  type: '0x123::module::NFT', // Collection type (e.g., '0x123::module::NFT')
  page: 1,
  per_page: 50
});
```

#### Get Kiosk NFTs

Retrieve all NFTs inside a specific kiosk.

```typescript
const {
    kiosk, // NFTKiosk
    items, // NFTToken[]
    isLastPage, // boolean
    currentPage, // number
    perPage, // number
  } = await surfluxClient.nft.getKioskNFTs({
  kiosk_id: '0x0000000000000000000000000000000000000000000000000000000000000000', // 32-byte hex string (64 chars)
    page: 0,
    per_page: 20
  });
```

---

### Deepbook API

Access trading pools, order books, trades, and OHLCV data.

#### Initialize Client

```typescript
import { SurfluxIndexerClient, SurfluxNetwork } from '@surflux/sdk';

const surfluxClient = new SurfluxIndexerClient({
  apiKey: 'your-api-key',
  network: SurfluxNetwork.MAINNET
});
```

#### Get All Pools

Returns a list of all available pools with detailed information about base and quote assets.

```typescript
const pools = await surfluxClient.deepbook.getPools();
```

#### Get Trades

Returns historical trade data for a specified DeepBook pool.

```typescript
const trades = await surfluxClient.deepbook.getTrades({
  pool_name: 'SUI_USDC',
  from: 1737705600,
  to: 1737792000,
  limit: 100
});
```

#### Get Order Book Depth

Returns the current bids and asks orders for a specified DeepBook pool.

```typescript
const { bids, asks } = await surfluxClient.deepbook.getOrderBookDepth({
  pool_name: 'SUI_USDC',
  limit: 20
});
```

#### Get OHLCV Candles

Returns the OHLCV (Open, High, Low, Close, Volume) candlestick data for a specified DeepBook pool.

```typescript
const candlesticks = await surfluxClient.deepbook.getOHLCV({
  pool_name: 'SUI_USDC',
  timeframe: '1h',  // '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  from: 1758603270,
  to: 1758703270,
  limit: 50
});
```

---

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


### SurfluxIndexerClient

Main client for accessing Surflux indexer services. Provides access to both NFT and Deepbook APIs.

#### Constructor

```typescript
new SurfluxIndexerClient(config: {
  apiKey: string;
  network: SurfluxNetwork;
  customUrl?: string;
})
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `nft` | `SurfluxNFTClient` | Client for NFT collection and token data |
| `deepbook` | `SurfluxDeepbookClient` | Client for Deepbook trading pool data |

#### NFT Methods

Access via `surfluxClient.nft.*`:

```typescript
getNFTById(params: { object_id: string }): Promise<NFTToken>

getNFTsByOwner(params: {
  address: string;
  collections?: string[];
  page?: number; // Starts from 0
  per_page?: number;
}): Promise<PaginatedNFTs>

getNFTsByCollection(params: {
  type: string;
  fields?: Record<string, unknown>;
  page?: number; // Starts from 0
  per_page?: number;
}): Promise<PaginatedNFTs>

getCollectionHolders(params: {
  type: string;
  page?: number; // Starts from 0
  per_page?: number;
}): Promise<PaginatedCollectionHolders>

getKioskNFTs(params: {
  kiosk_id: string;
  page?: number; // Starts from 0
  per_page?: number;
}): Promise<PaginatedKioskNFTs>
```

**Response Types:**

```typescript
// PaginatedNFTs - Returned by getNFTsByOwner and getNFTsByCollection
interface PaginatedNFTs {
  items: NFTToken[];
  isLastPage: boolean;
  currentPage: number;
  perPage: number;
}

// PaginatedCollectionHolders - Returned by getCollectionHolders
interface PaginatedCollectionHolders {
  holders: Array<{
    owner: string;
    count: number;
  }>;
  isLastPage: boolean;
  currentPage: number;
  perPage: number;
}

// PaginatedKioskNFTs - Returned by getKioskNFTs
interface PaginatedKioskNFTs {
  kiosk: NFTKiosk;
  items: NFTToken[];
  isLastPage: boolean;
  currentPage: number;
  perPage: number;
}
```

#### Deepbook Methods

Access via `surfluxClient.deepbook.*`:

```typescript
getPools(): Promise<DeepbookPool[]>

getTrades(params: {
  pool_name: string;
  from?: number; // Unix timestamp in seconds (defaults to 1 day ago)
  to?: number; // Unix timestamp in seconds (defaults to current time)
  limit?: number; // Defaults to 100
}): Promise<DeepbookTrade[]>

getOrderBookDepth(params: {
  pool_name: string;
  limit?: number; // Max 20 price levels per side
}): Promise<DeepbookOrderBookDepth>

getOHLCV(params: {
  pool_name: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  from?: number; // Unix timestamp in seconds (defaults to 1 day ago)
  to?: number; // Unix timestamp in seconds (defaults to current time)
  limit?: number;
}): Promise<DeepbookOHLCVCandle[]>
```

**Response Types:**

```typescript
// DeepbookPool - Returned by getPools
interface DeepbookPool {
  pool_id: string;
  pool_name: string;
  base_asset_id: string;
  base_asset_decimals: number;
  base_asset_symbol: string;
  base_asset_name: string;
  quote_asset_id: string;
  quote_asset_decimals: number;
  quote_asset_symbol: string;
  quote_asset_name: string;
  min_size: number;
  lot_size: number;
  tick_size: number;
}

// DeepbookOrderBookDepth - Returned by getOrderBookDepth
interface DeepbookOrderBookDepth {
  pool_id: string;
  bids: DeepbookOrderBookDepthLevel[];
  asks: DeepbookOrderBookDepthLevel[];
}

interface DeepbookOrderBookDepthLevel {
  price: string;
  total_quantity: string;
  order_count: string;
}

// DeepbookTrade - Returned by getTrades
interface DeepbookTrade {
  event_digest: string;
  digest: string;
  sender: string;
  checkpoint: number;
  checkpoint_timestamp_ms: number;
  package: string;
  pool_id: string;
  maker_order_id: string;
  taker_order_id: string;
  maker_client_order_id: string;
  taker_client_order_id: string;
  price: number;
  taker_fee: number;
  taker_fee_is_deep: boolean;
  maker_fee: number;
  maker_fee_is_deep: boolean;
  taker_is_bid: boolean;
  base_quantity: number;
  quote_quantity: number;
  maker_balance_manager_id: string;
  taker_balance_manager_id: string;
  onchain_timestamp: number;
}

// DeepbookOHLCVCandle - Returned by getOHLCV
interface DeepbookOHLCVCandle {
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume_base: string;
  volume_quote: string;
  trade_count: number;
}
```

---

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
  SurfluxIndexerClient,
  SurfluxNetwork,
  SurfluxError,
  SurfluxAPIError,
  SurfluxAuthenticationError,
  SurfluxRateLimitError,
  SurfluxNotFoundError,
  SurfluxNetworkError,
  SurfluxTimeoutError,
  SurfluxStreamError
} from '@surflux/sdk';

const surfluxClient = new SurfluxIndexerClient({
  apiKey: 'your-api-key',
  network: SurfluxNetwork.TESTNET
});

try {
  await surfluxClient.nft.getNFTById({ object_id: '0x0000000000000000000000000000000000000000000000000000000000000000' });
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

- [Deepbook Basic](./examples/deepbook-basic.ts)
- [Package Events Basic](./examples/package-events-basic.ts)
- [Package Events Typed](./examples/package-events-typed.ts)
- [Deepbook Events Basic](./examples/deepbook-events-basic.ts)
- [Deepbook Events Live Trades](./examples/deepbook-events-live-trades.ts)
- [NFT Basic](./examples/nft-basic.ts)
- [NFT Collection Explorer](./examples/nft-collection-explorer.ts)

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

---

<div align="center">

Made with 💚 by [Surflux](https://surflux.dev)

</div>
