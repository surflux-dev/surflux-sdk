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

The `SurfluxPackageEventsClient` provides real-time access to Sui package events via Server-Sent Events (SSE). It automatically handles connection management, event deduplication through timestamp caching, and provides flexible event subscription patterns.

#### Basic Usage

```typescript
import { SurfluxPackageEventsClient, SurfluxNetwork } from '@surflux/sdk';

const client = new SurfluxPackageEventsClient({
  streamKey: 'your-stream-key',
  network: SurfluxNetwork.TESTNET
});

// Connect to the event stream
await client.connect();

// Check connection status
if (client.connected) {
  console.log('Connected to event stream');
}

// Subscribe to a specific event type by full name
client.onEvent('0x123::module::MyEvent', (event) => {
  console.log('Event received:', event);
});

// Or subscribe by event name only (last part after ::)
client.onEvent('MyEvent', (event) => {
  console.log('Event received:', event);
});

// Clean up when done
await client.disconnect();
```

#### Advanced Features

**Subscribe to All Events:**
```typescript
// Listen to all events (receives full event object with metadata)
client.onAll((event) => {
  console.log('Event type:', event.type);
  console.log('Transaction hash:', event.tx_hash);
  console.log('Timestamp:', event.timestamp_ms);
  console.log('Checkpoint ID:', event.checkpoint_id);
  console.log('Event data:', event.data);
});
```

**Wait for Specific Event:**
```typescript
// Wait for an event with optional timeout (in milliseconds)
try {
  const event = await client.waitFor('MyEvent', 5000); // 5 second timeout
  console.log('Event received:', event);
} catch (error) {
  console.error('Timeout waiting for event:', error);
}
```

**Pattern Matching:**
```typescript
// Match all events from a specific module using wildcards
client.on('0x123::module::*', (event) => {
  console.log('Event from module:', event);
});

// Match events by name only (last part after ::)
// This will match any event named "MyEvent" regardless of module
client.on('MyEvent', (event) => {
  console.log('MyEvent received:', event);
});

// Use on() method directly (onEvent is an alias)
client.on('0x456::another::Transfer', (event) => {
  console.log('Transfer event:', event);
});
```

**Unsubscribe from Events:**
```typescript
// Define handler function
const handler = (event: MyEventType) => {
  console.log('Event:', event);
};

// Subscribe
client.onEvent('MyEvent', handler);

// Unsubscribe specific handler
client.off('MyEvent', handler);

// Unsubscribe all handlers for an event type
client.off('MyEvent');
```

**Typed Handlers:**
```typescript
// Use createTypedHandlers for type-safe event handling
// This is especially useful when you have generated types from your Sui package
client.createTypedHandlers({
  Transfer: (event: TransferEvent) => {
    console.log('Transfer:', event);
  },
  Mint: (event: MintEvent) => {
    console.log('Mint:', event);
  },
  AuctionCreated: (event: AuctionCreatedEvent) => {
    console.log('Auction created:', event);
  }
});
```

**Caching for Event Deduplication:**

The client automatically caches the latest event timestamp to prevent processing duplicate events after reconnection. You can provide a custom cache adapter for persistent storage:

```typescript
// Example: Using a custom cache adapter (e.g., Redis, database, etc.)
const cacheAdapter = {
  get: async (key: string): Promise<string | null> => {
    // Retrieve from your cache storage
    const value = await yourCacheService.get(key);
    return value ?? null;
  },
  set: async (key: string, value: string): Promise<void> => {
    // Store in your cache storage
    await yourCacheService.set(key, value);
  }
};

const client = new SurfluxPackageEventsClient({
  streamKey: 'your-stream-key',
  network: SurfluxNetwork.TESTNET,
  cache: cacheAdapter // Optional: if not provided, uses in-memory cache
});

// The cache key used internally is: 'surflux_package_events_last_timestamp'
// You can prefix it in your cache implementation if needed
```

