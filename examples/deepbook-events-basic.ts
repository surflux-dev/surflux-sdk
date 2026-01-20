/**
 * Basic Deepbook Events Client Example
 *
 * This example demonstrates basic usage of the SurfluxDeepbookEventsClient
 * to receive real-time Deepbook trading events (live trades, order book updates, etc.).
 */

import {
  SurfluxDeepbookEventsClient,
  DeepbookStreamType,
  SurfluxNetwork,
} from '../src/index';

async function main() {
  const streamKey = process.env.SURFLUX_STREAM_KEY || 'your-stream-key-here';

  // Initialize the client for all updates
  const client = new SurfluxDeepbookEventsClient({
    streamKey,
    poolName: 'SUI-USDC',
    streamType: DeepbookStreamType.ALL_UPDATES,
    network: SurfluxNetwork.TESTNET,
  });

  try {
    console.log('Connecting to Deepbook events stream...');
    await client.connect();
    console.log('Connected! Listening for events...\n');

    // Subscribe to live trades
    client.on('deepbook_live_trades', (trade) => {
      console.log('📊 Live Trade:', JSON.stringify(trade, null, 2));
    });

    // Subscribe to order book depth updates
    client.on('deepbook_order_book_depth', (orderBook) => {
      console.log('📖 Order Book Update:', JSON.stringify(orderBook, null, 2));
    });

    // Subscribe to all order updates (placed, canceled, modified, expired)
    client.on('deepbook_all_updates_placed', (order) => {
      console.log('✅ Order Placed:', JSON.stringify(order, null, 2));
    });

    client.on('deepbook_all_updates_canceled', (order) => {
      console.log('❌ Order Canceled:', JSON.stringify(order, null, 2));
    });

    client.on('deepbook_all_updates_modified', (order) => {
      console.log('✏️  Order Modified:', JSON.stringify(order, null, 2));
    });

    client.on('deepbook_all_updates_expired', (order) => {
      console.log('⏰ Order Expired:', JSON.stringify(order, null, 2));
    });

    // Subscribe to all events
    client.onAll((event) => {
      console.log(`\n🔔 Event received: ${event.type}`);
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
