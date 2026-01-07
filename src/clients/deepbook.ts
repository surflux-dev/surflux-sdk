import {
  PoolInfo,
  OrderBookDepth,
  Trade,
  OHLCVCandle,
  GetOrderBookParams,
  GetTradesParams,
  GetOHLCVParams,
  SurfluxNetwork,
} from '../types';
import { buildQueryParams, isValidApiKey, httpRequest } from '../utils';
import { getApiBaseUrl } from '../constants';

/**
 * Client for interacting with the Surflux Deepbook API.
 * Provides methods to query trading pools, order books, trades, and OHLCV data.
 */
export class DeepbookClient {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Creates a new DeepbookClient instance.
   *
   * @param apiKey - Your Surflux API key
   * @param network - Network to use ('mainnet', 'testnet', 'custom')
   * @param customUrl - Optional custom URL to use. If provided and network is CUSTOM, it will override the network-specific URL.
   */
  constructor(apiKey: string | undefined, network: SurfluxNetwork, customUrl?: string) {
    if (!isValidApiKey(apiKey)) {
      throw new Error('Surflux API key is required. Please provide a valid API key.');
    }
    this.apiKey = apiKey;
    this.baseUrl = getApiBaseUrl(network, customUrl);
  }

  /**
   * Internal method to make requests to the Deepbook API.
   *
   * @param endpoint - The API endpoint path
   * @param params - Optional query parameters
   * @returns A promise that resolves to the response data
   * @private
   */
  private async request<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}/deepbook${endpoint}`;

    return httpRequest<T>(url, {
      apiKey: this.apiKey,
      params: params,
    });
  }

  /**
   * Retrieves all available trading pools.
   *
   * @returns A promise that resolves to an array of pool information
   *
   * @example
   * ```typescript
   * const pools = await client.getPools();
   * ```
   */
  async getPools(): Promise<PoolInfo[]> {
    return this.request<PoolInfo[]>('/get_pools');
  }

  /**
   * Retrieves trades for a specific pool.
   *
   * @param params - Parameters for the request
   * @param params.pool_name - The name of the trading pool
   * @param params.from - Optional Unix timestamp (seconds) for the start of the time range
   * @param params.to - Optional Unix timestamp (seconds) for the end of the time range
   * @param params.limit - Optional maximum number of trades to return
   * @returns A promise that resolves to an array of trade data
   *
   * @example
   * ```typescript
   * const trades = await client.getTrades({
   *   pool_name: 'SUI-USDC',
   *   from: 1699999999,
   *   to: 1700000000,
   *   limit: 100
   * });
   * ```
   */
  async getTrades(params: GetTradesParams): Promise<Trade[]> {
    const { pool_name, from, to, limit } = params;
    const queryParams = buildQueryParams({ from, to, limit });

    return this.request<Trade[]>(`/${pool_name}/trades`, queryParams);
  }

  /**
   * Retrieves the order book depth for a specific pool.
   *
   * @param params - Parameters for the request
   * @param params.pool_name - The name of the trading pool
   * @param params.limit - Optional maximum number of orders per side (bids/asks)
   * @returns A promise that resolves to the order book depth data
   *
   * @example
   * ```typescript
   * const orderBook = await client.getOrderBook({
   *   pool_name: 'SUI-USDC',
   *   limit: 20
   * });
   * ```
   */
  async getOrderBook(params: GetOrderBookParams): Promise<OrderBookDepth> {
    const { pool_name, limit } = params;
    const queryParams = buildQueryParams({ limit });

    return this.request<OrderBookDepth>(`/${pool_name}/order-book-depth`, queryParams);
  }

  /**
   * Retrieves OHLCV (Open, High, Low, Close, Volume) candlestick data for a specific pool.
   *
   * @param params - Parameters for the request
   * @param params.pool_name - The name of the trading pool
   * @param params.timeframe - The candlestick timeframe ('1m', '5m', '15m', '1h', '4h', '1d')
   * @param params.from - Optional Unix timestamp (seconds) for the start of the time range
   * @param params.to - Optional Unix timestamp (seconds) for the end of the time range
   * @param params.limit - Optional maximum number of candles to return
   * @returns A promise that resolves to an array of OHLCV candle data
   *
   * @example
   * ```typescript
   * const candles = await client.getOHLCV({
   *   pool_name: 'SUI-USDC',
   *   timeframe: '1h',
   *   from: 1699999999,
   *   to: 1700000000,
   *   limit: 100
   * });
   * ```
   */
  async getOHLCV(params: GetOHLCVParams): Promise<OHLCVCandle[]> {
    const { pool_name, timeframe, from, to, limit } = params;
    const queryParams = buildQueryParams({ from, to, limit });

    return this.request<OHLCVCandle[]>(`/${pool_name}/ohlcv/${timeframe}`, queryParams);
  }
}
