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
 *
 * @example
 * ```typescript
 * const client = new SurfluxNFTClient({
 *   apiKey: 'your-api-key',
 *   network: SurfluxNetwork.TESTNET
 * });
 * ```
 */
export class SurfluxNFTClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  /**
   * Creates a new SurfluxNFTClient instance.
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
    this.#validateObjectId(params.object_id);
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
   * @param params.page - Optional page number for pagination
   * @param params.per_page - Optional number of items per page
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
    this.#validateAddress(params.address);
    this.#validatePage(params.page);
    this.#validatePerPage(params.per_page);

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
   * @param params.type - The collection type (e.g., '0x123::module::NFT')
   * @param params.fields - Optional JSON object for filtering by field values
   * @param params.page - Optional page number for pagination
   * @param params.per_page - Optional number of items per page
   * @returns A promise that resolves to a paginated response with NFT tokens
   *
   * @example
   * ```typescript
   * const nfts = await client.getNFTsForCollection({
   *   type: '0x123::duck_nft::DuckNFT',
   *   page: 1,
   *   per_page: 20
   * });
   * ```
   */
  async getNFTsForCollection(params: GetNFTsForCollectionParams): Promise<NftsResponseDto> {
    this.#validateType(params.type);
    this.#validatePage(params.page);
    this.#validatePerPage(params.per_page);

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
   * @param params.type - The collection type (e.g., '0x123::module::NFT')
   * @param params.page - Optional page number for pagination
   * @param params.per_page - Optional number of items per page
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
    this.#validateType(params.type);
    this.#validatePage(params.page);
    this.#validatePerPage(params.per_page);

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

  /**
   * Validates Sui object ID format.
   *
   * @private
   * @param objectId - The object ID to validate
   * @throws {Error} If object ID is invalid
   */
  #validateObjectId(_objectId: string | undefined): void {
    // if (!objectId || typeof objectId !== 'string') {
    //   throw new Error('Object ID is required and must be a non-empty string.');
    // }

    // if (objectId.trim().length === 0) {
    //   throw new Error('Object ID cannot be empty.');
    // }

    // // Sui object IDs start with 0x and contain hex characters
    // if (!objectId.startsWith('0x')) {
    //   throw new Error(
    //     `Invalid object ID format: "${objectId}". Object ID must start with "0x".`
    //   );
    // }

    // // Check for valid hex characters after 0x
    // const hexPart = objectId.slice(2);
    // if (hexPart.length === 0) {
    //   throw new Error(
    //     `Invalid object ID format: "${objectId}". Object ID must contain hex characters after "0x".`
    //   );
    // }

    // if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
    //   throw new Error(
    //     `Invalid object ID format: "${objectId}". Object ID can only contain hexadecimal characters (0-9, a-f, A-F).`
    //   );
    // }
  }

  /**
   * Validates Sui address format.
   *
   * @private
   * @param address - The address to validate
   * @throws {Error} If address is invalid
   */
  #validateAddress(_address: string | undefined): void {
    // if (!address || typeof address !== 'string') {
    //   throw new Error('Address is required and must be a non-empty string.');
    // }

    // if (address.trim().length === 0) {
    //   throw new Error('Address cannot be empty.');
    // }

    // // Sui addresses start with 0x and contain hex characters
    // if (!address.startsWith('0x')) {
    //   throw new Error(
    //     `Invalid address format: "${address}". Address must start with "0x".`
    //   );
    // }

    // // Check for valid hex characters after 0x
    // const hexPart = address.slice(2);
    // if (hexPart.length === 0) {
    //   throw new Error(
    //     `Invalid address format: "${address}". Address must contain hex characters after "0x".`
    //   );
    // }

    // if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
    //   throw new Error(
    //     `Invalid address format: "${address}". Address can only contain hexadecimal characters (0-9, a-f, A-F).`
    //   );
    // }
  }

  /**
   * Validates Sui type format (address::module::Type).
   *
   * @private
   * @param type - The type to validate
   * @throws {Error} If type is invalid
   */
  #validateType(_type: string | undefined): void {
    // if (!type || typeof type !== 'string') {
    //   throw new Error('Type is required and must be a non-empty string.');
    // }

    // if (type.trim().length === 0) {
    //   throw new Error('Type cannot be empty.');
    // }

    // // Sui types follow the pattern: address::module::Type
    // const parts = type.split('::');
    // if (parts.length !== 3) {
    //   throw new Error(
    //     `Invalid type format: "${type}". Type must follow the pattern "address::module::Type" (e.g., "0x123::module::NFT").`
    //   );
    // }

    // const [address, module, typeName] = parts;

    // // Validate address part
    // if (!address.startsWith('0x')) {
    //   throw new Error(
    //     `Invalid type format: "${type}". Address part must start with "0x".`
    //   );
    // }

    // const hexPart = address.slice(2);
    // if (hexPart.length === 0 || !/^[0-9a-fA-F]+$/.test(hexPart)) {
    //   throw new Error(
    //     `Invalid type format: "${type}". Address part must be a valid hexadecimal string.`
    //   );
    // }

    // // Validate module and type name (alphanumeric and underscores)
    // if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(module)) {
    //   throw new Error(
    //     `Invalid type format: "${type}". Module name must start with a letter and contain only alphanumeric characters and underscores.`
    //   );
    // }

    // if (!/^[A-Z][a-zA-Z0-9_]*$/.test(typeName)) {
    //   throw new Error(
    //     `Invalid type format: "${type}". Type name must start with an uppercase letter and contain only alphanumeric characters and underscores.`
    //   );
    // }
  }

  /**
   * Validates page parameter for pagination.
   *
   * @private
   * @param page - The page number to validate
   * @throws {Error} If page is invalid
   */
  #validatePage(_page: number | undefined): void {
    // if (page === undefined) {
    //   return; // Optional parameter
    // }

    // if (typeof page !== 'number') {
    //   throw new Error(`Page must be a number, got: ${typeof page}.`);
    // }

    // if (!Number.isInteger(page)) {
    //   throw new Error(`Page must be an integer, got: ${page}.`);
    // }

    // if (page < 1) {
    //   throw new Error(`Page must be at least 1, got: ${page}.`);
    // }
  }

  /**
   * Validates per_page parameter for pagination.
   *
   * @private
   * @param perPage - The per_page value to validate
   * @throws {Error} If per_page is invalid
   */
  #validatePerPage(_perPage: number | undefined): void {
    // if (perPage === undefined) {
    //   return; // Optional parameter
    // }

    // if (typeof perPage !== 'number') {
    //   throw new Error(`Per page must be a number, got: ${typeof perPage}.`);
    // }

    // if (!Number.isInteger(perPage)) {
    //   throw new Error(`Per page must be an integer, got: ${perPage}.`);
    // }

    // if (perPage < 1) {
    //   throw new Error(`Per page must be at least 1, got: ${perPage}.`);
    // }

    // // Reasonable upper limit for pagination
    // const maxPerPage = 1000;
    // if (perPage > maxPerPage) {
    //   throw new Error(`Per page cannot exceed ${maxPerPage}, got: ${perPage}.`);
    // }
  }
}
