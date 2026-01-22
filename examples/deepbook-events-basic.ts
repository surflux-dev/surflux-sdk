/**
 * Basic Deepbook Events Client Example
 *
 * This example demonstrates basic usage of the SurfluxDeepbookEventsClient
 * to receive real-time Deepbook trading events (live trades, order book updates, etc.).
 * 
 * HOW TO RUN:
 * 1. Make sure you've built the project: npm run build
 * 2. Configure your stream key in examples/keys.ts (see keys.ts for instructions)
 * 3. Run with: npx tsx examples/deepbook-events-basic.ts
 *    Or: npx ts-node examples/deepbook-events-basic.ts
 * 4. Press Ctrl+C to stop the stream
 */

import {
  DeepbookAllUpdatesCanceledData,
  DeepbookAllUpdatesExpiredData,
  DeepbookAllUpdatesModifiedData,
  DeepbookAllUpdatesPlacedData,
  DeepbookEvent,
  DeepbookOrderBookDepthData,
  DeepbookStreamType,
  DeepbookTrade,
  SurfluxDeepbookEventsClient
} from '../dist';
import { SURFLUX_NETWORK, SURFLUX_STREAM_KEY } from './keys';

async function main() {
  const streamKey = SURFLUX_STREAM_KEY;

  // Initialize the client for all updates
  const client = new SurfluxDeepbookEventsClient({
    streamKey,
    poolName: 'DEEP_SUI',
    streamType: DeepbookStreamType.LIVE_TRADES,
    network: SURFLUX_NETWORK,
  });

  try {
    console.log('Connecting to Deepbook events stream...');
    await client.connect();
    console.log('Connected! Listening for events...\n');

    // Subscribe to live trades
    // Note: on() handlers receive event.data, not the full event object
    client.on('deepbook_live_trades', (trade) => {
      const typedTrade = trade as DeepbookTrade;
      console.log('📊 Live Trade:');
      console.log(`   Price: ${typedTrade.price}`);
      console.log(`   Base Quantity: ${typedTrade.base_quantity}`);
      console.log(`   Quote Quantity: ${typedTrade.quote_quantity}`);
      console.log(`   Maker Order ID: ${typedTrade.maker_order_id}`);
      console.log(`   Taker Order ID: ${typedTrade.taker_order_id}`);
    });

    // Subscribe to order book depth updates
    client.on('deepbook_order_book_depth', (orderBook) => {
      const typedOrderBook = orderBook as DeepbookOrderBookDepthData;
      console.log('📖 Order Book Update:');
      console.log(`   Pool ID: ${typedOrderBook.pool_id}`);
      console.log(`   Bids: ${typedOrderBook.bids.length} levels`);
      console.log(`   Asks: ${typedOrderBook.asks.length} levels`);
      if (typedOrderBook.bids.length > 0) {
        console.log(`   Best Bid: ${typedOrderBook.bids[0].price} (${typedOrderBook.bids[0].total_quantity} qty)`);
      }
      if (typedOrderBook.asks.length > 0) {
        console.log(`   Best Ask: ${typedOrderBook.asks[0].price} (${typedOrderBook.asks[0].total_quantity} qty)`);
      }
    });

    // Subscribe to all order updates (placed, canceled, modified, expired)
    client.on('deepbook_all_updates_placed', (order) => {
      const typedOrder = order as DeepbookAllUpdatesPlacedData;
      console.log('✅ Order Placed:');
      console.log(`   Order ID: ${typedOrder.order_id}`);
      console.log(`   Price: ${typedOrder.price}`);
      console.log(`   Quantity: ${typedOrder.placed_quantity}`);
      console.log(`   Is Bid: ${typedOrder.is_bid}`);
      console.log(`   Trader: ${typedOrder.trader}`);
    });

    client.on('deepbook_all_updates_canceled', (order) => {
      const typedOrder = order as DeepbookAllUpdatesCanceledData;
      console.log('❌ Order Canceled:');
      console.log(`   Order ID: ${typedOrder.order_id}`);
      console.log(`   Canceled Quantity: ${typedOrder.base_asset_quantity_canceled}`);
      console.log(`   Trader: ${typedOrder.trader}`);
    });

    client.on('deepbook_all_updates_modified', (order) => {
      const typedOrder = order as DeepbookAllUpdatesModifiedData;
      console.log('✏️  Order Modified:');
      console.log(`   Order ID: ${typedOrder.order_id}`);
      console.log(`   Previous Quantity: ${typedOrder.previous_quantity}`);
      console.log(`   New Quantity: ${typedOrder.new_quantity}`);
      console.log(`   Filled Quantity: ${typedOrder.filled_quantity}`);
    });

    client.on('deepbook_all_updates_expired', (order) => {
      const typedOrder = order as DeepbookAllUpdatesExpiredData;
      console.log('⏰ Order Expired:');
      console.log(`   Order ID: ${typedOrder.order_id}`);
      console.log(`   Original Quantity: ${typedOrder.original_quantity}`);
      console.log(`   Canceled Quantity: ${typedOrder.base_asset_quantity_canceled}`);
    });

    // Subscribe to all events
    // Note: onAll() handlers receive the full event object with metadata
    client.onAll((event) => {
      const typedEvent = event as DeepbookEvent;
      console.log(`\n🔔 Event received: ${typedEvent.type}`);
      console.log(`   Timestamp: ${typedEvent.timestamp_ms}`);
      console.log(`   TX Hash: ${typedEvent.tx_hash}`);
      console.log(`   Checkpoint ID: ${typedEvent.checkpoint_id}`);
    });

    // Keep the process running
    console.log('Press Ctrl+C to stop...\n');
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
