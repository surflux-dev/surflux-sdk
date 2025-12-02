# Sui Event Catcher

A powerful TypeScript library for type-safe Sui event streaming with Surflux integration. Generate TypeScript types from your Sui smart contract events and stream them with full type safety in NestJS APIs, React apps, and any TypeScript project.

## Features

- **Automatic Type Generation**: Generate TypeScript types directly from Sui package events
- **Full Type Safety**: Complete TypeScript support with IntelliSense for event data
- **Surflux Integration**: Seamless integration with Surflux event streams
- **Framework Agnostic**: Works with NestJS, React, Next.js, and any TypeScript project
- **CLI Tool**: Simple command-line interface similar to Prisma
- **Browser & Node.js**: Works in both browser and Node.js environments
- **Real-time Streaming**: Server-Sent Events (SSE) for real-time event streaming

## Installation

```bash
npm install sui-event-catcher
```

## Quick Start

### Step 1: Generate Types

Generate TypeScript types from your Sui package:

```bash
npx sui-event-catcher <packageId> <network>
```

**Examples:**

```bash
# Mainnet
npx sui-event-catcher 0x9f6de0f9c1333cecfafed4fd51ecf445d237a6295bd6ae88754821c8f8189789 mainnet

# Testnet
npx sui-event-catcher 0x9f6de0f9c1333cecfafed4fd51ecf445d237a6295bd6ae88754821c8f8189789 testnet

# Custom RPC URL
npx sui-event-catcher 0x9f6de0f9c1333cecfafed4fd51ecf445d237a6295bd6ae88754821c8f8189789 https://custom-rpc.com

# Custom output directory
npx sui-event-catcher 0x9f6de0f9c1333cecfafed4fd51ecf445d237a6295bd6ae88754821c8f8189789 testnet -o ./src/types/sui-events
```

**Options:**

- `-o, --output <path>`: Output directory for generated types (default: `./sui-events`)

This will generate:
- `sui-events/<packageId>/types.ts`: TypeScript interfaces for all events
- `sui-events/<packageId>/index.ts`: Exports for types and client helper
- `sui-events/<packageId>/package-info.json`: Package metadata
- `sui-events/index.ts`: Root index that exports all packages

**Note:** Each package is organized in its own folder (using package ID without `0x` prefix) to support multiple packages.

### Step 2: Get Your Surflux API Key

1. Visit [Surflux](https://surflux.dev) and sign up
2. Create a new project and get your API key
3. Use the API key in your application

## 📚 Usage Examples

### NestJS API Example

Complete NestJS integration with event streaming service:

#### 1. Install Dependencies

```bash
npm install sui-event-catcher @nestjs/common @nestjs/core
```

#### 2. Generate Types

```bash
npx sui-event-catcher <your-package-id> testnet -o ./src/sui-events
```

#### 3. Create Event Service Module

**src/sui-events/sui-events.module.ts:**

```typescript
import { Module, Global } from '@nestjs/common';
import { SuiEventsService } from './sui-events.service';

@Global()
@Module({
  providers: [SuiEventsService],
  exports: [SuiEventsService],
})
export class SuiEventsModule {}
```

**src/sui-events/sui-events.service.ts:**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { EventClient } from 'sui-event-catcher';
import { ConfigService } from '@nestjs/config';
import {
  BadgeMinted,
  EventTypes,
  createEventClient,
} from './sui-events';

@Injectable()
export class SuiEventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SuiEventsService.name);
  private client: EventClient;
  private readonly events: BadgeMinted[] = [];

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SURFLUX_API_KEY');
    const packageId = this.configService.get<string>('SUI_PACKAGE_ID');
    const network = this.configService.get<string>('SUI_NETWORK', 'testnet');

    if (!apiKey || !packageId) {
      throw new Error('SURFLUX_API_KEY and SUI_PACKAGE_ID must be configured');
    }

    this.client = createEventClient(apiKey, './src/sui-events', network);
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Connected to Surflux event stream');

      this.setupEventHandlers();
    } catch (error) {
      this.logger.error('Failed to connect to Surflux:', error);
      throw error;
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
      this.logger.log('Disconnected from Surflux event stream');
    }
  }

  private setupEventHandlers() {
    this.client.onEvent<BadgeMinted>('BadgeMinted', (event) => {
      this.logger.log(`Badge minted: ${JSON.stringify(event)}`);
      this.events.push(event);
      this.handleBadgeMinted(event);
    });

    this.client.on(EventTypes.BadgeBurned, (event: any) => {
      this.logger.log(`Badge burned: ${JSON.stringify(event)}`);
      this.handleBadgeBurned(event);
    });

    this.client.onAll((event) => {
      this.logger.debug(`Event received: ${event.type}`);
    });
  }

  private async handleBadgeMinted(event: BadgeMinted) {
    try {
      this.logger.log(`Processing badge mint for recipient: ${event.recipient}`);
      this.logger.log(`Badge ID: ${event.badgeId}`);
      this.logger.log(`Transaction: ${event.tx_hash}`);
      this.logger.log(`Checkpoint: ${event.checkpoint_id}`);

      // Add your business logic here
      // Example: Save to database, send notification, etc.
    } catch (error) {
      this.logger.error(`Error handling BadgeMinted event:`, error);
    }
  }

  private async handleBadgeBurned(event: any) {
    try {
      this.logger.log(`Processing badge burn: ${JSON.stringify(event)}`);
      // Add your business logic here
    } catch (error) {
      this.logger.error(`Error handling BadgeBurned event:`, error);
    }
  }

  getEvents(): BadgeMinted[] {
    return [...this.events];
  }

  getEventCount(): number {
    return this.events.length;
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}
```

#### 4. Create Event Controller

**src/sui-events/sui-events.controller.ts:**

```typescript
import { Controller, Get } from '@nestjs/common';
import { SuiEventsService } from './sui-events.service';

