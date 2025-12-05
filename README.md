## Features

- **Event Streaming**: Real-time Server-Sent Events (SSE) for Sui package events
- **Automatic Type Generation**: Generate TypeScript types directly from Sui package events
- **NFT API**: Query NFT collections, tokens, and holders
- **Deepbook API**: Access trading pools, order books, trades, and OHLCV data
- **Full Type Safety**: Complete TypeScript support with IntelliSense
- **Framework Agnostic**: Works with NestJS, React, Next.js, and any TypeScript project
- **Browser & Node.js**: Works in both environments

## Installation

```bash
npm install sui-event-catcher
```

## Quick Start

### 1. Get Your API Key

Visit [Surflux](https://surflux.dev) to get your API key.

### 2. Generate Event Types (Optional)

```bash
npx sui-event-catcher <packageId> <network> -o ./sui-events
```

## Event Streaming

### Basic Usage

```typescript
import { SurfluxPackageEventsClient } from 'sui-event-catcher';

const client = new SurfluxPackageEventsClient(
  'your-api-key',
  '0x123...',
  './sui-events',
  'testnet'
);

await client.connect();

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
```

## NFT API

### Get NFT by ID

```typescript
import { SurfluxIndexersClient } from 'sui-event-catcher';

const client = new SurfluxIndexersClient('api-key', 'testnet');

const nft = await client.nft.getNFTById({
  object_id: '0x123...'
});
```

### Get NFTs for Owner

```typescript
const result = await client.nft.getNFTsForOwner({
  address: '0x123...',
  page: 1,
  per_page: 20
});

console.log(result.data); // NFTToken[]
console.log(result.total); // Total count
```

### Get NFTs for Collection

```typescript
const result = await client.nft.getNFTsForCollection({
  type: '0x123::duck_nft::DuckNFT',
  page: 1,
  per_page: 10
});
```

### Get Collection Holders

```typescript
const holders = await client.nft.getCollectionHolders({
  type: '0x123::duck_nft::DuckNFT',
  page: 1,
  per_page: 50
});
```

## Deepbook API

### Get All Pools

```typescript
const pools = await client.deepbook.getPools();
```

### Get Trades

```typescript
const trades = await client.deepbook.getTrades({
  pool_name: 'SUI-USDC',
  from: 1699999999,
  to: 1700000000,
  limit: 100
});
```

### Get Order Book

```typescript
const orderBook = await client.deepbook.getOrderBook({
  pool_name: 'SUI-USDC',
  limit: 20
});
```

### Get OHLCV Candles

```typescript
const candles = await client.deepbook.getOHLCV({
  pool_name: 'SUI-USDC',
  timeframe: '1h',
  from: 1699999999,
  to: 1700000000,
  limit: 100
});
```

## Framework Examples

### NestJS

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SurfluxPackageEventsClient } from 'sui-event-catcher';

@Injectable()
export class EventsService implements OnModuleInit {
  private client = new SurfluxPackageEventsClient(
    process.env.SURFLUX_API_KEY!,
    process.env.PACKAGE_ID!,
    './sui-events',
    'testnet'
  );

  async onModuleInit() {
    await this.client.connect();
    this.client.onEvent('MyEvent', (event) => {
      console.log('Event:', event);
    });
  }
}
```

### React

```typescript
import { useEffect, useState } from 'react';
import { SurfluxPackageEventsClient } from 'sui-event-catcher';

function useSuiEvents(apiKey: string, packageId: string) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const client = new SurfluxPackageEventsClient(
      apiKey, packageId, './sui-events', 'testnet'
    );

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
new SurfluxPackageEventsClient(
  apiKey: string,
  packageId: string,
  generatedTypesPath?: string,
  network?: string
)
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

## Type Generation

Generate TypeScript types from your Sui package:

```bash
npx sui-event-catcher <packageId> <network> [options]
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
