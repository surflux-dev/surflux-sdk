import {
  NFTToken,
  NftsResponseDto,
  CollectionHoldersDto,
  GetNFTByIdParams,
  GetNFTsForOwnerParams,
  GetNFTsForCollectionParams,
  GetCollectionHoldersParams,
  SurfluxClientConfig,
} from '../types';
import { __validateIndexerClientConfig, buildQueryParams, httpRequest } from '../utils';
import { getApiBaseUrl } from '../constants';

/**
 * Client for interacting with the Surflux NFT API.
 * Provides methods to query NFT collections, tokens, and holders.
 */
export class SurfluxNFTClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  /**
   * Creates a new SurfluxNFTClient instance.
   *
   * @param config - Configuration object
   * @param config.apiKey - Your Surflux API key
   * @param config.network - Network to use ('mainnet', 'testnet', 'custom')
   * @param config.customUrl - Optional custom URL to use. If provided and network is CUSTOM, it will override the network-specific URL.
   */
  constructor(config: SurfluxClientConfig) {
    __validateIndexerClientConfig(config);

    this.apiKey = config.apiKey;
    this.baseUrl = getApiBaseUrl(config.network, config.customUrl);
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
    const url = `${this.baseUrl}/nfts/${params.object_id}`;

    return httpRequest<NFTToken>(url, {
      apiKey: this.apiKey,
    });
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

    const url = `${this.baseUrl}/nfts/address/${address}`;

    return httpRequest<NftsResponseDto>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
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

    const url = `${this.baseUrl}/nfts/collection/${encodedType}`;

    return httpRequest<NftsResponseDto>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
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

    const url = `${this.baseUrl}/nfts/collection/${encodedType}/holders`;

    return httpRequest<CollectionHoldersDto>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }
}