**Starting from a Specific Timestamp:**
```typescript
// Process only events after a specific timestamp (in milliseconds)
const client = new SurfluxPackageEventsClient({
  streamKey: 'your-stream-key',
  network: SurfluxNetwork.TESTNET,
  fromTimestampMs: Date.now() - 3600000 // Last hour only
});

// If fromTimestampMs is not provided, the client will use the cached timestamp
// (if available) or process all events from the moment of connection
```

**Error Handling:**
```typescript
try {
  await client.connect();
  
  if (!client.connected) {
    throw new Error('Failed to establish connection');
  }
  
  client.onEvent('MyEvent', (event) => {
    // Handler errors are caught internally and logged
    console.log('Event:', event);
  });
} catch (error) {
  console.error('Connection error:', error);
  // Handle connection failure
}
```

**Complete Example with NestJS-style Service:**
```typescript
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { SurfluxPackageEventsClient, SurfluxNetwork } from '@surflux/sdk';

@Injectable()
export class EventsService implements OnModuleDestroy {
  private client: SurfluxPackageEventsClient | null = null;

  async initialize() {
    this.client = new SurfluxPackageEventsClient({
      streamKey: process.env.SURFLUX_STREAM_KEY!,
      network: SurfluxNetwork.TESTNET,
      cache: {
        get: async (key: string) => {
          return await this.cacheService.get(key);
        },
        set: async (key: string, value: string) => {
          await this.cacheService.set(key, value);
        }
      }
    });

    await this.client.connect();
    
    if (this.client.connected) {
      this.setupEventHandlers();
    }
  }

  private setupEventHandlers() {
    if (!this.client) return;

    this.client.onEvent('AuctionCreated', (event) => {
      console.log('Auction created:', event);
    });

    this.client.onEvent('BidPlaced', (event) => {
      console.log('Bid placed:', event);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}
```

#### Generate Event Types (Optional)

For type-safe event handling with `createTypedHandlers`, you can generate TypeScript or JavaScript types directly from your published Sui package events. The generator fetches event structures from the Sui blockchain and creates type-safe interfaces for use in your applications.

**Basic Usage:**

```bash
npx @surflux/sdk <packageId> <network> [options]
```

**Arguments:**
- `packageId` - The Sui package ID you want to generate types for (e.g., `0x123...abc`)
- `network` - The Sui network to use (see supported networks below)

**Options:**
- `-o, --output <path>` - Output directory for generated types (default: `./sui-events`)

**Supported Networks:**
- `mainnet` - Sui mainnet
- `testnet` - Sui testnet
- `devnet` - Sui devnet
- Custom RPC URL - Any valid Sui RPC endpoint (e.g., `https://fullnode.mainnet.sui.io:443`)

**Examples:**

```bash
# Generate types for a package on mainnet
npx @surflux/sdk 0x123...abc mainnet

# Generate types with custom output directory
npx @surflux/sdk 0x123...abc testnet -o ./my-types

# Generate types using a custom RPC URL
npx @surflux/sdk 0x123...abc https://fullnode.mainnet.sui.io:443 -o ./sui-events
```

**Output Structure:**

The generator creates the following files in `{outputDir}/{packageId}/`:

- `types.ts` (or `types.js`) - Contains all event type definitions, `EventName` enum, `EventTypes` constant, and `EventTypeMap` type
- `package-info.json` - Metadata about the generated package (package ID, network, language, generation timestamp)

**Language Selection:**

When you run the generator, you'll be prompted to choose between:
1. **TypeScript** - Generates `.ts` files with full TypeScript interfaces and types
2. **JavaScript** - Generates `.js` files with JSDoc type annotations

**Using Generated Types:**

```typescript
// Import generated types
import { 
  TransferEvent, 
  MintEvent, 
  EventName, 
  EventTypes 
} from './sui-events/0x123...abc';

// Use with createTypedHandlers for type-safe event handling
client.createTypedHandlers({
  Transfer: (event: TransferEvent) => {
    // event is now fully typed with all fields
    console.log('Transfer:', event.from, event.to, event.amount);
  },
  Mint: (event: MintEvent) => {
    // event is now fully typed
    console.log('Mint:', event.token_id, event.recipient);
  }
});

// Use EventName enum for type-safe event names
client.onEvent(EventName.Transfer, (event: TransferEvent) => {
  console.log('Transfer event:', event);
});

// Use EventTypes constant for full event type strings
client.onEvent(EventTypes.Transfer, (event: TransferEvent) => {
  console.log('Transfer event:', event);
});
```

