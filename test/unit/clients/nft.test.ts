import { SurfluxNFTClient } from '../../../src/clients/nft';
import { SurfluxNetwork } from '../../../src/types';
import { httpRequest } from '../../../src/utils/http';
import { getApiBaseUrl } from '../../../src/constants';
import type {
  NFTToken,
  PaginatedNFTs,
  PaginatedCollectionHolders,
  GetNFTByIdParams,
  GetNFTsByOwnerParams,
  GetNFTsByCollectionParams,
  GetCollectionHoldersParams,
  SurfluxClientConfig,
} from '../../../src/types';

// Mock dependencies
jest.mock('../../../src/utils/http');
jest.mock('../../../src/constants');

const mockHttpRequest = httpRequest as jest.MockedFunction<typeof httpRequest>;
const mockGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<typeof getApiBaseUrl>;

describe('SurfluxNFTClient', () => {
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
      const client = new SurfluxNFTClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });

      expect(client).toBeInstanceOf(SurfluxNFTClient);
      expect(mockGetApiBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.TESTNET, undefined);
    });

    it('should create instance with valid API key and mainnet network', () => {
      mockGetApiBaseUrl.mockReturnValue(mainnetBaseUrl);

      const client = new SurfluxNFTClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.MAINNET,
      });

      expect(client).toBeInstanceOf(SurfluxNFTClient);
      expect(mockGetApiBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.MAINNET, undefined);
    });

    it('should create instance with custom URL when network is CUSTOM', () => {
      mockGetApiBaseUrl.mockReturnValue(customBaseUrl);

      const client = new SurfluxNFTClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.CUSTOM,
        customUrl: customBaseUrl,
      });

      expect(client).toBeInstanceOf(SurfluxNFTClient);
      expect(mockGetApiBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.CUSTOM, customBaseUrl);
    });

    it('should throw an error when config is invalid', () => {
      expect(() => {
        new SurfluxNFTClient(undefined as unknown as SurfluxClientConfig);
      }).toThrow('Config is required');

      expect(() => {
        new SurfluxNFTClient({ apiKey: validApiKey, network: 'invalid' as SurfluxNetwork });
      }).toThrow('Network is required. Please provide a valid network.');

      expect(() => {
        new SurfluxNFTClient({
          apiKey: validApiKey,
          network: undefined as unknown as SurfluxNetwork,
        });
      }).toThrow('Network is required. Please provide a valid network.');

      expect(() => {
        new SurfluxNFTClient({
          apiKey: undefined as unknown as string,
          network: SurfluxNetwork.TESTNET,
        });
      }).toThrow('Surflux API key is required. Please provide a valid API key.');

      expect(() => {
        new SurfluxNFTClient({ apiKey: '', network: SurfluxNetwork.TESTNET });
      }).toThrow('Surflux API key is required. Please provide a valid API key.');

      expect(() => {
        new SurfluxNFTClient({
          apiKey: null as unknown as string,
          network: SurfluxNetwork.TESTNET,
        });
      }).toThrow('Surflux API key is required. Please provide a valid API key.');

      expect(() => {
        new SurfluxNFTClient({
          apiKey: validApiKey,
          network: SurfluxNetwork.CUSTOM,
        });
      }).toThrow('Custom URL is required for custom network');
    });
  });

  // describe('getNFTById', () => {
  //   let client: SurfluxNFTClient;

  //   beforeEach(() => {
  //     client = new SurfluxNFTClient({
  //       apiKey: validApiKey,
  //       network: SurfluxNetwork.TESTNET,
  //     });
  //   });

  //   it('should return NFT token data', async () => {
  //     const mockNFT: NFTToken = {
  //       object_id: '0x123',
  //       object_type: '0x456::module::NFT',
  //       owner_dynamic_field_object_id: '0x789',
  //       kiosk_object_id: '0xabc',
  //       owner: '0xdef',
  //       checkpoint_id: 12345,
  //       decoded_fields: { name: 'Test NFT', description: 'A test NFT' },
  //       decoded_display: { name: 'Test NFT' },
  //       updated_at: '2024-01-01T00:00:00Z',
  //       created_at: '2024-01-01T00:00:00Z',
  //     };

  //     mockHttpRequest.mockResolvedValue(mockNFT);

  //     const result = await client.getNFTById({ object_id: '0x123' });

  //     expect(result).toEqual(mockNFT);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/nfts/0x123`, {
  //       apiKey: validApiKey,
  //     });
  //   });

  //   it('should handle API errors', async () => {
  //     const errorMessage = 'API error: 404 Not Found';
  //     mockHttpRequest.mockRejectedValue(new Error(errorMessage));

  //     await expect(client.getNFTById({ object_id: '0xinvalid' })).rejects.toThrow(
  //       errorMessage
  //     );
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //   });

  //   it('should handle network errors', async () => {
  //     const networkError = new Error('Network error: ECONNREFUSED');
  //     mockHttpRequest.mockRejectedValue(networkError);

  //     await expect(client.getNFTById({ object_id: '0x123' })).rejects.toThrow(
  //       'Network error: ECONNREFUSED'
  //     );
  //   });
  // });

  // describe('getNFTsByOwner', () => {
  //   let client: SurfluxNFTClient;

  //   beforeEach(() => {
  //     client = new SurfluxNFTClient({
  //       apiKey: validApiKey,
  //       network: SurfluxNetwork.TESTNET,
  //     });
  //   });

  //   it('should return NFTs for owner with all parameters', async () => {
  //     const mockResponse: PaginatedNFTs = {
  //       items: [
  //         {
  //           object_id: '0x123',
  //           object_type: '0x456::module::NFT',
  //           owner_dynamic_field_object_id: '0x789',
  //           kiosk_object_id: '0xabc',
  //           owner: '0xdef',
  //           checkpoint_id: 12345,
  //           decoded_fields: {},
  //           decoded_display: {},
  //           updated_at: '2024-01-01T00:00:00Z',
  //           created_at: '2024-01-01T00:00:00Z',
  //         },
  //       ],
  //       isLastPage: false,
  //       currentPage: 1,
  //       perPage: 20,
  //     };

  //     const params: GetNFTsByOwnerParams = {
  //       address: '0xdef',
  //       collections: ['0x456::module::NFT'],
  //       page: 1,
  //       per_page: 20,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     const result = await client.getNFTsByOwner(params);

  //     expect(result).toEqual(mockResponse);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/nfts/address/0xdef`, {
  //       apiKey: validApiKey,
  //       params: {
  //         collections: ['0x456::module::NFT'],
  //         page: 1,
  //         perPage: 20,
  //       },
  //     });
  //   });

  //   it('should return NFTs for owner with only address', async () => {
  //     const mockResponse: PaginatedNFTs = {
  //       items: [],
  //       isLastPage: true,
  //       currentPage: 1,
  //       perPage: 10,
  //     };

  //     const params: GetNFTsByOwnerParams = {
  //       address: '0xdef',
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     const result = await client.getNFTsByOwner(params);

  //     expect(result).toEqual(mockResponse);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/nfts/address/0xdef`, {
  //       apiKey: validApiKey,
  //       params: {},
  //     });
  //   });

  //   it('should filter out empty collections array', async () => {
  //     const mockResponse: PaginatedNFTs = {
  //       items: [],
  //       isLastPage: true,
  //       currentPage: 1,
  //       perPage: 10,
  //     };

  //     const params: GetNFTsByOwnerParams = {
  //       address: '0xdef',
  //       collections: [],
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     await client.getNFTsByOwner(params);

  //     expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/nfts/address/0xdef`, {
  //       apiKey: validApiKey,
  //       params: {},
  //     });
  //   });

  //   it('should handle pagination parameters', async () => {
  //     const mockResponse: PaginatedNFTs = {
  //       items: [],
  //       isLastPage: false,
  //       currentPage: 2,
  //       perPage: 50,
  //     };

  //     const params: GetNFTsByOwnerParams = {
  //       address: '0xdef',
  //       page: 2,
  //       per_page: 50,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     const result = await client.getNFTsByOwner(params);

  //     expect(result.currentPage).toBe(2);
  //     expect(result.perPage).toBe(50);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/nfts/address/0xdef`, {
  //       apiKey: validApiKey,
  //       params: {
  //         page: 2,
  //         perPage: 50,
  //       },
  //     });
  //   });

  //   it('should handle API errors', async () => {
  //     const errorMessage = 'API error: 400 Bad Request';
  //     const params: GetNFTsByOwnerParams = {
  //       address: 'invalid-address',
  //     };

  //     mockHttpRequest.mockRejectedValue(new Error(errorMessage));

  //     await expect(client.getNFTsByOwner(params)).rejects.toThrow(errorMessage);
  //   });
  // });

  // describe('getNFTsByCollection', () => {
  //   let client: SurfluxNFTClient;

  //   beforeEach(() => {
  //     client = new SurfluxNFTClient({
  //       apiKey: validApiKey,
  //       network: SurfluxNetwork.TESTNET,
  //     });
  //   });

  //   it('should return NFTs for collection with all parameters', async () => {
  //     const mockResponse: PaginatedNFTs = {
  //       items: [
  //         {
  //           object_id: '0x123',
  //           object_type: '0x456::module::NFT',
  //           owner_dynamic_field_object_id: '0x789',
  //           kiosk_object_id: '0xabc',
  //           owner: '0xdef',
  //           checkpoint_id: 12345,
  //           decoded_fields: {},
  //           decoded_display: {},
  //           updated_at: '2024-01-01T00:00:00Z',
  //           created_at: '2024-01-01T00:00:00Z',
  //         },
  //       ],
  //       isLastPage: false,
  //       currentPage: 1,
  //       perPage: 10,
  //     };

  //     const collectionType = '0x456::module::NFT';
  //     const params: GetNFTsByCollectionParams = {
  //       type: collectionType,
  //       fields: { rarity: 'legendary' },
  //       page: 1,
  //       per_page: 10,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     const result = await client.getNFTsByCollection(params);

  //     expect(result).toEqual(mockResponse);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/nfts/collection/${encodeURIComponent(collectionType)}`,
  //       {
  //         apiKey: validApiKey,
  //         params: {
  //           fields: { rarity: 'legendary' },
  //           page: 1,
  //           perPage: 10,
  //         },
  //       }
  //     );
  //   });

  //   it('should return NFTs for collection with only type', async () => {
  //     const mockResponse: PaginatedNFTs = {
  //       items: [],
  //       isLastPage: true,
  //       currentPage: 1,
  //       perPage: 10,
  //     };

  //     const collectionType = '0x456::module::NFT';
  //     const params: GetNFTsByCollectionParams = {
  //       type: collectionType,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     const result = await client.getNFTsByCollection(params);

  //     expect(result).toEqual(mockResponse);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/nfts/collection/${encodeURIComponent(collectionType)}`,
  //       {
  //         apiKey: validApiKey,
  //         params: {},
  //       }
  //     );
  //   });

  //   it('should encode collection type in URL', async () => {
  //     const mockResponse: PaginatedNFTs = {
  //       items: [],
  //       isLastPage: true,
  //       currentPage: 1,
  //       perPage: 10,
  //     };

  //     const collectionType = '0x123::module::MyNFT';
  //     const params: GetNFTsByCollectionParams = {
  //       type: collectionType,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     await client.getNFTsByCollection(params);

  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/nfts/collection/${encodeURIComponent(collectionType)}`,
  //       expect.any(Object)
  //     );
  //   });

  //   it('should handle fields parameter', async () => {
  //     const mockResponse: PaginatedNFTs = {
  //       items: [],
  //       isLastPage: true,
  //       currentPage: 1,
  //       perPage: 10,
  //     };

  //     const params: GetNFTsByCollectionParams = {
  //       type: '0x456::module::NFT',
  //       fields: {
  //         rarity: 'legendary',
  //         level: 10,
  //       },
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     await client.getNFTsByCollection(params);

  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       expect.any(String),
  //       expect.objectContaining({
  //         params: expect.objectContaining({
  //           fields: {
  //             rarity: 'legendary',
  //             level: 10,
  //           },
  //         }),
  //       })
  //     );
  //   });

  //   it('should handle API errors', async () => {
  //     const errorMessage = 'API error: 404 Collection not found';
  //     const params: GetNFTsByCollectionParams = {
  //       type: '0xinvalid::module::NFT',
  //     };

  //     mockHttpRequest.mockRejectedValue(new Error(errorMessage));

  //     await expect(client.getNFTsByCollection(params)).rejects.toThrow(errorMessage);
  //   });
  // });

  // describe('getCollectionHolders', () => {
  //   let client: SurfluxNFTClient;

  //   beforeEach(() => {
  //     client = new SurfluxNFTClient({
  //       apiKey: validApiKey,
  //       network: SurfluxNetwork.TESTNET,
  //     });
  //   });

  //   it('should return collection holders with all parameters', async () => {
  //     const mockResponse: PaginatedCollectionHolders = {
  //       holders: [
  //         { address: '0xdef', count: 5 },
  //         { address: '0xghi', count: 3 },
  //       ],
  //       total: 2,
  //       page: 1,
  //       per_page: 50,
  //     };

  //     const collectionType = '0x456::module::NFT';
  //     const params: GetCollectionHoldersParams = {
  //       type: collectionType,
  //       page: 1,
  //       per_page: 50,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     const result = await client.getCollectionHolders(params);

  //     expect(result).toEqual(mockResponse);
  //     expect(mockHttpRequest).toHaveBeenCalledTimes(1);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/nfts/collection/${encodeURIComponent(collectionType)}/holders`,
  //       {
  //         apiKey: validApiKey,
  //         params: {
  //           page: 1,
  //           perPage: 50,
  //         },
  //       }
  //     );
  //   });

  //   it('should return collection holders with only type', async () => {
  //     const mockResponse: PaginatedCollectionHolders = {
  //       holders: [],
  //       total: 0,
  //       page: 1,
  //       per_page: 10,
  //     };

  //     const collectionType = '0x456::module::NFT';
  //     const params: GetCollectionHoldersParams = {
  //       type: collectionType,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     const result = await client.getCollectionHolders(params);

  //     expect(result).toEqual(mockResponse);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/nfts/collection/${encodeURIComponent(collectionType)}/holders`,
  //       {
  //         apiKey: validApiKey,
  //         params: {},
  //       }
  //     );
  //   });

  //   it('should encode collection type in URL', async () => {
  //     const mockResponse: PaginatedCollectionHolders = {
  //       holders: [],
  //       total: 0,
  //       page: 1,
  //       per_page: 10,
  //     };

  //     const collectionType = '0x123::module::MyNFT';
  //     const params: GetCollectionHoldersParams = {
  //       type: collectionType,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     await client.getCollectionHolders(params);

  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       `${testBaseUrl}/nfts/collection/${encodeURIComponent(collectionType)}/holders`,
  //       expect.any(Object)
  //     );
  //   });

  //   it('should handle pagination parameters', async () => {
  //     const mockResponse: PaginatedCollectionHolders = {
  //       holders: [{ address: '0xdef', count: 5 }],
  //       total: 1,
  //       page: 2,
  //       per_page: 25,
  //     };

  //     const params: GetCollectionHoldersParams = {
  //       type: '0x456::module::NFT',
  //       page: 2,
  //       per_page: 25,
  //     };

  //     mockHttpRequest.mockResolvedValue(mockResponse);

  //     const result = await client.getCollectionHolders(params);

  //     expect(result.page).toBe(2);
  //     expect(result.per_page).toBe(25);
  //     expect(mockHttpRequest).toHaveBeenCalledWith(
  //       expect.any(String),
  //       expect.objectContaining({
  //         params: {
  //           page: 2,
  //           perPage: 25,
  //         },
  //       })
  //     );
  //   });

  //   it('should handle API errors', async () => {
  //     const errorMessage = 'API error: 404 Collection not found';
  //     const params: GetCollectionHoldersParams = {
  //       type: '0xinvalid::module::NFT',
  //     };

  //     mockHttpRequest.mockRejectedValue(new Error(errorMessage));

  //     await expect(client.getCollectionHolders(params)).rejects.toThrow(errorMessage);
  //   });
  // });

  describe('Input Validation', () => {
    // let client: SurfluxNFTClient;

    // beforeEach(() => {
    //   client = new SurfluxNFTClient({
    //     apiKey: validApiKey,
    //     network: SurfluxNetwork.TESTNET,
    //   });
    // });

    // describe('Object ID validation', () => {
    //   it('should pass for valid object IDs', async () => {
    //     mockHttpRequest.mockResolvedValue({
    //       object_id: '0x123',
    //       object_type: '0x456::module::NFT',
    //       owner_dynamic_field_object_id: '0x789',
    //       kiosk_object_id: '0xabc',
    //       owner: '0xdef',
    //       checkpoint_id: 12345,
    //       decoded_fields: {},
    //       decoded_display: {},
    //       updated_at: '2024-01-01T00:00:00Z',
    //       created_at: '2024-01-01T00:00:00Z',
    //     });

    //     await expect(client.getNFTById({ object_id: '0x123' })).resolves.toBeDefined();
    //     await expect(client.getNFTById({ object_id: '0xabcdef123456' })).resolves.toBeDefined();
    //     await expect(client.getNFTById({ object_id: '0xABCDEF123456' })).resolves.toBeDefined();
    //   });

    //   it('should throw error for undefined object ID', async () => {
    //     await expect(
    //       client.getNFTById({ object_id: undefined as unknown as string })
    //     ).rejects.toThrow('Object ID is required and must be a non-empty string.');
    //   });

    //   it('should throw error for empty string', async () => {
    //     await expect(client.getNFTById({ object_id: '' })).rejects.toThrow(
    //       'Object ID is required and must be a non-empty string.'
    //     );
    //   });

    //   it('should throw error for whitespace-only string', async () => {
    //     await expect(client.getNFTById({ object_id: '   ' })).rejects.toThrow(
    //       'Object ID cannot be empty.'
    //     );
    //   });

    //   it('should throw error for object ID without 0x prefix', async () => {
    //     await expect(client.getNFTById({ object_id: '123' })).rejects.toThrow(
    //       'Invalid object ID format: "123". Object ID must start with "0x".'
    //     );
    //   });

    //   it('should throw error for object ID with only 0x', async () => {
    //     await expect(client.getNFTById({ object_id: '0x' })).rejects.toThrow(
    //       'Invalid object ID format: "0x". Object ID must contain hex characters after "0x".'
    //     );
    //   });

    //   it('should throw error for invalid hex characters', async () => {
    //     await expect(client.getNFTById({ object_id: '0x123g' })).rejects.toThrow(
    //       'Invalid object ID format: "0x123g". Object ID can only contain hexadecimal characters (0-9, a-f, A-F).'
    //     );
    //     await expect(client.getNFTById({ object_id: '0x123@' })).rejects.toThrow();
    //   });

    //   it('should throw error for non-string types', async () => {
    //     await expect(
    //       client.getNFTById({ object_id: null as unknown as string })
    //     ).rejects.toThrow('Object ID is required and must be a non-empty string.');
    //     await expect(client.getNFTById({ object_id: 123 as unknown as string })).rejects.toThrow();
    //   });
    // });

    // describe('Address validation', () => {
    //   it('should pass for valid addresses', async () => {
    //     mockHttpRequest.mockResolvedValue({
    //       items: [],
    //       isLastPage: true,
    //       currentPage: 1,
    //       perPage: 10,
    //     });

    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123' })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getNFTsByOwner({ address: '0xabcdef123456' })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getNFTsByOwner({ address: '0xABCDEF123456' })
    //     ).resolves.toBeDefined();
    //   });

    //   it('should throw error for undefined address', async () => {
    //     await expect(
    //       client.getNFTsByOwner({ address: undefined as unknown as string })
    //     ).rejects.toThrow('Address is required and must be a non-empty string.');
    //   });

    //   it('should throw error for empty string', async () => {
    //     await expect(client.getNFTsByOwner({ address: '' })).rejects.toThrow(
    //       'Address is required and must be a non-empty string.'
    //     );
    //   });

    //   it('should throw error for address without 0x prefix', async () => {
    //     await expect(client.getNFTsByOwner({ address: '123' })).rejects.toThrow(
    //       'Invalid address format: "123". Address must start with "0x".'
    //     );
    //   });

    //   it('should throw error for invalid hex characters', async () => {
    //     await expect(client.getNFTsByOwner({ address: '0x123g' })).rejects.toThrow(
    //       'Invalid address format: "0x123g". Address can only contain hexadecimal characters (0-9, a-f, A-F).'
    //     );
    //   });
    // });

    // describe('Type validation', () => {
    //   it('should pass for valid types', async () => {
    //     mockHttpRequest.mockResolvedValue({
    //       items: [],
    //       isLastPage: true,
    //       currentPage: 1,
    //       perPage: 10,
    //     });

    //     await expect(
    //       client.getNFTsByCollection({ type: '0x123::module::NFT' })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getNFTsByCollection({ type: '0xabcdef::my_module::MyNFT' })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getNFTsByCollection({ type: '0x123::module_name::TypeName' })
    //     ).resolves.toBeDefined();
    //   });

    //   it('should throw error for undefined type', async () => {
    //     await expect(
    //       client.getNFTsByCollection({ type: undefined as unknown as string })
    //     ).rejects.toThrow('Type is required and must be a non-empty string.');
    //   });

    //   it('should throw error for empty string', async () => {
    //     await expect(client.getNFTsByCollection({ type: '' })).rejects.toThrow(
    //       'Type is required and must be a non-empty string.'
    //     );
    //   });

    //   it('should throw error for type without :: separators', async () => {
    //     await expect(client.getNFTsByCollection({ type: '0x123' })).rejects.toThrow(
    //       'Invalid type format: "0x123". Type must follow the pattern "address::module::Type" (e.g., "0x123::module::NFT").'
    //     );
    //   });

    //   it('should throw error for type with wrong number of parts', async () => {
    //     await expect(
    //       client.getNFTsByCollection({ type: '0x123::module' })
    //     ).rejects.toThrow(
    //       'Invalid type format: "0x123::module". Type must follow the pattern "address::module::Type" (e.g., "0x123::module::NFT").'
    //     );
    //     await expect(
    //       client.getNFTsByCollection({ type: '0x123::module::Type::Extra' })
    //     ).rejects.toThrow();
    //   });

    //   it('should throw error for invalid address part', async () => {
    //     await expect(
    //       client.getNFTsByCollection({ type: '123::module::NFT' })
    //     ).rejects.toThrow('Invalid type format: "123::module::NFT". Address part must start with "0x".');
    //     await expect(
    //       client.getNFTsByCollection({ type: '0x::module::NFT' })
    //     ).rejects.toThrow();
    //     await expect(
    //       client.getNFTsByCollection({ type: '0xg::module::NFT' })
    //     ).rejects.toThrow();
    //   });

    //   it('should throw error for invalid module name', async () => {
    //     await expect(
    //       client.getNFTsByCollection({ type: '0x123::123module::NFT' })
    //     ).rejects.toThrow(
    //       'Invalid type format: "0x123::123module::NFT". Module name must start with a letter and contain only alphanumeric characters and underscores.'
    //     );
    //     await expect(
    //       client.getNFTsByCollection({ type: '0x123::module-name::NFT' })
    //     ).rejects.toThrow();
    //   });

    //   it('should throw error for invalid type name', async () => {
    //     await expect(
    //       client.getNFTsByCollection({ type: '0x123::module::nft' })
    //     ).rejects.toThrow(
    //       'Invalid type format: "0x123::module::nft". Type name must start with an uppercase letter and contain only alphanumeric characters and underscores.'
    //     );
    //     await expect(
    //       client.getNFTsByCollection({ type: '0x123::module::123NFT' })
    //     ).rejects.toThrow();
    //   });
    // });

    // describe('Page validation', () => {
    //   it('should pass for valid page numbers', async () => {
    //     mockHttpRequest.mockResolvedValue({
    //       items: [],
    //       isLastPage: true,
    //       currentPage: 1,
    //       perPage: 10,
    //     });

    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', page: 1 })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', page: 10 })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', page: undefined })
    //     ).resolves.toBeDefined();
    //   });

    //   it('should throw error for page below minimum', async () => {
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', page: 0 })
    //     ).rejects.toThrow('Page must be at least 1, got: 0.');
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', page: -1 })
    //     ).rejects.toThrow('Page must be at least 1, got: -1.');
    //   });

    //   it('should throw error for non-integer page', async () => {
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', page: 1.5 })
    //     ).rejects.toThrow('Page must be an integer, got: 1.5.');
    //   });

    //   it('should throw error for non-number page', async () => {
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', page: '1' as unknown as number })
    //     ).rejects.toThrow('Page must be a number, got: string.');
    //   });
    // });

    // describe('Per page validation', () => {
    //   it('should pass for valid per_page values', async () => {
    //     mockHttpRequest.mockResolvedValue({
    //       items: [],
    //       isLastPage: true,
    //       currentPage: 1,
    //       perPage: 10,
    //     });

    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', per_page: 1 })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', per_page: 100 })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', per_page: 1000 })
    //     ).resolves.toBeDefined();
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', per_page: undefined })
    //     ).resolves.toBeDefined();
    //   });

    //   it('should throw error for per_page below minimum', async () => {
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', per_page: 0 })
    //     ).rejects.toThrow('Per page must be at least 1, got: 0.');
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', per_page: -1 })
    //     ).rejects.toThrow('Per page must be at least 1, got: -1.');
    //   });

    //   it('should throw error for per_page above maximum', async () => {
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', per_page: 1001 })
    //     ).rejects.toThrow('Per page cannot exceed 1000, got: 1001.');
    //   });

    //   it('should throw error for non-integer per_page', async () => {
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', per_page: 10.5 })
    //     ).rejects.toThrow('Per page must be an integer, got: 10.5.');
    //   });

    //   it('should throw error for non-number per_page', async () => {
    //     await expect(
    //       client.getNFTsByOwner({ address: '0x123', per_page: '10' as unknown as number })
    //     ).rejects.toThrow('Per page must be a number, got: string.');
    //   });
    // });
  });
});
