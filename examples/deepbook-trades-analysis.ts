/**
 * Deepbook Trades Analysis Example
 * 
 * This example demonstrates how to analyze trades data,
 * including filtering by time range and calculating statistics.
 */

import { SurfluxDeepbookClient, SurfluxNetwork } from '../src/index';

async function analyzeTrades() {
  const client = new SurfluxDeepbookClient({
    apiKey: process.env.SURFLUX_API_KEY || 'your-api-key-here',
    network: SurfluxNetwork.TESTNET,
  });

  try {
    // Get pools to find a trading pair
    const pools = await client.getPools();
    if (pools.length === 0) {
      console.log('No pools available');
      return;
    }

    const poolName = pools[0].pool_name;
    console.log(`Analyzing trades for ${poolName}\n`);

    // Get trades from the last hour
    const now = Math.floor(Date.now() / 1000);
    const oneHourAgo = now - 3600;

    const trades = await client.getTrades({
      pool_name: poolName,
      from: oneHourAgo,
      to: now,
      limit: 100,
    });

    if (trades.length === 0) {
      console.log('No trades found in the last hour');
      return;
    }

    console.log(`Found ${trades.length} trades in the last hour\n`);

    // Calculate statistics
    const prices = trades.map(t => t.price);
    const volumes = trades.map(t => t.base_quantity);
    const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Calculate price change
    const firstPrice = trades[0].price;
    const lastPrice = trades[trades.length - 1].price;
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = (priceChange / firstPrice) * 100;

    console.log('Statistics:');
    console.log(`  Total trades: ${trades.length}`);
    console.log(`  Total volume: ${totalVolume.toFixed(6)}`);
    console.log(`  Min price: ${minPrice}`);
    console.log(`  Max price: ${maxPrice}`);
    console.log(`  Avg price: ${avgPrice.toFixed(6)}`);
    console.log(`  Price change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(6)} (${priceChangePercent > 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)`);

    // Group trades by price ranges
    const priceRanges: Record<string, number> = {};
    trades.forEach(trade => {
      const range = Math.floor(trade.price * 10) / 10; // Round to 0.1
      priceRanges[range] = (priceRanges[range] || 0) + trade.base_quantity;
    });

    console.log('\nVolume by price range:');
    Object.entries(priceRanges)
      .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
      .slice(0, 10)
      .forEach(([price, volume]) => {
        console.log(`  ${price}: ${volume.toFixed(6)}`);
      });
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  analyzeTrades();
}