@Controller('sui-events')
export class SuiEventsController {
  constructor(private readonly suiEventsService: SuiEventsService) {}

  @Get('status')
  getStatus() {
    return {
      connected: this.suiEventsService.isConnected(),
      eventCount: this.suiEventsService.getEventCount(),
    };
  }

  @Get('events')
  getEvents() {
    return {
      events: this.suiEventsService.getEvents(),
      count: this.suiEventsService.getEventCount(),
    };
  }
}
```

#### 5. Update App Module

**src/app.module.ts:**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuiEventsModule } from './sui-events/sui-events.module';
import { SuiEventsController } from './sui-events/sui-events.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SuiEventsModule,
  ],
  controllers: [SuiEventsController],
})
export class AppModule {}
```

#### 6. Environment Configuration

**.env:**

```env
SURFLUX_API_KEY=your-surflux-api-key-here
SUI_PACKAGE_ID=0xa7b9d2f72aca22d1a1eb27919d5c07a05ac368f61c0b9c57c3cf6240f8882432
SUI_NETWORK=testnet
```

#### 7. Start Your Application

```bash
npm run start:dev
```

The service will automatically connect to Surflux and start listening for events when the module initializes.

### React Example

```typescript
import { useEffect, useState } from 'react';
import { EventClient } from 'sui-event-catcher';
import { BadgeMinted } from './sui-events';

function useSuiEvents(apiKey: string, packageId: string) {
  const [events, setEvents] = useState<BadgeMinted[]>([]);
  const [client, setClient] = useState<EventClient | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventClient = new EventClient(apiKey, packageId, './sui-events', 'testnet');
    
    eventClient.connect().then(() => {
      setConnected(true);
      eventClient.onEvent<BadgeMinted>('BadgeMinted', (event) => {
        setEvents(prev => [...prev, event]);
      });
    }).catch((error) => {
      console.error('Failed to connect:', error);
    });

    setClient(eventClient);

    return () => {
      eventClient.disconnect();
      setConnected(false);
    };
  }, [apiKey, packageId]);

  return { events, client, connected };
}

function App() {
  const { events, connected } = useSuiEvents(
    process.env.REACT_APP_SURFLUX_API_KEY || '',
    process.env.REACT_APP_SUI_PACKAGE_ID || ''
  );

  return (
    <div>
      <h1>Sui Events</h1>
      <p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <h2>Badge Events ({events.length})</h2>
      {events.map((event, i) => (
        <div key={i} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
          <p><strong>Recipient:</strong> {event.recipient}</p>
          <p><strong>Badge ID:</strong> {event.badgeId}</p>
          <p><strong>Transaction:</strong> {event.tx_hash}</p>
          <p><strong>Checkpoint:</strong> {event.checkpoint_id}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
```

### Advanced Usage

