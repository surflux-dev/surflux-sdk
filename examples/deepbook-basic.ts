/**
 * Basic Deepbook Client Example
 * 
 * This example demonstrates basic usage of the SurfluxDeepbookClient
 * to query trading pools, trades, order books, and OHLCV data.
 * 
 * HOW TO RUN:
 * 1. Make sure you've built the project: npm run build
 * 2. Configure your API key in examples/keys.ts (see keys.ts for instructions)
 * 3. Run with: npx tsx examples/deepbook-basic.ts
 *    Or: npx ts-node examples/deepbook-basic.ts
 */

import { SurfluxIndexerClient } from '../dist';
import { SURFLUX_API_KEY, SURFLUX_NETWORK } from './keys';

async function main() {
  // Initialize the client
  console.log('1. Initializing SurfluxIndexerClient...');

  const surfluxClient = new SurfluxIndexerClient({
    apiKey: SURFLUX_API_KEY,
    network: SURFLUX_NETWORK,
  });

  console.log('Surflux Deepbook Client Initialized\n');

  // Get All Pools
  console.log('2. Fetching all pools...');

  const pools = await surfluxClient.deepbook.getPools();

  console.log(`Found ${pools.length} pools\n`);

  // Get SUI_USDC Pool
  const suiUsdcPool = pools.find(pool => pool.pool_name === 'SUI_USDC');
  if (!suiUsdcPool) {
    console.log('SUI_USDC pool not found');
    return;
  }

  console.log(`SUI_USDC pool id: ${suiUsdcPool.pool_id}`);
  console.log(` - Base: ${suiUsdcPool.base_asset_symbol} (${suiUsdcPool.base_asset_decimals} decimals)`);
  console.log(` - Quote: ${suiUsdcPool.quote_asset_symbol} (${suiUsdcPool.quote_asset_decimals} decimals)`);
  console.log('');

  // Get recent trades
  console.log(`3. Fetching recent trades for the SUI_USDC pool...`);
  const trades = await surfluxClient.deepbook.getTrades({
    pool_name: 'SUI_USDC',
    limit: 5,
  });
  if (trades.length > 0) {
    const trade = trades[0];
    console.log(`Latest trade:`);
    console.log(` - Price: ${trade.price / 10 ** suiUsdcPool.quote_asset_decimals} ${suiUsdcPool.quote_asset_symbol}`);
    console.log(` - Quantity: ${trade.base_quantity / 10 ** suiUsdcPool.base_asset_decimals} ${suiUsdcPool.base_asset_symbol}`);
    console.log(` - Value: ${trade.quote_quantity / 10 ** suiUsdcPool.quote_asset_decimals} ${suiUsdcPool.quote_asset_symbol}`);
  } else {
    console.log(`- No trades found`);
  }
  console.log('');

  // Get order book
  console.log(`4. Fetching order book for the SUI_USDC pool (limit 5)...`);
  const orderBook = await surfluxClient.deepbook.getOrderBookDepth({
    pool_name: 'SUI_USDC',
    limit: 5,
  });
  console.log('SUI_USDC Order Book:');
  console.log(' - Bids:');
  console.log('    Price (raw): Quantity (raw):');
  for (const bid of orderBook.bids) {
    console.log(`    ${bid.price}: ${bid.total_quantity}`);
  }
  console.log(' - Asks:');
  console.log('    Price (raw): Quantity (raw):');
  for (const ask of orderBook.asks) {
    console.log(`    ${ask.price}: ${ask.total_quantity}`);
  }

  // Get OHLCV candles
  console.log(`5. Fetching OHLCV candles for the SUI_USDC pool (timeframe 1h)...`);
  const candles = await surfluxClient.deepbook.getOHLCV({
    pool_name: 'SUI_USDC',
    timeframe: '1h',
    limit: 5,
  });
  console.log('SUI_USDC OHLCV Candles:');
  console.log('  Tim : Open (raw) : High (raw) : Low (raw) : Close (raw) : Volume (raw)');
  for (const candle of candles) {
    console.log(`  ${candle.timestamp} : ${candle.open} : ${candle.high} : ${candle.low} : ${candle.close} : ${candle.volume_base} ${suiUsdcPool.base_asset_symbol}`);
  }
}

// Run the example
if (require.main === module) {
  main();
}
