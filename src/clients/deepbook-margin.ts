import {
  SurfluxClientConfig,
  GetDeepbookMarginPoolsParams,
  DeepbookMarginPool,
  GetRegisteredDeepbookMarginPoolsParams,
  RegisteredDeepbookMarginPool,
  GetDeepbookMarginManagersParams,
  DeepbookMarginManager,
  GetDeepbookMarginActiveLoansParams,
  DeepbookMarginActiveLoan,
  GetDeepbookMarginActiveSuppliesParams,
  DeepbookMarginActiveSupply,
  GetDeepbookMarginLiquidationsParams,
  DeepbookMarginLiquidation,
  GetDeepbookMarginSupplierCapsParams,
  GetDeepbookMarginSupplierCapByIdParams,
  DeepbookMarginSupplierCap,
  GetDeepbookMarginSupplyReferralsParams,
  GetDeepbookMarginSupplyReferralByIdParams,
  DeepbookMarginSupplyReferral,
} from '../types';
import {
  __validateIndexerClientConfig,
  buildQueryParams,
  httpRequest,
} from '../utils';
import { getApiBaseUrl } from '../constants';

/**
 * Client for interacting with the Surflux Deepbook Margin API.
 *
 * @example
 * ```typescript
 * const client = new SurfluxDeepbookMarginClient({
 *   apiKey: 'your-api-key',
 *   network: SurfluxNetwork.TESTNET
 * });
 * ```
 */
export class SurfluxDeepbookMarginClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  /**
   * Creates a new SurfluxDeepbookMarginClient instance.
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
   * Returns a list of margin pools with optional filtering by asset type and deepbook pool ID.
   *
   * @param params - Optional parameters for filtering
   * @param params.assetType - Filter by asset type
   * @param params.deepbookPoolId - Filter by DeepBook pool ID
   * @returns A promise that resolves to an array of margin pool information
   *
   * @example
   * ```typescript
   * const pools = await client.getPools();
   * ```
   */
  public async getMarginPools(params?: GetDeepbookMarginPoolsParams): Promise<DeepbookMarginPool[]> {
    const { assetType, deepbookPoolId } = params ?? {};
    const queryParams = buildQueryParams({ assetType, deepbookPoolId });

    const url = `${this.baseUrl}/deepbook-margin/pools`;

    return httpRequest<DeepbookMarginPool[]>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }

  /**
   * Returns a list of all enabled registered DeepBook pools with their configurations. Can filter by margin pool ID.
   *
   * @param params - Optional parameters for filtering
   * @param params.marginPoolId - Filter by margin pool ID (searches in both base_margin_pool_id and quote_margin_pool_id)
   * @returns A promise that resolves to an array of registered DeepBook pool information
   *
   * @example
   * ```typescript
   * const registeredPools = await client.getRegisteredMarginPools();
   * ```
   */
  public async getRegisteredMarginPools(params?: GetRegisteredDeepbookMarginPoolsParams): Promise<RegisteredDeepbookMarginPool[]> {
    const { marginPoolId } = params ?? {};
    const queryParams = buildQueryParams({ marginPoolId });

    const url = `${this.baseUrl}/deepbook-margin/registered-deepbook-pools`;

    return httpRequest<RegisteredDeepbookMarginPool[]>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }

  /**
   * Returns margin managers with optional filtering.
   * If owner is provided, uses the owner-specific endpoint for optimized lookup.
   *
   * @param params - Optional parameters for filtering
   * @param params.owner - Optional owner address (uses optimized endpoint if provided)
   * @param params.deepbookPoolId - Optional DeepBook pool ID filter
   * @param params.balanceManagerId - Optional balance manager ID filter
   * @param params.page - Optional page number for pagination (starts from 0)
   * @param params.perPage - Optional number of items per page (max 50)
   * @returns A promise that resolves to an array of margin manager information
   *
   * @example
   * ```typescript
   * // Get all margin managers
   * const allManagers = await client.getMarginManagers();
   *
   * // Get margin managers for a specific owner
   * const ownerManagers = await client.getMarginManagers({
   *   owner: '0x123...',
   *   deepbookPoolId: '0x456...'
   * });
   * ```
   */
  public async getMarginManagers(params?: GetDeepbookMarginManagersParams): Promise<DeepbookMarginManager[]> {
    const { owner, deepbookPoolId, balanceManagerId, page, perPage } = params ?? {};
    const queryParams = buildQueryParams({ deepbookPoolId, balanceManagerId, page, perPage });

    // Use owner-specific endpoint if owner is provided
    const url = owner
      ? `${this.baseUrl}/deepbook-margin/margin-managers/${owner}`
      : `${this.baseUrl}/deepbook-margin/margin-managers`;

    return httpRequest<DeepbookMarginManager[]>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }

  /**
   * Returns active loans with optional filtering.
   * If owner is provided, uses the owner-specific endpoint for optimized lookup.
   *
   * @param params - Optional parameters for filtering
   * @param params.owner - Optional owner address (uses optimized endpoint if provided)
   * @param params.marginPoolId - Optional margin pool ID filter
   * @param params.balanceManagerId - Optional balance manager ID filter
   * @param params.marginManagerId - Optional margin manager ID filter (only for base endpoint without owner)
   * @param params.page - Optional page number for pagination (starts from 0)
   * @param params.perPage - Optional number of items per page (max 50)
   * @returns A promise that resolves to an array of active loan information
   *
   * @example
   * ```typescript
   * // Get all active loans
   * const allLoans = await client.getActiveLoans();
   *
   * // Get active loans for a specific owner
   * const ownerLoans = await client.getActiveLoans({
   *   owner: '0x123...',
   *   marginPoolId: '0x456...',
   *   page: 0,
   *   perPage: 20
   * });
   * ```
   */
  public async getActiveLoans(params?: GetDeepbookMarginActiveLoansParams): Promise<DeepbookMarginActiveLoan[]> {
    const { owner, marginPoolId, balanceManagerId, marginManagerId, page, perPage } = params ?? {};

    // marginManagerId is only valid for base endpoint (without owner)
    const queryParams = owner
      ? buildQueryParams({ marginPoolId, balanceManagerId, page, perPage })
      : buildQueryParams({ marginPoolId, balanceManagerId, marginManagerId, page, perPage });

    // Use owner-specific endpoint if owner is provided
    const url = owner
      ? `${this.baseUrl}/deepbook-margin/active-loans/${owner}`
      : `${this.baseUrl}/deepbook-margin/active-loans`;

    return httpRequest<DeepbookMarginActiveLoan[]>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }

  /**
   * Returns active supplies with optional filtering.
   * If owner is provided, uses the owner-specific endpoint for optimized lookup.
   *
   * @param params - Optional parameters for filtering
   * @param params.owner - Optional owner address (uses optimized endpoint if provided)
   * @param params.marginPoolId - Optional margin pool ID filter
   * @param params.assetType - Optional asset type filter
   * @param params.supplierCapId - Optional supplier capability ID filter (only for base endpoint without owner)
   * @param params.page - Optional page number for pagination (starts from 0)
   * @param params.perPage - Optional number of items per page (max 50)
   * @returns A promise that resolves to an array of active supply information
   *
   * @example
   * ```typescript
   * // Get all active supplies
   * const allSupplies = await client.getActiveSupplies();
   *
   * // Get active supplies for a specific owner
   * const ownerSupplies = await client.getActiveSupplies({
   *   owner: '0x123...',
   *   marginPoolId: '0x456...',
   *   page: 0,
   *   perPage: 20
   * });
   * ```
   */
  public async getActiveSupplies(params?: GetDeepbookMarginActiveSuppliesParams): Promise<DeepbookMarginActiveSupply[]> {
    const { owner, marginPoolId, assetType, supplierCapId, page, perPage } = params ?? {};

    // supplierCapId is only valid for base endpoint (without owner)
    const queryParams = owner
      ? buildQueryParams({ marginPoolId, assetType, page, perPage })
      : buildQueryParams({ marginPoolId, assetType, supplierCapId, page, perPage });

    // Use owner-specific endpoint if owner is provided
    const url = owner
      ? `${this.baseUrl}/deepbook-margin/active-supplies/${owner}`
      : `${this.baseUrl}/deepbook-margin/active-supplies`;

    return httpRequest<DeepbookMarginActiveSupply[]>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }

  /**
   * Returns liquidations with optional filtering by checkpoint range.
   * If owner is provided, uses the owner-specific endpoint for optimized lookup.
   *
   * @param params - Optional parameters for filtering
   * @param params.owner - Optional owner address (uses optimized endpoint if provided)
   * @param params.marginPoolId - Optional margin pool ID filter
   * @param params.balanceManagerId - Optional balance manager ID filter
   * @param params.marginManagerId - Optional margin manager ID filter (only for base endpoint without owner)
   * @param params.fromCheckpoint - Optional start checkpoint number (inclusive)
   * @param params.toCheckpoint - Optional end checkpoint number (inclusive)
   * @param params.page - Optional page number for pagination (starts from 0)
   * @param params.perPage - Optional number of items per page (max 50)
   * @returns A promise that resolves to an array of liquidation information
   *
   * @example
   * ```typescript
   * // Get all liquidations
   * const allLiquidations = await client.getLiquidations();
   *
   * // Get liquidations for a specific owner
   * const ownerLiquidations = await client.getLiquidations({
   *   owner: '0x123...',
   *   fromCheckpoint: 1000000,
   *   toCheckpoint: 2000000,
   *   page: 0,
   *   perPage: 20
   * });
   * ```
   */
  public async getLiquidations(params?: GetDeepbookMarginLiquidationsParams): Promise<DeepbookMarginLiquidation[]> {
    const { owner, marginPoolId, balanceManagerId, marginManagerId, fromCheckpoint, toCheckpoint, page, perPage } = params ?? {};

    // marginManagerId is only valid for base endpoint (without owner)
    const queryParams = owner
      ? buildQueryParams({ marginPoolId, balanceManagerId, fromCheckpoint, toCheckpoint, page, perPage })
      : buildQueryParams({ marginPoolId, balanceManagerId, marginManagerId, fromCheckpoint, toCheckpoint, page, perPage });

    // Use owner-specific endpoint if owner is provided
    const url = owner
      ? `${this.baseUrl}/deepbook-margin/liquidations/${owner}`
      : `${this.baseUrl}/deepbook-margin/liquidations`;

    return httpRequest<DeepbookMarginLiquidation[]>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }

  /**
   * Returns supplier caps with optional filtering by owner.
   *
   * @param params - Optional parameters for filtering
   * @param params.owner - Optional owner address filter
   * @param params.page - Optional page number for pagination (starts from 0)
   * @param params.perPage - Optional number of items per page (max 50)
   * @returns A promise that resolves to an array of supplier cap information
   *
   * @example
   * ```typescript
   * const caps = await client.getSupplierCaps({
   *   owner: '0x123...',
   *   page: 0,
   *   perPage: 20
   * });
   * ```
   */
  public async getSupplierCaps(params?: GetDeepbookMarginSupplierCapsParams): Promise<DeepbookMarginSupplierCap[]> {
    const { owner, page, perPage } = params ?? {};
    const queryParams = buildQueryParams({ owner, page, perPage });

    const url = `${this.baseUrl}/deepbook-margin/supplier-caps`;

    return httpRequest<DeepbookMarginSupplierCap[]>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }

  /**
   * Returns a specific supplier cap by ID.
   *
   * @param params - Parameters for the request
   * @param params.supplierCapId - Supplier cap ID (required)
   * @returns A promise that resolves to the supplier cap information
   *
   * @example
   * ```typescript
   * const cap = await client.getSupplierCapById({
   *   supplierCapId: '0x123...'
   * });
   * ```
   */
  public async getSupplierCapById(params: GetDeepbookMarginSupplierCapByIdParams): Promise<DeepbookMarginSupplierCap> {
    const { supplierCapId } = params;

    const url = `${this.baseUrl}/deepbook-margin/supplier-caps/${supplierCapId}`;

    return httpRequest<DeepbookMarginSupplierCap>(url, {
      apiKey: this.apiKey,
    });
  }

  /**
   * Returns supply referrals with optional filtering.
   *
   * @param params - Optional parameters for filtering
   * @param params.owner - Optional owner address filter
   * @param params.marginPoolId - Optional margin pool ID filter
   * @param params.page - Optional page number for pagination (starts from 0)
   * @param params.perPage - Optional number of items per page (max 50)
   * @returns A promise that resolves to an array of supply referral information
   *
   * @example
   * ```typescript
   * const referrals = await client.getSupplyReferrals({
   *   owner: '0x123...',
   *   marginPoolId: '0x456...',
   *   page: 0,
   *   perPage: 20
   * });
   * ```
   */
  public async getSupplyReferrals(params?: GetDeepbookMarginSupplyReferralsParams): Promise<DeepbookMarginSupplyReferral[]> {
    const { owner, marginPoolId, page, perPage } = params ?? {};
    const queryParams = buildQueryParams({ owner, marginPoolId, page, perPage });

    const url = `${this.baseUrl}/deepbook-margin/supply-referrals`;

    return httpRequest<DeepbookMarginSupplyReferral[]>(url, {
      apiKey: this.apiKey,
      params: queryParams,
    });
  }

  /**
   * Returns a specific supply referral by ID.
   *
   * @param params - Parameters for the request
   * @param params.supplyReferralId - Supply referral ID (required)
   * @returns A promise that resolves to the supply referral information
   *
   * @example
   * ```typescript
   * const referral = await client.getSupplyReferralById({
   *   supplyReferralId: '0x123...'
   * });
   * ```
   */
  public async getSupplyReferralById(params: GetDeepbookMarginSupplyReferralByIdParams): Promise<DeepbookMarginSupplyReferral> {
    const { supplyReferralId } = params;

    const url = `${this.baseUrl}/deepbook-margin/supply-referrals/${supplyReferralId}`;

    return httpRequest<DeepbookMarginSupplyReferral>(url, {
      apiKey: this.apiKey,
    });
  }
}