```typescript
import { EventClient } from 'sui-event-catcher';
import * as EventTypes from './sui-events';

const client = new EventClient(API_KEY, PACKAGE_ID, './sui-events', 'testnet');

await client.connect();

// Subscribe to specific event with full type
client.on(EventTypes.EventTypes.BadgeMinted, (event: EventTypes.BadgeMinted) => {
  console.log('Badge minted:', event);
  console.log('Transaction hash:', event.tx_hash);
  console.log('Checkpoint ID:', event.checkpoint_id);
  console.log('Timestamp:', event.timestamp_ms);
});

// Subscribe to all events from this package
client.onAll((event) => {
  console.log('Any event:', event.type, event.data);
});

// Pattern matching with wildcards
client.on('0x...::*::Badge*', (event) => {
  console.log('Badge event:', event);
});

// Wait for a specific event (with timeout)
try {
  const event = await client.waitFor<EventTypes.BadgeMinted>(
    EventTypes.EventTypes.BadgeMinted,
    30000 // 30 second timeout
  );
  console.log('Received event:', event);
} catch (error) {
  console.error('Timeout waiting for event');
}

// Unsubscribe
const handler = (event: EventTypes.BadgeMinted) => {
  console.log(event);
};
client.on(EventTypes.EventTypes.BadgeMinted, handler);
client.off(EventTypes.EventTypes.BadgeMinted, handler);

// Check connection status
if (client.connected) {
  console.log('Client is connected');
}

// Disconnect when done
client.disconnect();
```

## 📖 API Reference

### CLI

```bash
sui-event-catcher <packageId> <network> [options]
```

**Arguments:**
- `packageId`: Sui package ID (hex string)
- `network`: Network name (`mainnet`, `testnet`, `devnet`) or custom RPC URL

**Options:**
- `-o, --output <path>`: Output directory (default: `./sui-events`)

### EventClient

#### Constructor

```typescript
new EventClient(
  apiKey: string,
  packageId: string,
  generatedTypesPath?: string,
  network?: string
)
```

**Parameters:**
- `apiKey`: Your Surflux API key
- `packageId`: Sui package ID
- `generatedTypesPath`: Path to generated types (default: `./sui-events`)
- `network`: Network name (`mainnet`, `testnet`, `devnet`) (default: `testnet`)

#### Methods

##### `connect(): Promise<void>`

Connect to Surflux event stream. Returns a promise that resolves when connected.

##### `disconnect(): void`

Disconnect from event stream and clean up resources.

##### `on<T>(eventType: string, handler: (event: T) => void): void`

Subscribe to an event type. Supports:
- Full event type: `0x...::module::EventName`
- Event name only: `EventName`
- Wildcard patterns: `0x...::*::EventName`

