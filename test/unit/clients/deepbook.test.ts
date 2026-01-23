import { SurfluxDeepbookClient } from '../../../src/clients/deepbook';
import { SurfluxNetwork } from '../../../src/types';
import { httpRequest } from '../../../src/utils/http';
import { getApiBaseUrl } from '../../../src/constants';
import type {
  DeepbookPool,
  DeepbookTrade,
  DeepbookOrderBookDepth,
  DeepbookOHLCVCandle,
  GetDeepbookTradesParams,
  GetDeepbookOrderBookDepthParams,
  GetDeepbookOHLCVParams,
  SurfluxClientConfig,
} from '../../../src/types';

// Mock dependencies
jest.mock('../../../src/utils/http');
jest.mock('../../../src/constants');

const mockHttpRequest = httpRequest as jest.MockedFunction<typeof httpRequest>;
const mockGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<typeof getApiBaseUrl>;

describe('DeepbookClient', () => {
  const validApiKey = 'test-api-key-12345';
  const testBaseUrl = 'https://testnet-api.surflux.dev';
  const mainnetBaseUrl = 'https://api.surflux.dev';
  const customBaseUrl = 'https://custom-api.example.com';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApiBaseUrl.mockReturnValue(testBaseUrl);
  });

  describe('Constructor', () => {
    it('should create instance with valid API key and testnet network', () => {
      const client = new SurfluxDeepbookClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET
      });

      expect(client).toBeInstanceOf(SurfluxDeepbookClient);
      expect(mockGetApiBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.TESTNET, undefined);
    });

    it('should create instance with valid API key and mainnet network', () => {
      mockGetApiBaseUrl.mockReturnValue(mainnetBaseUrl);

      const client = new SurfluxDeepbookClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.MAINNET
      });

      expect(client).toBeInstanceOf(SurfluxDeepbookClient);
      expect(mockGetApiBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.MAINNET, undefined);
    });

    it('should create instance with custom URL when network is CUSTOM', () => {
      mockGetApiBaseUrl.mockReturnValue(customBaseUrl);

      const client = new SurfluxDeepbookClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.CUSTOM,
        customUrl: customBaseUrl
      });

      expect(client).toBeInstanceOf(SurfluxDeepbookClient);
      expect(mockGetApiBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.CUSTOM, customBaseUrl);
    });

    it('should throw an error when config is invalid', () => {
      expect(() => {
        new SurfluxDeepbookClient(undefined as unknown as SurfluxClientConfig);
      }).toThrow('Config is required');

      expect(() => {
        new SurfluxDeepbookClient({ apiKey: validApiKey, network: 'invalid' as SurfluxNetwork });
      }).toThrow('Network is required. Please provide a valid network.');

      expect(() => {
        new SurfluxDeepbookClient({ apiKey: validApiKey, network: undefined as unknown as SurfluxNetwork });
      }).toThrow('Network is required. Please provide a valid network.');

      expect(() => {
        new SurfluxDeepbookClient({ apiKey: undefined as unknown as string, network: SurfluxNetwork.TESTNET });
      }).toThrow('Surflux API key is required. Please provide a valid API key.');

      expect(() => {
        new SurfluxDeepbookClient({ apiKey: '', network: SurfluxNetwork.TESTNET });
      }).toThrow('Surflux API key is required. Please provide a valid API key.');

      expect(() => {
        new SurfluxDeepbookClient({ apiKey: null as unknown as string, network: SurfluxNetwork.TESTNET });
      }).toThrow('Surflux API key is required. Please provide a valid API key.');

      expect(() => {
        new SurfluxDeepbookClient({ apiKey: validApiKey, network: SurfluxNetwork.CUSTOM });
      }).toThrow('Custom URL is required for custom network');
    });
  });

  // describe('getPools', () => {
  //   let client: SurfluxDeepbookClient;

  //   beforeEach(() => {
  //     client = new SurfluxDeepbookClient({ apiKey: validApiKey, network: SurfluxNetwork.TESTNET });
  //   });

  //   it('should return array of pools', async () => {
  //     const mockPools: PoolInfo[] = [
  //       {
  //         pool_id: '0x123',
  //         pool_name: 'SUI_USDC',
  //         base_asset_id: '0xbase',
  //         base_asset_decimals: 9,
  //         base_asset_symbol: 'SUI',
  //         base_asset_name: 'Sui',
  //         quote_asset_id: '0xquote',
  //         quote_asset_decimals: 6,
  //         quote_asset_symbol: 'USDC',
  //         quote_asset_name: 'USD Coin',
  //       },
  //       {
  //         pool_id: '0x456',
  //         pool_name: 'SUI-USDT',
  //         base_asset_id: '0xbase',
  //         base_asset_decimals: 9,
  //         base_asset_symbol: 'SUI',
  //         base_asset_name: 'Sui',
  //         quote_asset_id: '0xusdt',
  //         quote_asset_decimals: 6,
  //         quote_asset_symbol: 'USDT',
  //         quote_asset_name: 'Tether',
  //       },
  //     ];

  //     mockHttpRequest.mockResolvedValue(mockPools);

  //     const result = await client.getPools();

  //     expect(result).toEqual(mockPools);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/get_pools`,
  //       {
  //         apiKey: validApiKey,
  //         params: undefined,
  //       }
  //     );
  //   });

  //   it('should return empty array when no pools exist', async () => {
  //     mockHttpRequest.mockResolvedValue([]);

  //     const result = await client.getPools();

  //     expect(result).toEqual([]);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //   });

  //   it('should handle API errors', async () => {
  //     const errorMessage = 'API error: 404 Not Found';
  //     mockHttpRequest.mockRejectedValue(new Error(errorMessage));

  //     await expect(client.getPools()).rejects.toThrow(errorMessage);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //   });
  // });

  // describe('getTrades', () => {
  //   let client: DeepbookClient;

  //   beforeEach(() => {
  //     client = new DeepbookClient(validApiKey, SurfluxNetwork.TESTNET);
  //   });

  //   it('should return trades with all parameters', async () => {
  //     const mockTrades: Trade[] = [
  //       {
  //         event_digest: '0xabc',
  //         digest: '0xdef',
  //         sender: '0xsender',
  //         checkpoint: 12345,
  //         checkpoint_timestamp_ms: 1699999999000,
  //         package: '0xpackage',
  //         pool_id: '0xpool',
  //         maker_order_id: '0xmaker',
  //         taker_order_id: '0xtaker',
  //         maker_client_order_id: 'maker-123',
  //         taker_client_order_id: 'taker-456',
  //         price: 1.5,
  //         taker_fee: 0.001,
  //         taker_fee_is_deep: false,
  //         maker_fee: 0.001,
  //         maker_fee_is_deep: false,
  //         taker_is_bid: true,
  //         base_quantity: 100,
  //         quote_quantity: 150,
  //         maker_balance_manager_id: '0xmaker-balance',
  //         taker_balance_manager_id: '0xtaker-balance',
  //         onchain_timestamp: 1699999999,
  //       },
  //     ];

  //     const params: GetTradesParams = {
  //       pool_name: 'SUI_USDC',
  //       from: 1699999999,
  //       to: 1700000000,
  //       limit: 100,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockTrades);

  //     const result = await client.getTrades(params);

  //     expect(result).toEqual(mockTrades);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI_USDC/trades`,
  //       {
  //         apiKey: validApiKey,
  //         params: {
  //           from: 1699999999,
  //           to: 1700000000,
  //           limit: 100,
  //         },
  //       }
  //     );
  //   });

  //   it('should return trades with only pool_name', async () => {
  //     const mockTrades: Trade[] = [];
  //     const params: GetTradesParams = {
  //       pool_name: 'SUI_USDC',
  //     };

  //     mockHttpRequest.mockResolvedValue(mockTrades);

  //     const result = await client.getTrades(params);

  //     expect(result).toEqual(mockTrades);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI_USDC/trades`,
  //       {
  //         apiKey: validApiKey,
  //         params: {},
  //       }
  //     );
  //   });

  //   it('should filter out undefined parameters', async () => {
  //     const mockTrades: Trade[] = [];
  //     const params: GetTradesParams = {
  //       pool_name: 'SUI_USDC',
  //       from: undefined,
  //       to: undefined,
  //       limit: undefined,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockTrades);

  //     await client.getTrades(params);

  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI_USDC/trades`,
  //       {
  //         apiKey: validApiKey,
  //         params: {},
  //       }
  //     );
  //   });

  //   it('should handle API errors', async () => {
  //     const errorMessage = 'API error: 400 Bad Request';
  //     const params: GetTradesParams = {
  //       pool_name: 'INVALID-POOL',
  //     };

  //     mockHttpRequest.mockRejectedValue(new Error(errorMessage));

  //     await expect(client.getTrades(params)).rejects.toThrow(errorMessage);
  //   });

  //   it('should handle empty trades array', async () => {
  //     const params: GetTradesParams = {
  //       pool_name: 'SUI_USDC',
  //       from: 1699999999,
  //       to: 1700000000,
  //     };

  //     mockHttpRequest.mockResolvedValue([]);

  //     const result = await client.getTrades(params);
  //     expect(result).toEqual([]);
  //   });
  // });

  // describe('getOrderBookDepth', () => {
  //   let client: DeepbookClient;

  //   beforeEach(() => {
  //     client = new DeepbookClient(validApiKey, SurfluxNetwork.TESTNET);
  //   });

  //   it('should return order book with limit', async () => {
  //     const mockOrderBook: OrderBookDepth = {
  //       bids: [
  //         {
  //           price: '1.50',
  //           total_quantity: '1000',
  //           order_count: '5',
  //         },
  //         {
  //           price: '1.49',
  //           total_quantity: '500',
  //           order_count: '3',
  //         },
  //       ],
  //       asks: [
  //         {
  //           price: '1.51',
  //           total_quantity: '800',
  //           order_count: '4',
  //         },
  //         {
  //           price: '1.52',
  //           total_quantity: '600',
  //           order_count: '2',
  //         },
  //       ],
  //     };

  //     const params: GetOrderBookDepthParams = {
  //       pool_name: 'SUI_USDC',
  //       limit: 20,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockOrderBook);

  //     const result = await client.getOrderBookDepth(params);

  //     expect(result).toEqual(mockOrderBook);
  //     expect(result.bids).toHaveLength(2);
  //     expect(result.asks).toHaveLength(2);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI_USDC/order-book-depth`,
  //       {
  //         apiKey: validApiKey,
  //         params: {
  //           limit: 20,
  //         },
  //       }
  //     );
  //   });

  //   it('should return order book without limit', async () => {
  //     const mockOrderBook: OrderBookDepth = {
  //       bids: [],
  //       asks: [],
  //     };

  //     const params: GetOrderBookDepthParams = {
  //       pool_name: 'SUI_USDC',
  //     };

  //     mockHttpRequest.mockResolvedValue(mockOrderBook);

  //     const result = await client.getOrderBookDepth(params);

  //     expect(result).toEqual(mockOrderBook);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI_USDC/order-book-depth`,
  //       {
  //         apiKey: validApiKey,
  //         params: {},
  //       }
  //     );
  //   });

  //   it('should handle empty order book', async () => {
  //     const mockOrderBook: OrderBookDepth = {
  //       bids: [],
  //       asks: [],
  //     };

  //     const params: GetOrderBookDepthParams = {
  //       pool_name: 'SUI_USDC',
  //     };

  //     mockHttpRequest.mockResolvedValue(mockOrderBook);

  //     const result = await client.getOrderBookDepth(params);
  //     expect(result.bids).toEqual([]);
  //     expect(result.asks).toEqual([]);
  //   });

  //   it('should handle API errors', async () => {
  //     const errorMessage = 'API error: 404 Pool not found';
  //     const params: GetOrderBookDepthParams = {
  //       pool_name: 'INVALID-POOL',
  //     };

  //     mockHttpRequest.mockRejectedValue(new Error(errorMessage));

  //     await expect(client.getOrderBookDepth(params)).rejects.toThrow(errorMessage);
  //   });
  // });

  // describe('getOHLCV', () => {
  //   let client: DeepbookClient;

  //   beforeEach(() => {
  //     client = new DeepbookClient(validApiKey, SurfluxNetwork.TESTNET);
  //   });

  //   const timeframes: Array<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'> = [
  //     '1m',
  //     '5m',
  //     '15m',
  //     '1h',
  //     '4h',
  //     '1d',
  //   ];

  //   timeframes.forEach((timeframe) => {
  //     it(`should return OHLCV candles for ${timeframe} timeframe`, async () => {
  //       const mockCandles: OHLCVCandle[] = [
  //         {
  //           timestamp: '1699999999',
  //           open: '1.50',
  //           high: '1.55',
  //           low: '1.48',
  //           close: '1.52',
  //           volume_base: '1000',
  //           volume_quote: '1500',
  //           trade_count: 25,
  //         },
  //         {
  //           timestamp: '1700000000',
  //           open: '1.52',
  //           high: '1.53',
  //           low: '1.51',
  //           close: '1.51',
  //           volume_base: '800',
  //           volume_quote: '1216',
  //           trade_count: 18,
  //         },
  //       ];

  //       const params: GetOHLCVParams = {
  //         pool_name: 'SUI_USDC',
  //         timeframe,
  //         from: 1699999999,
  //         to: 1700000000,
  //         limit: 100,
  //       };

  //       mockHttpRequest.mockResolvedValue(mockCandles);

  //       const result = await client.getOHLCV(params);

  //       expect(result).toEqual(mockCandles);
  //       expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //       expect(mockHttpRequest).toHaveBeenCalledWith(
  //         `${testBaseUrl}/deepbook/SUI_USDC/ohlcv/${timeframe}`,
  //         {
  //           apiKey: validApiKey,
  //           params: {
  //             from: 1699999999,
  //             to: 1700000000,
  //             limit: 100,
  //           },
  //         }
  //       );
  //     });
  //   });

  //   it('should return OHLCV candles with only pool_name and timeframe', async () => {
  //     const mockCandles: OHLCVCandle[] = [];
  //     const params: GetOHLCVParams = {
  //       pool_name: 'SUI_USDC',
  //       timeframe: '1h',
  //     };

  //     mockHttpRequest.mockResolvedValue(mockCandles);

  //     const result = await client.getOHLCV(params);

  //     expect(result).toEqual(mockCandles);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI_USDC/ohlcv/1h`,
  //       {
  //         apiKey: validApiKey,
  //         params: {},
  //       }
  //     );
  //   });

  //   it('should filter out undefined parameters', async () => {
  //     const mockCandles: OHLCVCandle[] = [];
  //     const params: GetOHLCVParams = {
  //       pool_name: 'SUI_USDC',
  //       timeframe: '1h',
  //       from: undefined,
  //       to: undefined,
  //       limit: undefined,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockCandles);

  //     await client.getOHLCV(params);

  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI_USDC/ohlcv/1h`,
  //       {
  //         apiKey: validApiKey,
  //         params: {},
  //       }
  //     );
  //   });

  //   it('should handle empty candles array', async () => {
  //     const params: GetOHLCVParams = {
  //       pool_name: 'SUI_USDC',
  //       timeframe: '1h',
  //     };

  //     mockHttpRequest.mockResolvedValue([]);

  //     const result = await client.getOHLCV(params);
  //     expect(result).toEqual([]);
  //   });

  //   it('should handle API errors', async () => {
  //     const errorMessage = 'API error: 400 Invalid timeframe';
  //     const params: GetOHLCVParams = {
  //       pool_name: 'SUI_USDC',
  //       timeframe: '1h',
  //     };

  //     mockHttpRequest.mockRejectedValue(new Error(errorMessage));

  //     await expect(client.getOHLCV(params)).rejects.toThrow(errorMessage);
  //   });
  // });

  // describe('Network configuration', () => {
  //   it('should use correct base URL for mainnet', async () => {
  //     mockGetApiBaseUrl.mockReturnValue(mainnetBaseUrl);
  //     const client = new DeepbookClient(validApiKey, SurfluxNetwork.MAINNET);

  //     mockHttpRequest.mockResolvedValue([]);

  //     await client.getPools();

  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${mainnetBaseUrl}/deepbook/get_pools`,
  //       expect.any(Object)
  //     );
  //   });

  //   it('should use correct base URL for testnet', async () => {
  //     const client = new DeepbookClient(validApiKey, SurfluxNetwork.TESTNET);

  //     mockHttpRequest.mockResolvedValue([]);

  //     await client.getPools();

  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/get_pools`,
  //       expect.any(Object)
  //     );
  //   });

  //   it('should use custom URL when provided', async () => {
  //     mockGetApiBaseUrl.mockReturnValue(customBaseUrl);
  //     const client = new DeepbookClient(validApiKey, SurfluxNetwork.CUSTOM, customBaseUrl);

  //     mockHttpRequest.mockResolvedValue([]);

  //     await client.getPools();

  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${customBaseUrl}/deepbook/get_pools`,
  //       expect.any(Object)
  //     );
  //   });
  // });

  // describe('Error handling', () => {
  //   let client: DeepbookClient;

  //   beforeEach(() => {
  //     client = new DeepbookClient(validApiKey, SurfluxNetwork.TESTNET);
  //   });

  //   it('should propagate network errors', async () => {
  //     const networkError = new Error('Network error: ECONNREFUSED');
  //     mockHttpRequest.mockRejectedValue(networkError);

  //     await expect(client.getPools()).rejects.toThrow('Network error: ECONNREFUSED');
  //   });

  //   it('should propagate API errors with status codes', async () => {
  //     const apiError = new Error('API error: 500 Internal Server Error');
  //     mockHttpRequest.mockRejectedValue(apiError);

  //     await expect(client.getPools()).rejects.toThrow('API error: 500 Internal Server Error');
  //   });

  //   it('should handle timeout errors', async () => {
  //     const timeoutError = new Error('Request timeout');
  //     mockHttpRequest.mockRejectedValue(timeoutError);

  //     await expect(client.getTrades({ pool_name: 'SUI_USDC' })).rejects.toThrow(
  //       'Request timeout'
  //     );
  //   });
  // });

  describe('Input Validation', () => {
    // let client: SurfluxDeepbookClient;

    // beforeEach(() => {
    //   client = new SurfluxDeepbookClient({ apiKey: validApiKey, network: SurfluxNetwork.TESTNET });
    // });

    // describe('Pool name validation', () => {
    //   it('should pass for valid pool names', async () => {
    //     mockHttpRequest.mockResolvedValue([]);

    //     await expect(client.getTrades({ pool_name: 'SUI_USDC' })).resolves.toBeDefined();
    //     await expect(client.getTrades({ pool_name: 'SUI-USDT' })).resolves.toBeDefined();
    //     await expect(client.getTrades({ pool_name: 'ETH-SUI' })).resolves.toBeDefined();
    //     await expect(client.getTrades({ pool_name: 'POOL_NAME_WITH_UNDERSCORES' })).resolves.toBeDefined();
    //   });

    //   it('should throw error for undefined pool name', async () => {
    //     await expect(
    //       client.getTrades({ pool_name: undefined as unknown as string })
    //     ).rejects.toThrow('Pool name is required and must be a non-empty string.');
    //   });

    //   it('should throw error for empty string', async () => {
    //     await expect(client.getTrades({ pool_name: '' })).rejects.toThrow(
    //       'Pool name is required and must be a non-empty string.'
    //     );
    //   });

    //   it('should throw error for whitespace-only string', async () => {
    //     await expect(client.getTrades({ pool_name: '   ' })).rejects.toThrow(
    //       'Pool name cannot be empty.'
    //     );
    //   });

    //   it('should throw error for pool name without hyphen or underscore', async () => {
    //     await expect(client.getTrades({ pool_name: 'SUIUSDC' })).rejects.toThrow(
    //       'Invalid pool name format: "SUIUSDC". Pool name should contain at least one hyphen or underscore (e.g., \'SUI_USDC\' or \'POOL_NAME\').'
    //     );
    //   });

    //   it('should throw error for invalid characters', async () => {
    //     await expect(client.getTrades({ pool_name: 'SUI_USDC!' })).rejects.toThrow(
    //       'Invalid pool name format: "SUI_USDC!". Pool name can only contain alphanumeric characters, hyphens, and underscores.'
    //     );
    //     await expect(client.getTrades({ pool_name: 'SUI_USDC@' })).rejects.toThrow();
    //     await expect(client.getTrades({ pool_name: 'SUI_USDC#' })).rejects.toThrow();
    //   });

    //   it('should throw error for non-string types', async () => {
    //     await expect(
    //       client.getTrades({ pool_name: null as unknown as string })
    //     ).rejects.toThrow('Pool name is required and must be a non-empty string.');
    //     await expect(client.getTrades({ pool_name: 123 as unknown as string })).rejects.toThrow();
    //   });
    // });

    // describe('Timeframe validation', () => {
    //   it('should pass for valid timeframes', async () => {
    //     mockHttpRequest.mockResolvedValue([]);

    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: '1m' })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: '5m' })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: '15m' })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: '1h' })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: '4h' })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: '1d' })
    //     ).resolves.toBeDefined();
    //   });

    //   it('should throw error for undefined timeframe', async () => {
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: undefined as unknown as '1m' })
    //     ).rejects.toThrow('Timeframe is required. Valid values: 1m, 5m, 15m, 1h, 4h, 1d.');
    //   });

    //   it('should throw error for invalid timeframe', async () => {
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: '2h' as '1m' })
    //     ).rejects.toThrow('Invalid timeframe: "2h". Valid values: 1m, 5m, 15m, 1h, 4h, 1d.');
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: '1w' as '1m' })
    //     ).rejects.toThrow();
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: 'invalid' as '1m' })
    //     ).rejects.toThrow();
    //   });

    //   it('should throw error for non-string types', async () => {
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: null as unknown as '1m' })
    //     ).rejects.toThrow();
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: 123 as unknown as '1m' })
    //     ).rejects.toThrow();
    //   });
    // });

    // describe('Timestamp range validation', () => {
    //   it('should pass for valid timestamp ranges', async () => {
    //     mockHttpRequest.mockResolvedValue([]);

    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', from: 1699999999, to: 1700000000 })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', from: 1000, to: 2000 })
    //     ).resolves.toBeDefined();
    //   });

    //   it('should pass when from is undefined', async () => {
    //     mockHttpRequest.mockResolvedValue([]);

    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', from: undefined, to: 1700000000 })
    //     ).resolves.toBeDefined();
    //   });

    //   it('should pass when to is undefined', async () => {
    //     mockHttpRequest.mockResolvedValue([]);

    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', from: 1699999999, to: undefined })
    //     ).resolves.toBeDefined();
    //   });

    //   it('should pass when both are undefined', async () => {
    //     mockHttpRequest.mockResolvedValue([]);

    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', from: undefined, to: undefined })
    //     ).resolves.toBeDefined();
    //   });

    //   it('should throw error when from >= to', async () => {
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', from: 1700000000, to: 1699999999 })
    //     ).rejects.toThrow(
    //       'Invalid timestamp range: "from" (1700000000) must be less than "to" (1699999999).'
    //     );
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', from: 1700000000, to: 1700000000 })
    //     ).rejects.toThrow(
    //       'Invalid timestamp range: "from" (1700000000) must be less than "to" (1700000000).'
    //     );
    //   });

    //   it('should throw error for negative timestamps', async () => {
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', from: -1, to: 1700000000 })
    //     ).rejects.toThrow('Timestamps must be positive numbers.');
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', from: 1699999999, to: -1 })
    //     ).rejects.toThrow('Timestamps must be positive numbers.');
    //   });

    //   it('should throw error for non-number types', async () => {
    //     await expect(
    //       client.getTrades({
    //         pool_name: 'SUI_USDC',
    //         from: 'invalid' as unknown as number,
    //         to: 1700000000,
    //       })
    //     ).rejects.toThrow('Timestamps must be numbers (Unix timestamp in seconds).');
    //     await expect(
    //       client.getTrades({
    //         pool_name: 'SUI_USDC',
    //         from: 1699999999,
    //         to: 'invalid' as unknown as number,
    //       })
    //     ).rejects.toThrow();
    //   });

    //   it('should throw error for timestamps too far in the future', async () => {
    //     const futureTimestamp = Math.floor(Date.now() / 1000) + 86401; // 24 hours + 1 second
    //     await expect(
    //       client.getTrades({
    //         pool_name: 'SUI_USDC',
    //         from: futureTimestamp,
    //         to: futureTimestamp + 1000,
    //       })
    //     ).rejects.toThrow('Timestamps cannot be more than 24 hours in the future.');
    //   });
    // });

    // describe('Limit validation', () => {
    //   it('should pass for valid limits', async () => {
    //     mockHttpRequest.mockResolvedValue([]);

    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: 1 })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: 100 })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: 1000 })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: undefined })
    //     ).resolves.toBeDefined();
    //   });

    //   it('should throw error for limit below minimum', async () => {
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: 0 })
    //     ).rejects.toThrow('Limit must be at least 1, got: 0.');
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: -1 })
    //     ).rejects.toThrow('Limit must be at least 1, got: -1.');
    //   });

    //   it('should throw error for limit above maximum', async () => {
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: 1001 })
    //     ).rejects.toThrow('Limit cannot exceed 1000, got: 1001.');
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: 2000 })
    //     ).rejects.toThrow('Limit cannot exceed 1000, got: 2000.');
    //   });

    //   it('should throw error for non-integer limits', async () => {
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: 1.5 })
    //     ).rejects.toThrow('Limit must be an integer, got: 1.5.');
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: 100.99 })
    //     ).rejects.toThrow('Limit must be an integer, got: 100.99.');
    //   });

    //   it('should throw error for non-number types', async () => {
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: '100' as unknown as number })
    //     ).rejects.toThrow('Limit must be a number, got: string.');
    //     await expect(
    //       client.getTrades({ pool_name: 'SUI_USDC', limit: null as unknown as number })
    //     ).rejects.toThrow();
    //   });

    //   it('should validate limit in getOrderBookDepth', async () => {
    //     await expect(
    //       client.getOrderBookDepth({ pool_name: 'SUI_USDC', limit: 0 })
    //     ).rejects.toThrow('Limit must be at least 1, got: 0.');
    //     await expect(
    //       client.getOrderBookDepth({ pool_name: 'SUI_USDC', limit: 1001 })
    //     ).rejects.toThrow('Limit cannot exceed 1000, got: 1001.');
    //   });

    //   it('should validate limit in getOHLCV', async () => {
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: '1h', limit: 0 })
    //     ).rejects.toThrow('Limit must be at least 1, got: 0.');
    //     await expect(
    //       client.getOHLCV({ pool_name: 'SUI_USDC', timeframe: '1h', limit: 1001 })
    //     ).rejects.toThrow('Limit cannot exceed 1000, got: 1001.');
    //   });
    // });
  });
});