**Generated Type Structure:**

The generator creates:
- **Event Interfaces** - TypeScript interfaces (or JSDoc types) for each event struct found in the package
- **EventName Enum** - Enum of event names for type-safe references (e.g., `EventName.Transfer`)
- **EventTypes Constant** - Mapping of event names to full event type strings (e.g., `EventTypes.Transfer = '0x123::module::Transfer'`)
- **EventTypeMap Type** - Type mapping for use with typed handlers

**Type Naming:**

- Event struct names are converted to PascalCase (e.g., `auction_created` → `AuctionCreated`)
- If multiple modules have events with the same name, the module name is appended (e.g., `Transfer` from `market` module → `TransferMarket`)
- External types from other packages are defined as `unknown` with comments indicating their source

---

### Deepbook Event Streaming

The `SurfluxDeepbookEventsClient` provides real-time access to Deepbook trading events via Server-Sent Events (SSE). It automatically handles connection management, event deduplication through timestamp caching, and provides flexible event subscription patterns.

**Built-in TypeScript Types:** All Deepbook event types are included in the SDK and ready to use. No type generation needed - simply import the types you need from `@surflux/sdk`.

#### All Updates Stream

Receive all Deepbook events (live trades, order book depth, order placements, cancellations, modifications, and expirations):

```typescript
import {
  SurfluxDeepbookEventsClient,
  DeepbookStreamType,
  SurfluxNetwork,
  DeepbookTrade,
  DeepbookOrderBookDepthData,
  DeepbookAllUpdatesPlacedData,
  DeepbookAllUpdatesCanceledData,
  DeepbookAllUpdatesModifiedData,
  DeepbookAllUpdatesExpiredData,
} from '@surflux/sdk';

const client = new SurfluxDeepbookEventsClient({
  streamKey: 'your-stream-key',
  poolName: 'SUI_USDC',
  streamType: DeepbookStreamType.ALL_UPDATES,
  network: SurfluxNetwork.TESTNET
});

// Connect to the event stream
await client.connect();

// Check connection status
if (client.connected) {
  console.log('Connected to Deepbook all updates stream');
}

// Subscribe to specific event types (all 6 event types available)
// All handlers are fully typed with built-in SDK types
client.on('deepbook_live_trades', (trade: DeepbookTrade) => {
  console.log('Live trade:', trade);
  console.log('Price:', trade.price, 'Quantity:', trade.base_quantity);
});

client.on('deepbook_order_book_depth', (depth: DeepbookOrderBookDepthData) => {
  console.log('Order book depth:', depth);
  console.log('Bids:', depth.bids.length, 'Asks:', depth.asks.length);
});

client.on('deepbook_all_updates_placed', (order: DeepbookAllUpdatesPlacedData) => {
  console.log('Order placed:', order);
  console.log('Order ID:', order.order_id, 'Price:', order.price);
});

client.on('deepbook_all_updates_canceled', (order: DeepbookAllUpdatesCanceledData) => {
  console.log('Order canceled:', order.order_id);
});

client.on('deepbook_all_updates_modified', (order: DeepbookAllUpdatesModifiedData) => {
  console.log('Order modified:', order.order_id);
});

client.on('deepbook_all_updates_expired', (order: DeepbookAllUpdatesExpiredData) => {
  console.log('Order expired:', order.order_id);
});

// Clean up when done
await client.disconnect();
```

#### Live Trades Stream

Receive only live trades and order book depth updates:

