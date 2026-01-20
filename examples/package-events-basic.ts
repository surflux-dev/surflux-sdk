/**
 * Basic Package Events Client Example
 *
 * This example demonstrates basic usage of the SurfluxPackageEventsClient
 * to receive real-time package events from Sui blockchain.
 */

import { SurfluxPackageEventsClient, SurfluxNetwork } from '../src/index';

async function main() {
  const streamKey = process.env.SURFLUX_STREAM_KEY || 'your-stream-key-here';

  // Initialize the client
  const client = new SurfluxPackageEventsClient({
    streamKey,
    network: SurfluxNetwork.TESTNET,
  });

  try {
    console.log('Connecting to Surflux event stream...');
    await client.connect();
    console.log('Connected! Listening for events...\n');

    // Subscribe to a specific event type by full name
    client.on('0x123::my_module::MyEvent', (event) => {
      console.log('📦 MyEvent received:', JSON.stringify(event, null, 2));
    });

    // Subscribe to an event by its name only (last part after ::)
    client.on('MyEvent', (event) => {
      console.log('📦 Event by name:', JSON.stringify(event, null, 2));
    });

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

    // Use pattern matching to subscribe to all events from a module
    client.on('0x123::my_module::*', (event) => {
      console.log('🎯 Pattern match:', JSON.stringify(event, null, 2));
    });

    // Wait for a specific event with timeout
    try {
      console.log('Waiting for MyEvent (timeout: 30s)...');
      const event = await client.waitFor('MyEvent', 30000);
      console.log('\n✅ Event received!', JSON.stringify(event, null, 2));
    } catch (error) {
      if (error instanceof Error && error.message.includes('Timeout')) {
        console.log('\n⏰ No events received within timeout period');
      } else {
        throw error;
      }
    }

    // Keep the process running
    console.log('\nPress Ctrl+C to stop...\n');
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
