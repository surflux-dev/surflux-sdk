import {
  NFTToken,
  NftsResponseDto,
  CollectionHoldersDto,
  GetNFTByIdParams,
  GetNFTsForOwnerParams,
  GetNFTsForCollectionParams,
  GetCollectionHoldersParams,
  SurfluxNetwork,
} from './types';
import { httpRequest } from './http-client';
import { isValidApiKey } from './utils';
import { getApiBaseUrl } from './constants';
import { buildQueryParams } from './query-utils';

/**
 * Client for interacting with the Surflux NFT API.
 * Provides methods to query NFT collections, tokens, and holders.
 */
export class NFTClient {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Creates a new NFTClient instance.
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
   * Internal method to make requests to the NFT API.
   *
   * @param endpoint - The API endpoint path
   * @param params - Optional query parameters
   * @returns A promise that resolves to the response data
   * @private
   */
  private async request<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}/nfts${endpoint}`;

    return httpRequest<T>(url, {
      apiKey: this.apiKey,
      params: params,
    });
  }

  /**
   * Retrieves a specific NFT by its object ID.
   *
   * @param params - Parameters for the request
   * @param params.object_id - The Sui object ID of the NFT
   * @returns A promise that resolves to the NFT token data
   *
   * @example
   * ```typescript
   * const nft = await client.getNFTById({ object_id: '0x123...' });
   * ```
   */
  async getNFTById(params: GetNFTByIdParams): Promise<NFTToken> {
    return this.request<NFTToken>(`/${params.object_id}`);
  }

  /**
   * Retrieves all NFTs owned by a specific address.
   *
   * @param params - Parameters for the request
   * @param params.address - The Sui address of the owner
   * @param params.collections - Optional array of collection types to filter by
   * @param params.page - Optional page number for pagination (default: 1)
   * @param params.per_page - Optional number of items per page (default: 10)
   * @returns A promise that resolves to a paginated response with NFT tokens
   *
   * @example
   * ```typescript
   * const nfts = await client.getNFTsForOwner({
   *   address: '0x123...',
   *   page: 1,
   *   per_page: 20
   * });
   * ```
   */
  async getNFTsForOwner(params: GetNFTsForOwnerParams): Promise<NftsResponseDto> {
    const { address, collections, page, per_page } = params;
    const queryParams = buildQueryParams({
      collections: collections && collections.length > 0 ? collections : undefined,
      page,
      perPage: per_page,
    });

    return this.request<NftsResponseDto>(`/address/${address}`, queryParams);
  }

  /**
   * Retrieves all NFTs in a specific collection.
   *
   * @param params - Parameters for the request
   * @param params.type - The collection type (e.g., '0x...::module::Type')
   * @param params.fields - Optional JSON object for filtering by field values
   * @param params.page - Optional page number for pagination (default: 1)
   * @param params.per_page - Optional number of items per page (default: 10)
   * @returns A promise that resolves to a paginated response with NFT tokens
   *
   * @example
   * ```typescript
   * const nfts = await client.getNFTsForCollection({
   *   type: '0x123::duck_nft::DuckNFT',
   *   page: 1,
   *   per_page: 2
   * });
   * ```
   */
  async getNFTsForCollection(params: GetNFTsForCollectionParams): Promise<NftsResponseDto> {
    const { type, fields, page, per_page } = params;
    const queryParams = buildQueryParams({
      fields,
      page,
      perPage: per_page,
    });

    const encodedType = encodeURIComponent(type);

    return this.request<NftsResponseDto>(`/collection/${encodedType}`, queryParams);
  }

  /**
   * Retrieves all holders of a specific NFT collection.
   *
   * @param params - Parameters for the request
   * @param params.type - The collection type (e.g., '0x...::module::Type')
   * @param params.page - Optional page number for pagination (default: 1)
   * @param params.per_page - Optional number of items per page (default: 10)
   * @returns A promise that resolves to a paginated response with collection holders
   *
   * @example
   * ```typescript
   * const holders = await client.getCollectionHolders({
   *   type: '0x123::duck_nft::DuckNFT',
   *   page: 1,
   *   per_page: 50
   * });
   * ```
   */
  async getCollectionHolders(params: GetCollectionHoldersParams): Promise<CollectionHoldersDto> {
    const { type, page, per_page } = params;
    const queryParams = buildQueryParams({
      page,
      perPage: per_page,
    });

    const encodedType = encodeURIComponent(type);

    return this.request<CollectionHoldersDto>(`/collection/${encodedType}/holders`, queryParams);
  }
}
