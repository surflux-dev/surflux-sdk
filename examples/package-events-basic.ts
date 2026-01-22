/**
 * Basic Package Events Client Example
 *
 * This example demonstrates basic usage of the SurfluxPackageEventsClient
 * to receive real-time package events from Sui blockchain.
 * 
 * HOW TO RUN:
 * 1. Make sure you've built the project: npm run build
 * 2. Configure your stream key in examples/keys.ts (see keys.ts for instructions)
 * 3. Run with: npx tsx examples/package-events-basic.ts
 *    Or: npx ts-node examples/package-events-basic.ts
 * 4. Press Ctrl+C to stop the stream
 */

import { SurfluxPackageEventsClient } from '../dist';
import { SURFLUX_STREAM_KEY, SURFLUX_NETWORK } from './keys';

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

    // Subscribe to all events
    client.onAll((event) => {
      console.log(`\n🔔 Event: ${event.type}`);
      if ('timestamp_ms' in event) {
        console.log(`   Timestamp: ${event.timestamp_ms}`);
      }
      if ('tx_hash' in event) {
        console.log(`   TX Hash: ${event.tx_hash}`);
      }
    });

    // Keep the process running
    console.log('\nPress Ctrl+C to stop...\n');
    await new Promise(() => { }); // Keep running indefinitely
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await client.disconnect();
    console.log('\nDisconnected from stream');
  }
}

main();
