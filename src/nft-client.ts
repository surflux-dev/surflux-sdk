import {
  NFTToken,
  NftsResponseDto,
  CollectionHoldersDto,
  GetNFTByIdParams,
  GetNFTsForOwnerParams,
  GetNFTsForCollectionParams,
  GetCollectionHoldersParams,
} from './types';
import { httpRequest } from './http-client';

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
   * @param network - Network to use ('mainnet' or 'testnet')
   */
  constructor(apiKey: string, network: string) {
    this.apiKey = apiKey;
    this.baseUrl = network === 'mainnet' ? 'https://api.surflux.dev' : 'https://testnet-api.surflux.dev';
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
    const queryParams: Record<string, unknown> = {};
    if (collections && collections.length > 0) {
      queryParams.collections = collections;
    }
    if (page !== undefined) queryParams.page = page;
    if (per_page !== undefined) queryParams.perPage = per_page;

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
    const queryParams: Record<string, unknown> = {};
    if (fields) {
      queryParams.fields = fields;
    }
    if (page !== undefined) queryParams.page = page;
    if (per_page !== undefined) queryParams.perPage = per_page;

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
    const queryParams: Record<string, unknown> = {};
    if (page !== undefined) queryParams.page = page;
    if (per_page !== undefined) queryParams.perPage = per_page;

    const encodedType = encodeURIComponent(type);

    return this.request<CollectionHoldersDto>(`/collection/${encodedType}/holders`, queryParams);
  }
}
