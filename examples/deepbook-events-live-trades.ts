/**
 * Deepbook Live Trades Events Example
 *
 * This example demonstrates using the SurfluxDeepbookEventsClient
 * with LIVE_TRADES stream type to receive only live trade events.
 */

import {
  SurfluxDeepbookEventsClient,
  DeepbookStreamType,
  SurfluxNetwork,
} from '../src/index';

async function main() {
  const streamKey = process.env.SURFLUX_STREAM_KEY || 'your-stream-key-here';

  // Initialize the client for live trades only
  const client = new SurfluxDeepbookEventsClient({
    streamKey,
    poolName: 'SUI-USDC',
    streamType: DeepbookStreamType.LIVE_TRADES,
    network: SurfluxNetwork.TESTNET,
  });

  try {
    console.log('Connecting to Deepbook live trades stream...');
    await client.connect();
    console.log('Connected! Listening for live trades...\n');

    let tradeCount = 0;
    let totalVolume = 0;

    // Subscribe to live trades
    client.on('deepbook_live_trades', (trade: any) => {
      tradeCount++;
      if (trade.data?.size) {
        totalVolume += parseFloat(trade.data.size);
      }

      console.log(`\n📊 Trade #${tradeCount}`);
      console.log(`   Price: ${trade.data?.price || 'N/A'}`);
      console.log(`   Size: ${trade.data?.size || 'N/A'}`);
      console.log(`   Side: ${trade.data?.side || 'N/A'}`);
      console.log(`   Total Volume: ${totalVolume.toFixed(4)}`);
    });

    // Subscribe to order book depth updates
    client.on('deepbook_order_book_depth', (orderBook: any) => {
      console.log('\n📖 Order Book Depth Update');
      console.log(`   Bids: ${orderBook.data?.bids?.length || 0} levels`);
      console.log(`   Asks: ${orderBook.data?.asks?.length || 0} levels`);
    });

    // Wait for first trade with timeout
    try {
      console.log('Waiting for first trade (timeout: 30s)...');
      const firstTrade = await client.waitFor('deepbook_live_trades', 30000);
      console.log('\n✅ First trade received!', JSON.stringify(firstTrade, null, 2));
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
