import { SurfluxDeepbookClient } from '../../../src/clients/deepbook';
import { SurfluxNetwork } from '../../../src/types';
import { httpRequest } from '../../../src/utils/http';
import { getApiBaseUrl } from '../../../src/constants';
import type {
  PoolInfo,
  Trade,
  OrderBookDepth,
  OHLCVCandle,
  GetTradesParams,
  GetOrderBookParams,
  GetOHLCVParams,
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
  //         pool_name: 'SUI-USDC',
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
  //       pool_name: 'SUI-USDC',
  //       from: 1699999999,
  //       to: 1700000000,
  //       limit: 100,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockTrades);

  //     const result = await client.getTrades(params);

  //     expect(result).toEqual(mockTrades);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI-USDC/trades`,
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
  //       pool_name: 'SUI-USDC',
  //     };

  //     mockHttpRequest.mockResolvedValue(mockTrades);

  //     const result = await client.getTrades(params);

  //     expect(result).toEqual(mockTrades);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI-USDC/trades`,
  //       {
  //         apiKey: validApiKey,
  //         params: {},
  //       }
  //     );
  //   });

  //   it('should filter out undefined parameters', async () => {
  //     const mockTrades: Trade[] = [];
  //     const params: GetTradesParams = {
  //       pool_name: 'SUI-USDC',
  //       from: undefined,
  //       to: undefined,
  //       limit: undefined,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockTrades);

  //     await client.getTrades(params);

  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI-USDC/trades`,
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
  //       pool_name: 'SUI-USDC',
  //       from: 1699999999,
  //       to: 1700000000,
  //     };

  //     mockHttpRequest.mockResolvedValue([]);

  //     const result = await client.getTrades(params);
  //     expect(result).toEqual([]);
  //   });
  // });

  // describe('getOrderBook', () => {
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

  //     const params: GetOrderBookParams = {
  //       pool_name: 'SUI-USDC',
  //       limit: 20,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockOrderBook);

  //     const result = await client.getOrderBook(params);

  //     expect(result).toEqual(mockOrderBook);
  //     expect(result.bids).toHaveLength(2);
  //     expect(result.asks).toHaveLength(2);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI-USDC/order-book-depth`,
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

  //     const params: GetOrderBookParams = {
  //       pool_name: 'SUI-USDC',
  //     };

  //     mockHttpRequest.mockResolvedValue(mockOrderBook);

  //     const result = await client.getOrderBook(params);

  //     expect(result).toEqual(mockOrderBook);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI-USDC/order-book-depth`,
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

  //     const params: GetOrderBookParams = {
  //       pool_name: 'SUI-USDC',
  //     };

  //     mockHttpRequest.mockResolvedValue(mockOrderBook);

  //     const result = await client.getOrderBook(params);
  //     expect(result.bids).toEqual([]);
  //     expect(result.asks).toEqual([]);
  //   });

  //   it('should handle API errors', async () => {
  //     const errorMessage = 'API error: 404 Pool not found';
  //     const params: GetOrderBookParams = {
  //       pool_name: 'INVALID-POOL',
  //     };

  //     mockHttpRequest.mockRejectedValue(new Error(errorMessage));

  //     await expect(client.getOrderBook(params)).rejects.toThrow(errorMessage);
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
  //         pool_name: 'SUI-USDC',
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
  //         `${testBaseUrl}/deepbook/SUI-USDC/ohlcv/${timeframe}`,
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
  //       pool_name: 'SUI-USDC',
  //       timeframe: '1h',
  //     };

  //     mockHttpRequest.mockResolvedValue(mockCandles);

  //     const result = await client.getOHLCV(params);

  //     expect(result).toEqual(mockCandles);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI-USDC/ohlcv/1h`,
  //       {
  //         apiKey: validApiKey,
  //         params: {},
  //       }
  //     );
  //   });

  //   it('should filter out undefined parameters', async () => {
  //     const mockCandles: OHLCVCandle[] = [];
  //     const params: GetOHLCVParams = {
  //       pool_name: 'SUI-USDC',
  //       timeframe: '1h',
  //       from: undefined,
  //       to: undefined,
  //       limit: undefined,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockCandles);

  //     await client.getOHLCV(params);

  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/deepbook/SUI-USDC/ohlcv/1h`,
  //       {
  //         apiKey: validApiKey,
  //         params: {},
  //       }
  //     );
  //   });

  //   it('should handle empty candles array', async () => {
  //     const params: GetOHLCVParams = {
  //       pool_name: 'SUI-USDC',
  //       timeframe: '1h',
  //     };

  //     mockHttpRequest.mockResolvedValue([]);

  //     const result = await client.getOHLCV(params);
  //     expect(result).toEqual([]);
  //   });

  //   it('should handle API errors', async () => {
  //     const errorMessage = 'API error: 400 Invalid timeframe';
  //     const params: GetOHLCVParams = {
  //       pool_name: 'SUI-USDC',
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

  //     await expect(client.getTrades({ pool_name: 'SUI-USDC' })).rejects.toThrow(
  //       'Request timeout'
  //     );
  //   });
  // });
});

