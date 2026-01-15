/**
 * Deepbook Order Book Analysis Example
 * 
 * This example demonstrates how to analyze order book depth,
 * calculate spreads, and assess market liquidity.
 */

import { SurfluxDeepbookClient, SurfluxNetwork } from '../src/index';

async function analyzeOrderBook() {
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
    console.log(`Analyzing order book for ${poolName}\n`);

    // Get order book with more depth
    const orderBook = await client.getOrderBook({
      pool_name: poolName,
      limit: 20,
    });

    if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
      console.log('Order book is empty');
      return;
    }

    // Calculate spread
    const bestBid = parseFloat(orderBook.bids[0].price);
    const bestAsk = parseFloat(orderBook.asks[0].price);
    const spread = bestAsk - bestBid;
    const spreadPercent = (spread / bestBid) * 100;
    const midPrice = (bestBid + bestAsk) / 2;

    console.log('Order Book Summary:');
    console.log(`  Best bid: ${bestBid}`);
    console.log(`  Best ask: ${bestAsk}`);
    console.log(`  Mid price: ${midPrice.toFixed(6)}`);
    console.log(`  Spread: ${spread.toFixed(6)} (${spreadPercent.toFixed(4)}%)`);

    // Calculate bid/ask depth
    const bidVolume = orderBook.bids.reduce(
      (sum, bid) => sum + parseFloat(bid.total_quantity),
      0
    );
    const askVolume = orderBook.asks.reduce(
      (sum, ask) => sum + parseFloat(ask.total_quantity),
      0
    );

    console.log(`\nDepth Analysis:`);
    console.log(`  Total bid volume: ${bidVolume.toFixed(6)}`);
    console.log(`  Total ask volume: ${askVolume.toFixed(6)}`);
    console.log(`  Bid/Ask ratio: ${(bidVolume / askVolume).toFixed(2)}`);

    // Calculate depth at different price levels
    const depthLevels = [0.1, 0.5, 1.0]; // Percentage from mid price
    console.log(`\nDepth at price levels:`);

    depthLevels.forEach(level => {
      const priceBelow = midPrice * (1 - level / 100);
      const priceAbove = midPrice * (1 + level / 100);

      const bidDepth = orderBook.bids
        .filter(bid => parseFloat(bid.price) >= priceBelow)
        .reduce((sum, bid) => sum + parseFloat(bid.total_quantity), 0);

      const askDepth = orderBook.asks
        .filter(ask => parseFloat(ask.price) <= priceAbove)
        .reduce((sum, ask) => sum + parseFloat(ask.total_quantity), 0);

      console.log(`  ±${level}%: Bid=${bidDepth.toFixed(6)}, Ask=${askDepth.toFixed(6)}`);
    });

    // Show top levels
    console.log(`\nTop 5 Bid Levels:`);
    orderBook.bids.slice(0, 5).forEach((bid, index) => {
      console.log(`  ${index + 1}. Price: ${bid.price}, Volume: ${bid.total_quantity}, Orders: ${bid.order_count}`);
    });

    console.log(`\nTop 5 Ask Levels:`);
    orderBook.asks.slice(0, 5).forEach((ask, index) => {
      console.log(`  ${index + 1}. Price: ${ask.price}, Volume: ${ask.total_quantity}, Orders: ${ask.order_count}`);
    });
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  analyzeOrderBook();
}
