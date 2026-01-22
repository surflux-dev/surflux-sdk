/**
 * Package Events Typed Handlers Example
 *
 * This example demonstrates using typed handlers with the SurfluxPackageEventsClient
 * to handle multiple event types in a type-safe way.
 * 
 * HOW TO RUN:
 * 1. Make sure you've built the project: npm run build
 * 2. Configure your stream key in examples/keys.ts (see keys.ts for instructions)
 * 3. Run with: npx tsx examples/package-events-typed.ts
 *    Or: npx ts-node examples/package-events-typed.ts
 * 4. Press Ctrl+C to stop the stream
 */

import { SurfluxPackageEventsClient } from '../dist';
import { SURFLUX_STREAM_KEY, SURFLUX_NETWORK } from './keys';

// Define your event types
interface TransferEvent {
  from: string;
  to: string;
  amount: number;
}

interface MintEvent {
  recipient: string;
  token_id: string;
}

interface BurnEvent {
  token_id: string;
  amount: number;
}

async function main() {
  const streamKey = SURFLUX_STREAM_KEY;

  // Initialize the client
  const client = new SurfluxPackageEventsClient({
    streamKey,
    network: SURFLUX_NETWORK,
  });

  try {
    console.log('Connecting to Surflux event stream...');
    await client.connect();
    console.log('Connected! Listening for events...\n');

    // Use createTypedHandlers for type-safe event handling
    client.createTypedHandlers({
      Transfer: (event: TransferEvent) => {
        console.log('💸 Transfer Event:');
        console.log(`   From: ${event.from}`);
        console.log(`   To: ${event.to}`);
        console.log(`   Amount: ${event.amount}`);
      },
      Mint: (event: MintEvent) => {
        console.log('🪙 Mint Event:');
        console.log(`   Recipient: ${event.recipient}`);
        console.log(`   Token ID: ${event.token_id}`);
      },
      Burn: (event: BurnEvent) => {
        console.log('🔥 Burn Event:');
        console.log(`   Token ID: ${event.token_id}`);
        console.log(`   Amount: ${event.amount}`);
      },
    });

    // You can also use onEvent for individual events
    client.onEvent<TransferEvent>('Transfer', (event) => {
      console.log('Another transfer handler:', event);
    });

    // Subscribe to all events for logging
    client.onAll((event) => {
      console.log(`\n📋 Event received: ${event.type}`);
    });

    // Keep the process running
    console.log('Press Ctrl+C to stop...\n');
    await new Promise(() => {}); // Keep running indefinitely
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await client.disconnect();
    console.log('\nDisconnected from stream');
  }
}

main();