```typescript
const client = new SurfluxDeepbookEventsClient({
  streamKey: 'your-stream-key',
  poolName: 'SUI_USDC',
  streamType: DeepbookStreamType.LIVE_TRADES,
  network: SurfluxNetwork.TESTNET
});

await client.connect();

// Check connection status
if (client.connected) {
  console.log('Connected to Deepbook live trades stream');
}

// Only live_trades and order_book_depth available
client.on('deepbook_live_trades', (trade) => {
  console.log('Trade:', trade);
});
```

#### Built-in TypeScript Types

All Deepbook event types are built into the SDK and ready to use. No type generation needed:

```typescript
import {
  SurfluxDeepbookEventsClient,
  DeepbookStreamType,
  DeepbookEventType,
  SurfluxNetwork,
  // Built-in event types
  DeepbookTrade,
  DeepbookOrderBookDepthData,
  DeepbookAllUpdatesPlacedData,
  DeepbookAllUpdatesCanceledData,
  DeepbookAllUpdatesModifiedData,
  DeepbookAllUpdatesExpiredData,
  // Event interfaces
  DeepbookLiveTradeEvent,
  DeepbookOrderBookDepthEvent,
  DeepbookEvent,
} from '@surflux/sdk';

// Type-safe event handling with built-in types
const client = new SurfluxDeepbookEventsClient({
  streamKey: 'your-stream-key',
  poolName: 'SUI_USDC',
  streamType: DeepbookStreamType.ALL_UPDATES,
  network: SurfluxNetwork.TESTNET
});

await client.connect();

// All event handlers are fully typed
client.on('deepbook_live_trades', (trade: DeepbookTrade) => {
  // trade is fully typed with all fields
  console.log('Price:', trade.price);
  console.log('Quantity:', trade.base_quantity);
  console.log('Maker:', trade.maker_order_id);
  console.log('Taker:', trade.taker_order_id);
});

client.on('deepbook_order_book_depth', (depth: DeepbookOrderBookDepthData) => {
  // depth is fully typed
  console.log('Bids:', depth.bids);
  console.log('Asks:', depth.asks);
  console.log('Pool ID:', depth.pool_id);
});

client.on('deepbook_all_updates_placed', (order: DeepbookAllUpdatesPlacedData) => {
  // order is fully typed
  console.log('Order ID:', order.order_id);
  console.log('Price:', order.price);
  console.log('Quantity:', order.placed_quantity);
  console.log('Trader:', order.trader);
});
```

#### Available Event Types

**For ALL_UPDATES stream:**
- `deepbook_live_trades` - Live trade executions
- `deepbook_order_book_depth` - Order book depth updates
- `deepbook_all_updates_placed` - New orders placed
- `deepbook_all_updates_canceled` - Orders canceled
- `deepbook_all_updates_modified` - Orders modified
- `deepbook_all_updates_expired` - Orders expired

**For LIVE_TRADES stream:**
- `deepbook_live_trades` - Live trade executions
- `deepbook_order_book_depth` - Order book depth updates

#### Connect with Filters

```typescript
// Connect from a specific event ID (resume from a previous position)
await client.connect({
  lastId: '1755091934020-0'
});

// For ALL_UPDATES stream, filter by event type
await client.connect({
  lastId: '1755091934020-0',
  type: DeepbookEventType.LIVE_TRADES // or 'deepbook_live_trades'
});
```

#### Advanced Features

**Subscribe to All Events:**
```typescript
// Listen to all events (receives full event object with metadata)
client.onAll((event: DeepbookEvent) => {
  console.log('Event type:', event.type);
  console.log('Transaction hash:', event.tx_hash);
  console.log('Timestamp:', event.timestamp_ms);
  console.log('Checkpoint ID:', event.checkpoint_id);
  console.log('Event data:', event.data);
});
```

**Wait for Specific Event:**
```typescript
// Wait for an event with optional timeout (in milliseconds)
try {
  const trade = await client.waitFor('deepbook_live_trades', 5000); // 5 second timeout
  console.log('Trade received:', trade);
} catch (error) {
  console.error('Timeout waiting for event:', error);
}
```

