import {
  DeepbookPool,
  DeepbookOrderBookDepth,
  DeepbookTrade,
  DeepbookOHLCVCandle,
  GetDeepbookOrderBookDepthParams,
  GetDeepbookTradesParams,
  GetDeepbookOHLCVParams,
  SurfluxClientConfig,
} from '../types';
import {
  __validateIndexerClientConfig,
  buildQueryParams,
  httpRequest,
} from '../utils';
import { getApiBaseUrl } from '../constants';

/**
 * Client for interacting with the Surflux Deepbook API.
 *
 * @example
 * ```typescript
 * const client = new SurfluxDeepbookClient({
 *   apiKey: 'your-api-key',
 *   network: SurfluxNetwork.TESTNET
 * });
 * ```
 */
export class SurfluxDeepbookClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  /**
   * Creates a new SurfluxDeepbookClient instance.
   *
   * @param config - Configuration object
   * @param config.apiKey - Your Surflux API key
   * @param config.network - Network to use (mainnet, testnet, or custom)
   * @param config.customUrl - Optional custom URL (required when network is CUSTOM)
   */
  constructor(config: SurfluxClientConfig) {
    __validateIndexerClientConfig(config);

    this.apiKey = config.apiKey;
    this.baseUrl = getApiBaseUrl(config.network, config.customUrl);
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
  public async getPools(): Promise<DeepbookPool[]> {
    const url = `${this.baseUrl}/deepbook/get_pools`;

    return httpRequest<DeepbookPool[]>(url, {
      apiKey: this.apiKey,
    });
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
   * @throws {Error} If pool_name is invalid, timestamp range is invalid, or limit is out of bounds
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
  public async getTrades(params: GetDeepbookTradesParams): Promise<DeepbookTrade[]> {
    this.#validatePoolName(params.pool_name);
    this.#validateTimestampRange(params.from, params.to);
    this.#validateLimit(params.limit);

    const { pool_name, from, to, limit } = params;
    const queryParams = buildQueryParams({ from, to, limit });
    const url = `${this.baseUrl}/deepbook/${pool_name}/trades`;

    return httpRequest<DeepbookTrade[]>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }

  /**
   * Retrieves the order book depth for a specific pool.
   *
   * @param params - Parameters for the request
   * @param params.pool_name - The name of the trading pool
   * @param params.limit - Optional maximum number of orders per side (bids/asks)
   * @returns A promise that resolves to the order book depth data
   * @throws {Error} If pool_name is invalid or limit is out of bounds
   *
   * @example
   * ```typescript
   * const orderBook = await client.getOrderBookDepth({
   *   pool_name: 'SUI-USDC',
   *   limit: 20
   * });
   * ```
   */
  public async getOrderBookDepth(params: GetDeepbookOrderBookDepthParams): Promise<DeepbookOrderBookDepth> {
    this.#validatePoolName(params.pool_name);
    this.#validateLimit(params.limit);

    const { pool_name, limit } = params;
    const queryParams = buildQueryParams({ limit });
    const url = `${this.baseUrl}/deepbook/${pool_name}/order-book-depth`;

    return httpRequest<DeepbookOrderBookDepth>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
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
   * @throws {Error} If pool_name is invalid, timeframe is invalid, timestamp range is invalid, or limit is out of bounds
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
  public async getOHLCV(params: GetDeepbookOHLCVParams): Promise<DeepbookOHLCVCandle[]> {
    this.#validatePoolName(params.pool_name);
    this.#validateTimeframe(params.timeframe);
    this.#validateTimestampRange(params.from, params.to);
    this.#validateLimit(params.limit);

    const { pool_name, timeframe, from, to, limit } = params;
    const queryParams = buildQueryParams({ from, to, limit });
    const url = `${this.baseUrl}/deepbook/${pool_name}/ohlcv/${timeframe}`;

    return httpRequest<DeepbookOHLCVCandle[]>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }


  /**
   * Validates pool name format.
   *
   * @private
   * @param poolName - The pool name to validate
   * @throws {Error} If pool name is invalid
   */
  #validatePoolName(_poolName: string | undefined): void {
    // TODO: Implement validation
    // if (!poolName || typeof poolName !== 'string') {
    //   throw new Error('Pool name is required and must be a non-empty string.');
    // }

    // if (poolName.trim().length === 0) {
    //   throw new Error('Pool name cannot be empty.');
    // }

    // // Basic format check: should contain at least one hyphen or underscore
    // // Most pool names follow BASE-QUOTE format with hyphen, but some may use underscores
    // if (!poolName.includes('-') && !poolName.includes('_')) {
    //   throw new Error(
    //     `Invalid pool name format: "${poolName}". Pool name should contain at least one hyphen or underscore (e.g., 'SUI-USDC' or 'POOL_NAME').`
    //   );
    // }

    // // Check for valid characters (alphanumeric, hyphens, underscores)
    // if (!/^[A-Z0-9_-]+$/i.test(poolName)) {
    //   throw new Error(
    //     `Invalid pool name format: "${poolName}". Pool name can only contain alphanumeric characters, hyphens, and underscores.`
    //   );
    // }
  }

  /**
   * Validates timeframe value.
   *
   * @private
   * @param timeframe - The timeframe to validate
   * @throws {Error} If timeframe is invalid
   */
  #validateTimeframe(timeframe: string | undefined): asserts timeframe is '1m' | '5m' | '15m' | '1h' | '4h' | '1d' {
    // TODO: Implement validation
    // const validTimeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

    // if (!timeframe || typeof timeframe !== 'string') {
    //   throw new Error(
    //     `Timeframe is required. Valid values: ${validTimeframes.join(', ')}.`
    //   );
    // }

    // if (!validTimeframes.includes(timeframe)) {
    //   throw new Error(
    //     `Invalid timeframe: "${timeframe}". Valid values: ${validTimeframes.join(', ')}.`
    //   );
    // }
  }

  /**
   * Validates timestamp range (from < to).
   *
   * @private
   * @param from - Start timestamp in seconds
   * @param to - End timestamp in seconds
   * @throws {Error} If timestamp range is invalid
   */
  #validateTimestampRange(_from: number | undefined, _to: number | undefined): void {
    // TODO: Implement validation
    // if (from === undefined || to === undefined) {
    //   return; // Both optional, skip validation if either is missing
    // }

    // if (typeof from !== 'number' || typeof to !== 'number') {
    //   throw new Error('Timestamps must be numbers (Unix timestamp in seconds).');
    // }

    // if (from < 0 || to < 0) {
    //   throw new Error('Timestamps must be positive numbers.');
    // }

    // if (from >= to) {
    //   throw new Error(
    //     `Invalid timestamp range: "from" (${from}) must be less than "to" (${to}).`
    //   );
    // }

    // // Check if timestamps are reasonable (not too far in the future)
    // const maxFutureTimestamp = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    // if (from > maxFutureTimestamp || to > maxFutureTimestamp) {
    //   throw new Error('Timestamps cannot be more than 24 hours in the future.');
    // }
  }

  /**
   * Validates limit parameter bounds.
   *
   * @private
   * @param limit - The limit value to validate
   * @param maxLimit - Maximum allowed limit (default: 1000)
   * @param minLimit - Minimum allowed limit (default: 1)
   * @throws {Error} If limit is invalid
   */
  #validateLimit(_limit: number | undefined, _maxLimit: number = 1000, _minLimit: number = 1): void {
    // TODO: Implement validation
    // if (limit === undefined) {
    //   return; // Optional parameter
    // }

    // if (typeof limit !== 'number') {
    //   throw new Error(`Limit must be a number, got: ${typeof limit}.`);
    // }

    // if (!Number.isInteger(limit)) {
    //   throw new Error(`Limit must be an integer, got: ${limit}.`);
    // }

    // if (limit < minLimit) {
    //   throw new Error(`Limit must be at least ${minLimit}, got: ${limit}.`);
    // }

    // if (limit > maxLimit) {
    //   throw new Error(`Limit cannot exceed ${maxLimit}, got: ${limit}.`);
    // }
  }
}
