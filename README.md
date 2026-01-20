## Features

- **Event Streaming**: Real-time Server-Sent Events (SSE) for Sui package events
- **Deepbook Event Streaming**: Real-time streaming for Deepbook trading events (live trades, order book updates, etc.)
- **Automatic Type Generation**: Generate TypeScript types directly from Sui package events
- **NFT API**: Query NFT collections, tokens, and holders
- **Deepbook API**: Access trading pools, order books, trades, and OHLCV data
- **Full Type Safety**: Complete TypeScript support with IntelliSense
- **Framework Agnostic**: Works with NestJS, React, Next.js, and any TypeScript project
- **Browser & Node.js**: Works in both environments

## Installation

```bash
npm install @surflux/sdk
```

## Quick Start

### 1. Get Your API Key

Visit [Surflux](https://surflux.dev) to get your API key.

### 2. Get Your Stream Key (For Event Streaming)

For real-time event streaming (Deepbook Events and Package Events), you'll also need a stream key. Visit [Surflux](https://surflux.dev) to get your stream key.

### 3. Generate Event Types (Optional)

```bash
npx @surflux/sdk <packageId> <network> -o ./sui-events
```

## Package Event Streaming

The `SurfluxPackageEventsClient` provides real-time access to Sui package events via Server-Sent Events (SSE).

### Basic Usage

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

### Subscribe to All Events

```typescript
client.onAll((event) => {
  console.log('Event:', event.type, event.tx_hash);
});
```

### Wait for Event

```typescript
const event = await client.waitFor('MyEvent', 5000);
```

### Pattern Matching

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

### Typed Handlers

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

For more detailed examples, see the [examples directory](./examples/).

## NFT API

### Using SurfluxNFTClient

```typescript
import { SurfluxNFTClient, SurfluxNetwork } from '@surflux/sdk';

const client = new SurfluxNFTClient({
  apiKey: 'your-api-key',
  network: SurfluxNetwork.TESTNET
});
```

### Get NFT by ID

```typescript
const nft = await client.getNFTById({
  object_id: '0x123...'
});
```

### Get NFTs for Owner

```typescript
const result = await client.getNFTsForOwner({
  address: '0x123...',
  page: 1,
  per_page: 20
});

console.log(result.items); // NFTToken[]
console.log(result.isLastPage); // boolean
console.log(result.currentPage); // number
console.log(result.perPage); // number
```

### Get NFTs for Collection

```typescript
const result = await client.getNFTsForCollection({
  type: '0x123::duck_nft::DuckNFT',
  page: 1,
  per_page: 10
});
```

### Get Collection Holders

```typescript
const holders = await client.getCollectionHolders({
  type: '0x123::duck_nft::DuckNFT',
  page: 1,
  per_page: 50
});
```

For more detailed examples, see the [examples directory](./examples/).

## Deepbook API

### Using SurfluxDeepbookClient

```typescript
import { SurfluxDeepbookClient, SurfluxNetwork } from '@surflux/sdk';

const client = new SurfluxDeepbookClient({
  apiKey: 'your-api-key',
  network: SurfluxNetwork.TESTNET
});
```

### Get All Pools

```typescript
const pools = await client.getPools();
```

### Get Trades

```typescript
const trades = await client.getTrades({
  pool_name: 'SUI-USDC',
  from: 1699999999,
  to: 1700000000,
  limit: 100
});
```

### Get Order Book

```typescript
const orderBook = await client.getOrderBook({
  pool_name: 'SUI-USDC',
  limit: 20
});
```

### Get OHLCV Candles

```typescript
const candles = await client.getOHLCV({
  pool_name: 'SUI-USDC',
  timeframe: '1h',
  from: 1699999999,
  to: 1700000000,
  limit: 100
});
```

For more detailed examples, see the [examples directory](./examples/).

## Deepbook Event Streaming

The `SurfluxDeepbookEventsClient` provides real-time access to Deepbook trading events via Server-Sent Events (SSE).

### All Updates Stream

Create a client for receiving all Deepbook events (live trades, order book depth, order placements, cancellations, modifications, and expirations):

```typescript
import { SurfluxDeepbookEventsClient, DeepbookStreamType, SurfluxNetwork } from '@surflux/sdk';

// Create client with ALL_UPDATES stream type
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

client.on('deepbook_all_updates_canceled', (order) => {
  console.log('Order canceled:', order);
});

client.on('deepbook_all_updates_modified', (order) => {
  console.log('Order modified:', order);
});

client.on('deepbook_all_updates_expired', (order) => {
  console.log('Order expired:', order);
});
```

### Live Trades Stream

Create a client for receiving only live trades and order book depth updates:

```typescript
import { SurfluxDeepbookEventsClient, DeepbookStreamType, SurfluxNetwork } from '@surflux/sdk';

// Create client with LIVE_TRADES stream type
const client = new SurfluxDeepbookEventsClient({
  streamKey: 'your-stream-key',
  poolName: 'SUI-USDC',
  streamType: DeepbookStreamType.LIVE_TRADES,
  network: SurfluxNetwork.TESTNET
});

await client.connect();

// Subscribe to event types (only live_trades and order_book_depth available)
client.on('deepbook_live_trades', (trade) => {
  console.log('Trade:', trade);
});

client.on('deepbook_order_book_depth', (depth) => {
  console.log('Depth update:', depth);
});
```

### Connect with Filters

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

### Subscribe to All Events

```typescript
client.onAll((event) => {
  console.log('Event type:', event.type);
  console.log('Event data:', event.data);
});
```

### Wait for Event

```typescript
const trade = await client.waitFor('deepbook_live_trades', 5000);
console.log('Trade received:', trade);
```

### Disconnect

```typescript
await client.disconnect();
```

For more detailed examples, see the [examples directory](./examples/).

## Framework Examples

### NestJS

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SurfluxPackageEventsClient } from '@surflux/sdk';