**Unsubscribe from Events:**
```typescript
// Define handler function
const tradeHandler = (trade: DeepbookTrade) => {
  console.log('Trade:', trade);
};

// Subscribe
client.on('deepbook_live_trades', tradeHandler);

// Unsubscribe specific handler
client.off('deepbook_live_trades', tradeHandler);

// Unsubscribe all handlers for an event type
client.off('deepbook_live_trades');
```

**Caching for Event Deduplication:**

The client automatically caches the latest event timestamp to prevent processing duplicate events after reconnection. You can provide a custom cache adapter for persistent storage:

```typescript
// Example: Using a custom cache adapter (e.g., Redis, database, etc.)
const cacheAdapter = {
  get: async (key: string): Promise<string | null> => {
    // Retrieve from your cache storage
    const value = await yourCacheService.get(key);
    return value ?? null;
  },
  set: async (key: string, value: string): Promise<void> => {
    // Store in your cache storage
    await yourCacheService.set(key, value);
  }
};

const client = new SurfluxDeepbookEventsClient({
  streamKey: 'your-stream-key',
  poolName: 'SUI_USDC',
  streamType: DeepbookStreamType.ALL_UPDATES,
  network: SurfluxNetwork.TESTNET,
  cache: cacheAdapter // Optional: if not provided, uses in-memory cache
});

// The cache key used internally is: 'surflux_deepbook_events_last_timestamp'
// You can prefix it in your cache implementation if needed
```

**Starting from a Specific Timestamp:**
```typescript
// Process only events after a specific timestamp (in milliseconds)
const client = new SurfluxDeepbookEventsClient({
  streamKey: 'your-stream-key',
  poolName: 'SUI_USDC',
  streamType: DeepbookStreamType.ALL_UPDATES,
  network: SurfluxNetwork.TESTNET,
  fromTimestampMs: Date.now() - 3600000 // Last hour only
});

// If fromTimestampMs is not provided, the client will use the cached timestamp
// (if available) or process all events from the moment of connection
```

**Error Handling:**
```typescript
try {
  await client.connect();
  
  if (!client.connected) {
    throw new Error('Failed to establish connection');
  }
  
  client.on('deepbook_live_trades', (trade: DeepbookTrade) => {
    // Handler errors are caught internally and logged
    console.log('Trade:', trade);
  });
} catch (error) {
  console.error('Connection error:', error);
  // Handle connection failure
}
```

**Complete Example with NestJS-style Service:**
```typescript
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  SurfluxDeepbookEventsClient,
  DeepbookStreamType,
  SurfluxNetwork,
  DeepbookTrade,
  DeepbookOrderBookDepthData,
} from '@surflux/sdk';

@Injectable()
export class DeepbookEventsService implements OnModuleDestroy {
  private client: SurfluxDeepbookEventsClient | null = null;

  async initialize() {
    this.client = new SurfluxDeepbookEventsClient({
      streamKey: process.env.SURFLUX_STREAM_KEY!,
      poolName: 'SUI_USDC',
      streamType: DeepbookStreamType.ALL_UPDATES,
      network: SurfluxNetwork.TESTNET,
      cache: {
        get: async (key: string) => {
          return await this.cacheService.get(key);
        },
        set: async (key: string, value: string) => {
          await this.cacheService.set(key, value);
        }
      }
    });

    await this.client.connect();
    
    if (this.client.connected) {
      this.setupEventHandlers();
    }
  }

  private setupEventHandlers() {
    if (!this.client) return;

    this.client.on('deepbook_live_trades', (trade: DeepbookTrade) => {
      console.log('Live trade:', trade.price, trade.base_quantity);
    });

    this.client.on('deepbook_order_book_depth', (depth: DeepbookOrderBookDepthData) => {
      console.log('Order book updated:', depth.bids.length, 'bids,', depth.asks.length, 'asks');
    });

    this.client.on('deepbook_all_updates_placed', (order) => {
      console.log('Order placed:', order.order_id);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}
```

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
- [Deepbook Events Basic](./examples/deepbook-events-basic.ts)

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
