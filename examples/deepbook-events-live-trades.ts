/**
 * Deepbook Live Trades Events Example
 *
 * This example demonstrates using the SurfluxDeepbookEventsClient
 * with LIVE_TRADES stream type to receive only live trade events.
 * 
 * HOW TO RUN:
 * 1. Make sure you've built the project: npm run build
 * 2. Configure your stream key in examples/keys.ts (see keys.ts for instructions)
 * 3. Run with: npx tsx examples/deepbook-events-live-trades.ts
 *    Or: npx ts-node examples/deepbook-events-live-trades.ts
 * 4. Press Ctrl+C to stop the stream
 */

import {
  DeepbookOrderBookDepthData,
  DeepbookStreamType,
  DeepbookTrade,
  SurfluxDeepbookEventsClient
} from '../dist';
import { SURFLUX_NETWORK, SURFLUX_STREAM_KEY } from './keys';

async function main() {
  const streamKey = SURFLUX_STREAM_KEY;

  // Initialize the client for live trades only
  const client = new SurfluxDeepbookEventsClient({
    streamKey,
    poolName: 'SUI-USDC',
    streamType: DeepbookStreamType.LIVE_TRADES,
    network: SURFLUX_NETWORK,
  });

  try {
    console.log('Connecting to Deepbook live trades stream...');
    await client.connect();
    console.log('Connected! Listening for live trades...\n');

    let tradeCount = 0;
    let totalVolume = 0;

    // Subscribe to live trades
    // Note: on() handlers receive event.data (DeepbookTrade), not the full event object
    client.on('deepbook_live_trades', (trade) => {
      const typedTrade = trade as DeepbookTrade;
      tradeCount++;
      totalVolume += typedTrade.base_quantity;

      console.log(`\n📊 Trade #${tradeCount}`);
      console.log(`   Price: ${typedTrade.price}`);
      console.log(`   Base Quantity: ${typedTrade.base_quantity}`);
      console.log(`   Quote Quantity: ${typedTrade.quote_quantity}`);
      console.log(`   Taker Is Bid: ${typedTrade.taker_is_bid}`);
      console.log(`   Maker Order ID: ${typedTrade.maker_order_id}`);
      console.log(`   Taker Order ID: ${typedTrade.taker_order_id}`);
      console.log(`   Total Volume: ${totalVolume.toFixed(4)}`);
    });

    // Subscribe to order book depth updates
    client.on('deepbook_order_book_depth', (orderBook) => {
      const typedOrderBook = orderBook as DeepbookOrderBookDepthData;
      console.log('\n📖 Order Book Depth Update');
      console.log(`   Pool ID: ${typedOrderBook.pool_id}`);
      console.log(`   Bids: ${typedOrderBook.bids.length} levels`);
      console.log(`   Asks: ${typedOrderBook.asks.length} levels`);
      if (typedOrderBook.bids.length > 0 && typedOrderBook.asks.length > 0) {
        const spread = typedOrderBook.asks[0].price - typedOrderBook.bids[0].price;
        console.log(`   Spread: ${spread}`);
      }
    });

    // Wait for first trade with timeout
    // waitFor() returns the event data (DeepbookTrade), not the full event object
    try {
      console.log('Waiting for first trade (timeout: 30s)...');
      const firstTrade = await client.waitFor('deepbook_live_trades', 30000) as DeepbookTrade;
      console.log('\n✅ First trade received!');
      console.log(`   Price: ${firstTrade.price}`);
      console.log(`   Base Quantity: ${firstTrade.base_quantity}`);
      console.log(`   Quote Quantity: ${firstTrade.quote_quantity}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Timeout')) {
        console.log('\n⏰ No trades received within timeout period');
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