@Injectable()
export class EventsService implements OnModuleInit {
  private client = new SurfluxPackageEventsClient({
    streamKey: process.env.SURFLUX_STREAM_KEY!,
    network: 'testnet'
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
import { SurfluxPackageEventsClient } from '@surflux/sdk';

function useSuiEvents(apiKey: string, packageId: string) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const client = new SurfluxPackageEventsClient({
      streamKey: apiKey,
      network: 'testnet'
    });

    client.connect().then(() => {
      client.onEvent('MyEvent', (event) => {
        setEvents(prev => [...prev, event]);
      });
    });

    return () => client.disconnect();
  }, [apiKey, packageId]);

  return events;
}
```

## API Reference

### SurfluxPackageEventsClient

#### Constructor

```typescript
new SurfluxPackageEventsClient(config: {
  streamKey: string;
  network?: string;
})
```

#### Methods

- `connect(): Promise<void>` - Connect to event stream
- `disconnect(): void` - Disconnect from stream
- `on<T>(eventType: string, handler: (event: T) => void): void` - Subscribe to event
- `off(eventType: string, handler?: Function): void` - Unsubscribe
- `onAll(handler: (event) => void): void` - Subscribe to all events
- `onEvent<T>(eventTypeName: string, handler: (event: T) => void): void` - Typed subscription
- `waitFor<T>(eventType: string, timeout?: number): Promise<T>` - Wait for event
- `createTypedHandlers(handlers: Record<string, Function>): void` - Batch handlers
- `get connected: boolean` - Connection status

### SurfluxIndexersClient

#### Constructor

```typescript
new SurfluxIndexersClient(apiKey: string, network: 'mainnet' | 'testnet')
```

#### Properties

- `deepbook: DeepbookClient` - Deepbook trading data
- `nft: NFTClient` - NFT collection and token data

### NFTClient Methods

- `getNFTById(params: { object_id: string }): Promise<NFTToken>`
- `getNFTsForOwner(params: { address: string, collections?: string[], page?: number, per_page?: number }): Promise<NftsResponseDto>`
- `getNFTsForCollection(params: { type: string, fields?: object, page?: number, per_page?: number }): Promise<NftsResponseDto>`
- `getCollectionHolders(params: { type: string, page?: number, per_page?: number }): Promise<CollectionHoldersDto>`

### DeepbookClient Methods

- `getPools(): Promise<PoolInfo[]>`
- `getTrades(params: { pool_name: string, from?: number, to?: number, limit?: number }): Promise<Trade[]>`
- `getOrderBook(params: { pool_name: string, limit?: number }): Promise<OrderBookDepth>`
- `getOHLCV(params: { pool_name: string, timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d', from?: number, to?: number, limit?: number }): Promise<OHLCVCandle[]>`

### SurfluxDeepbookEventsClient

#### Constructor

```typescript
new SurfluxDeepbookEventsClient<T extends DeepbookStreamType>(config: {
  streamKey: string;
  poolName: string;
  streamType: T;
  network?: 'mainnet' | 'testnet';
})
```

**Parameters:**
- `config.streamKey` - Your Surflux stream key
- `config.poolName` - The trading pool name (e.g., 'SUI-USDC')
- `config.streamType` - The stream type (`DeepbookStreamType.ALL_UPDATES` or `DeepbookStreamType.LIVE_TRADES`)
- `config.network` - Network to use ('mainnet' or 'testnet', default: 'testnet')

**Example:**
```typescript
import { SurfluxDeepbookEventsClient, DeepbookStreamType } from '@surflux/sdk';

// For all updates
const allUpdatesClient = new SurfluxDeepbookEventsClient({
  streamKey: 'your-stream-key',
  poolName: 'SUI-USDC',
  streamType: DeepbookStreamType.ALL_UPDATES,
  network: 'testnet'
});

// For live trades only
const liveTradesClient = new SurfluxDeepbookEventsClient({
  streamKey: 'your-stream-key',
  poolName: 'SUI-USDC',
  streamType: DeepbookStreamType.LIVE_TRADES,
  network: 'testnet'
});
```

#### Methods

- `connect(params?: { lastId?: string, type?: DeepbookEventType }): Promise<void>` - Connect to the stream based on the stream type selected in constructor
  - For `ALL_UPDATES`: accepts `{ lastId?: string, type?: DeepbookEventType }`
  - For `LIVE_TRADES`: accepts `{ lastId?: string }`
- `disconnect(): void` - Disconnect from stream
- `on(eventType: AllowedEventType, handler: (event: EventData) => void): void` - Subscribe to specific event type (type-safe based on stream type)
- `off(eventType: string, handler?: Function): void` - Unsubscribe from event
- `onAll(handler: (event: StreamEventType) => void): void` - Subscribe to all events
- `waitFor(eventType: AllowedEventType, timeout?: number): Promise<EventData>` - Wait for specific event (type-safe)
- `get connected: boolean` - Connection status

#### Event Types by Stream Type

**For `DeepbookStreamType.ALL_UPDATES` (all 6 event types available):**
- `deepbook_live_trades` - Live trade events
- `deepbook_order_book_depth` - Order book depth updates
- `deepbook_all_updates_canceled` - Order cancellation events
- `deepbook_all_updates_placed` - Order placement events
- `deepbook_all_updates_modified` - Order modification events
- `deepbook_all_updates_expired` - Order expiration events

**For `DeepbookStreamType.LIVE_TRADES` (only 2 event types available):**
- `deepbook_live_trades` - Live trade events
- `deepbook_order_book_depth` - Order book depth updates

**Note:** The client is type-safe - TypeScript will only allow subscribing to event types that are available for the selected stream type.

## Type Generation

Generate TypeScript types from your Sui package:

```bash
npx @surflux/sdk <packageId> <network> [options]
```

**Options:**
- `-o, --output <path>` - Output directory (default: `./sui-events`)

**Networks:**
- `mainnet`
- `testnet`
- `devnet`
- Custom RPC URL

## Requirements

- Node.js 18+
- TypeScript 4.0+
- Surflux API key

## Links

- [Surflux Documentation](https://surflux.dev/docs)
- [Sui Documentation](https://docs.sui.io)

## License

MIT
