/**
 * Basic Deepbook Client Example
 * 
 * This example demonstrates basic usage of the SurfluxDeepbookClient
 * to query trading pools, trades, order books, and OHLCV data.
 */

import { SurfluxDeepbookClient, SurfluxNetwork } from '../src/index';

async function main() {
  // Initialize the client
  const client = new SurfluxDeepbookClient({
    apiKey: process.env.SURFLUX_API_KEY || 'your-api-key-here',
    network: SurfluxNetwork.TESTNET,
  });

  try {
    // Get all available pools
    console.log('Fetching all pools...');
    const pools = await client.getPools();
    console.log(`Found ${pools.length} pools`);

    if (pools.length > 0) {
      const pool = pools[0];
      console.log(`\nFirst pool: ${pool.pool_name}`);
      console.log(`  Base: ${pool.base_asset_symbol} (${pool.base_asset_decimals} decimals)`);
      console.log(`  Quote: ${pool.quote_asset_symbol} (${pool.quote_asset_decimals} decimals)`);

      // Get recent trades
      console.log(`\nFetching recent trades for ${pool.pool_name}...`);
      const trades = await client.getTrades({
        pool_name: pool.pool_name,
        limit: 5,
      });
      console.log(`Found ${trades.length} trades`);

      if (trades.length > 0) {
        const trade = trades[0];
        console.log(`\nLatest trade:`);
        console.log(`  Price: ${trade.price}`);
        console.log(`  Quantity: ${trade.base_quantity} ${pool.base_asset_symbol}`);
        console.log(`  Value: ${trade.quote_quantity} ${pool.quote_asset_symbol}`);
      }

      // Get order book
      console.log(`\nFetching order book for ${pool.pool_name}...`);
      const orderBook = await client.getOrderBook({
        pool_name: pool.pool_name,
        limit: 5,
      });
      console.log(`Order book depth:`);
      console.log(`  Bids: ${orderBook.bids.length} levels`);
      console.log(`  Asks: ${orderBook.asks.length} levels`);

      if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
        const bestBid = parseFloat(orderBook.bids[0].price);
        const bestAsk = parseFloat(orderBook.asks[0].price);
        const spread = bestAsk - bestBid;
        console.log(`  Best bid: ${bestBid}`);
        console.log(`  Best ask: ${bestAsk}`);
        console.log(`  Spread: ${spread.toFixed(6)}`);
      }

      // Get OHLCV candles
      console.log(`\nFetching OHLCV candles for ${pool.pool_name}...`);
      const candles = await client.getOHLCV({
        pool_name: pool.pool_name,
        timeframe: '1h',
        limit: 5,
      });
      console.log(`Found ${candles.length} candles`);

      if (candles.length > 0) {
        const candle = candles[candles.length - 1];
        console.log(`\nLatest candle:`);
        console.log(`  Open: ${candle.open}`);
        console.log(`  High: ${candle.high}`);
        console.log(`  Low: ${candle.low}`);
        console.log(`  Close: ${candle.close}`);
        console.log(`  Volume: ${candle.volume_base} ${pool.base_asset_symbol}`);
      }
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
}
