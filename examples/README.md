# Surflux SDK Examples

This directory contains example code demonstrating how to use the Surflux SDK.

## Deepbook Examples

### Basic Usage (`deepbook-basic.ts`)

Demonstrates basic usage of the `SurfluxDeepbookClient`:
- Fetching all available pools
- Getting recent trades
- Retrieving order book data
- Fetching OHLCV candlestick data

**Run:**
```bash
SURFLUX_API_KEY=your-api-key npx ts-node examples/deepbook-basic.ts
```

Or with tsx:
```bash
SURFLUX_API_KEY=your-api-key npx tsx examples/deepbook-basic.ts
```

### Trades Analysis (`deepbook-trades-analysis.ts`)

Shows how to analyze trades data:
- Filtering trades by time range
- Calculating price statistics
- Grouping trades by price ranges
- Computing volume distribution

**Run:**
```bash
SURFLUX_API_KEY=your-api-key npx ts-node examples/deepbook-trades-analysis.ts
```

Or with tsx:
```bash
SURFLUX_API_KEY=your-api-key npx tsx examples/deepbook-trades-analysis.ts
```

### OHLCV Chart Data (`deepbook-ohlcv-chart.ts`)

Demonstrates fetching OHLCV data for charting:
- Fetching candles for different timeframes
- Displaying candle data
- Calculating price changes
- Preparing data for visualization

**Run:**
```bash
SURFLUX_API_KEY=your-api-key npx ts-node examples/deepbook-ohlcv-chart.ts
```

Or with tsx:
```bash
SURFLUX_API_KEY=your-api-key npx tsx examples/deepbook-ohlcv-chart.ts
```

### Order Book Analysis (`deepbook-orderbook-analysis.ts`)

Shows how to analyze order book depth:
- Calculating spreads
- Assessing market liquidity
- Analyzing bid/ask depth
- Computing depth at different price levels

**Run:**
```bash
SURFLUX_API_KEY=your-api-key npx ts-node examples/deepbook-orderbook-analysis.ts
```

Or with tsx:
```bash
SURFLUX_API_KEY=your-api-key npx tsx examples/deepbook-orderbook-analysis.ts
```

## Prerequisites

- Node.js 18+
- TypeScript
- A valid Surflux API key

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set your API key (choose one method):
```bash
# Option 1: Export as environment variable
export SURFLUX_API_KEY=your-api-key-here

# Option 2: Pass inline with the command
SURFLUX_API_KEY=your-api-key-here npx ts-node examples/deepbook-basic.ts
```

3. Install TypeScript runner (if not already installed):
```bash
# Using ts-node
npm install -g ts-node

# Or using tsx (faster, recommended)
npm install -g tsx
```

## Running Examples

### Using ts-node

```bash
# Set API key once
export SURFLUX_API_KEY=your-api-key-here

# Run any example
npx ts-node examples/deepbook-basic.ts
npx ts-node examples/deepbook-trades-analysis.ts
npx ts-node examples/deepbook-ohlcv-chart.ts
npx ts-node examples/deepbook-orderbook-analysis.ts
```

### Using tsx (Recommended - Faster)

```bash
# Set API key once
export SURFLUX_API_KEY=your-api-key-here

# Run any example
npx tsx examples/deepbook-basic.ts
npx tsx examples/deepbook-trades-analysis.ts
npx tsx examples/deepbook-ohlcv-chart.ts
npx tsx examples/deepbook-orderbook-analysis.ts
```

### Using Node.js with compiled JavaScript

First, compile TypeScript:
```bash
npm run build
```

Then run the compiled JavaScript:
```bash
SURFLUX_API_KEY=your-api-key node dist/examples/deepbook-basic.js
```

## Notes

- All examples use the testnet network by default
- Replace `'your-api-key-here'` with your actual API key or set the `SURFLUX_API_KEY` environment variable
- Examples include error handling and will exit with an error code if something goes wrong
- Examples use relative imports (`../src/index`) for development. When using the published package, import from `@surflux/sdk` instead
- For production use, compile the examples first using `npm run build` and run the compiled JavaScript files