See [Wildcard Usage](#-wildcard-usage) section for detailed examples.

##### `off(eventType: string, handler?: (event: any) => void): void`

Unsubscribe from an event type. If no handler is provided, removes all handlers for that event type.

##### `onEvent<T>(eventTypeName: string, handler: (event: T) => void): void`

Subscribe to an event with type safety. Uses generated types to provide full IntelliSense support.

##### `onAll(handler: (event: SurfluxEvent) => void): void`

Subscribe to all events from this package. Receives the full event structure with metadata (timestamp, checkpoint_id, tx_hash, etc.).

See [Wildcard Usage](#-wildcard-usage) section for detailed examples.

##### `waitFor<T>(eventType: string, timeout?: number): Promise<T>`

Wait for a specific event. Returns a promise that resolves when the event is received or rejects on timeout.

##### `get connected(): boolean`

Check if client is connected to the event stream.

## 🎯 Wildcard Usage

The EventClient supports powerful wildcard pattern matching for flexible event subscriptions. There are two main approaches:

### Full Wildcard (`onAll`)

Use `onAll()` to subscribe to **all events** from your package. This method receives the complete event structure with all metadata:

```typescript
client.onAll((event) => {
  // event contains full structure:
  // {
  //   type: 'package_event',
  //   timestamp_ms: 1764681385151,
  //   checkpoint_id: 270652773,
  //   tx_hash: 'EveQMmg4dkiv8Lmom4tCcHyYTJ4oBWs3qZ1EQzWrP9rW',
  //   data: {
  //     event_index: 0,
  //     sender: '0x...',
  //     event_type: '0x...::module::EventName',
  //     contents: { ... }
  //   }
  // }
  console.log('Event type:', event.type);
  console.log('Transaction:', event.tx_hash);
  console.log('Checkpoint:', event.checkpoint_id);
  console.log('Timestamp:', event.timestamp_ms);
  console.log('Event data:', event.data);
});
```

**Use cases:**
- Logging all events for debugging
- Monitoring all activity from a package
- Building analytics dashboards
- Event routing/dispatching

### Pattern Matching Wildcards

Use wildcard patterns with `on()` to match multiple events based on patterns. These handlers receive **only the event contents** (not the full metadata):

```typescript
// Match all events from a specific module
client.on('0xabc123::my_module::*', (event) => {
  // event is just the contents: { field1: 'value', field2: 'value' }
  console.log('Event from my_module:', event);
});

// Match all events with names starting with "Badge"
client.on('0xabc123::*::Badge*', (event) => {
  // Matches: BadgeMinted, BadgeBurned, BadgeTransferred, etc.
  console.log('Badge-related event:', event);
});

// Match all events from any module with a specific name
client.on('0xabc123::*::ListingCreatedEvent', (event) => {
  // Matches ListingCreatedEvent from any module in the package
  console.log('Listing created:', event);
});

// Match events with partial package ID (useful for multiple packages)
client.on('*::offer::*', (event) => {
  // Matches any event from any "offer" module in any package
  console.log('Offer event:', event);
});
```

**Pattern Syntax:**
- `*` matches any sequence of characters
- Patterns are converted to regular expressions: `*` becomes `.*`
- Matching is case-sensitive

**Examples:**

```typescript
// Match all auction events
client.on('0xabc123::*::Auction*', (event) => {
  // Matches: AuctionCreated, AuctionCancelled, AuctionFinalized
  console.log('Auction event:', event);
});

// Match all events from the "marketplace" module
client.on('0xabc123::marketplace::*', (event) => {
  console.log('Marketplace event:', event);
});

// Match specific event from any module
client.on('0xabc123::*::TransferEvent', (event) => {
  console.log('Transfer event from any module:', event);
});
```

### Handler Data Differences

**Important:** The data passed to handlers differs based on the subscription type:

| Subscription Type | Handler Receives |
|------------------|------------------|
| `onAll()` | Full event structure with `type`, `timestamp_ms`, `checkpoint_id`, `tx_hash`, `data` |
| `on('*')` | Same as `onAll()` - full event structure |
| `on('pattern')` | Only event contents (`event.data.contents`) |
| `on('EventName')` | Only event contents (`event.data.contents`) |
| `on('0x...::module::EventName')` | Only event contents (`event.data.contents`) |

**Example:**

```typescript
// Full event structure
client.onAll((fullEvent) => {
  console.log(fullEvent.tx_hash);        // ✅ Available
  console.log(fullEvent.checkpoint_id);  // ✅ Available
  console.log(fullEvent.data.contents); // ✅ Available
});

// Pattern matching - only contents
client.on('0xabc123::*::ListingCreatedEvent', (contents) => {
  console.log(contents.domain_name);     // ✅ Available
  console.log(contents.price);           // ✅ Available
  // console.log(contents.tx_hash);      // ❌ Not available
  // console.log(contents.checkpoint_id); // ❌ Not available
});
```

### Best Practices

1. **Use `onAll()` for monitoring/logging**: When you need transaction metadata
2. **Use pattern matching for business logic**: When you only need event data
3. **Combine both**: Use `onAll()` for logging and specific patterns for handling

```typescript
// Log everything
client.onAll((event) => {
  logger.info(`Event: ${event.data.event_type}`, {
    tx: event.tx_hash,
    checkpoint: event.checkpoint_id,
    timestamp: event.timestamp_ms
  });
});

// Handle specific events
client.on('0xabc123::*::ListingCreatedEvent', (listing) => {
  // Business logic with just the listing data
  processListing(listing);
});
```

## 🔧 Generated Types

After running the CLI, you'll get TypeScript interfaces for all events in your package:

```typescript
export interface BadgeMinted {
  recipient: string;
  badgeId: string;
  timestamp_ms?: number;
  checkpoint_id?: number;
  tx_hash?: string;
}

export interface BadgeBurned {
  badgeId: string;
  owner: string;
  timestamp_ms?: number;
  checkpoint_id?: number;
  tx_hash?: string;
}

export const EventTypes = {
  BadgeMinted: '0x...::badge::BadgeMinted',
  BadgeBurned: '0x...::badge::BadgeBurned',
} as const;

export type EventTypeName = keyof typeof EventTypes;

export type EventTypeMap = {
  [EventTypes.BadgeMinted]: BadgeMinted;
  [EventTypes.BadgeBurned]: BadgeBurned;
};

export enum EventName {
  BadgeMinted = 'BadgeMinted',
  BadgeBurned = 'BadgeBurned',
}
```

## 🗺️ Type Mapping

Move types are automatically mapped to TypeScript:

| Move Type | TypeScript Type |
|-----------|----------------|
| `u8, u16, u32` | `number` |
| `u64, u128, u256` | `string` |
| `bool` | `boolean` |
| `address` | `string` |
| `vector<T>` | `T[]` |
| `option<T>` | `T | null` |
| `Struct` | TypeScript `interface` |
| `Map<K, V>` | `Map<K, V>` or `Record<string, V>` |
| `Set<T>` | `Set<T>` |

## 📋 Requirements

- Node.js 18+
- TypeScript 4.0+
- Surflux API key ([Get one here](https://surflux.dev))

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🔗 Links

- [Surflux Documentation](https://surflux.dev/docs)
- [Sui Documentation](https://docs.sui.io)
