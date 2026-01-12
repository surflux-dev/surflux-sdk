/**
 * Deepbook OHLCV Chart Data Example
 * 
 * This example demonstrates how to fetch OHLCV candlestick data
 * for different timeframes and prepare it for charting.
 */

import { SurfluxDeepbookClient, SurfluxNetwork } from '../src/index';

async function getChartData() {
  const client = new SurfluxDeepbookClient({
    apiKey: process.env.SURFLUX_API_KEY || 'your-api-key-here',
    network: SurfluxNetwork.TESTNET,
  });

  try {
    // Get pools
    const pools = await client.getPools();
    if (pools.length === 0) {
      console.log('No pools available');
      return;
    }

    const poolName = pools[0].pool_name;
    console.log(`Fetching OHLCV data for ${poolName}\n`);

    // Get candles for different timeframes
    const timeframes: Array<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'> = ['1h', '4h', '1d'];

    for (const timeframe of timeframes) {
      console.log(`\n${timeframe} candles:`);

      const candles = await client.getOHLCV({
        pool_name: poolName,
        timeframe,
        limit: 10,
      });

      if (candles.length === 0) {
        console.log('  No candles available');
        continue;
      }

      // Display candle data
      candles.forEach((candle, index) => {
        const open = parseFloat(candle.open);
        const high = parseFloat(candle.high);
        const low = parseFloat(candle.low);
        const close = parseFloat(candle.close);
        const volume = parseFloat(candle.volume_base);
        const isGreen = close >= open;

        console.log(`  Candle ${index + 1}:`);
        console.log(`    Time: ${new Date(parseInt(candle.timestamp) * 1000).toISOString()}`);
        console.log(`    OHLC: ${open} / ${high} / ${low} / ${close} ${isGreen ? '🟢' : '🔴'}`);
        console.log(`    Volume: ${volume}`);
        console.log(`    Trades: ${candle.trade_count}`);
      });

      // Calculate price statistics
      const closes = candles.map(c => parseFloat(c.close));
      const volumes = candles.map(c => parseFloat(c.volume_base));

      const firstClose = closes[0];
      const lastClose = closes[closes.length - 1];
      const priceChange = lastClose - firstClose;
      const priceChangePercent = (priceChange / firstClose) * 100;
      const totalVolume = volumes.reduce((sum, v) => sum + v, 0);

      console.log(`\n  Summary:`);
      console.log(`    Price change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(6)} (${priceChangePercent > 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)`);
      console.log(`    Total volume: ${totalVolume.toFixed(6)}`);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  getChartData();
}
