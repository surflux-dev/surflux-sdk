// Network enum
export enum SurfluxNetwork {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
  CUSTOM = 'custom',
}

// Deepbook API Response Types
export interface DeepbookPool {
  pool_id: string;
  pool_name: string;
  base_asset_id: string;
  base_asset_decimals: number;
  base_asset_symbol: string;
  base_asset_name: string;
  quote_asset_id: string;
  quote_asset_decimals: number;
  quote_asset_symbol: string;
  quote_asset_name: string;
  min_size: number;
  lot_size: number;
  tick_size: number;
}

export interface DeepbookOrderBookDepthLevel {
  price: string;
  total_quantity: string;
  order_count: string;
}

export interface DeepbookOrderBookDepth {
  pool_id: string;
  bids: DeepbookOrderBookDepthLevel[];
  asks: DeepbookOrderBookDepthLevel[];
}

export interface DeepbookTrade {
  event_digest: string;
  digest: string;
  sender: string;
  checkpoint: number;
  checkpoint_timestamp_ms: number;
  package: string;
  pool_id: string;
  maker_order_id: string;
  taker_order_id: string;
  maker_client_order_id: string;
  taker_client_order_id: string;
  price: number;
  taker_fee: number;
  taker_fee_is_deep: boolean;
  maker_fee: number;
  maker_fee_is_deep: boolean;
  taker_is_bid: boolean;
  base_quantity: number;
  quote_quantity: number;
  maker_balance_manager_id: string;
  taker_balance_manager_id: string;
  onchain_timestamp: number;
}

export interface DeepbookOHLCVCandle {
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume_base: string;
  volume_quote: string;
  trade_count: number;
}

// Deepbook Request Interfaces
export interface GetDeepbookTradesParams {
  /** The name of the trading pool */
  pool_name: string;
  /** Start timestamp in seconds (UNIX timestamp). Defaults to 1 day ago. */
  from?: number;
  /** End timestamp in seconds (UNIX timestamp). Defaults to current time. */
  to?: number;
  /** Maximum number of results to return. Defaults to 100. */
  limit?: number;
}

export interface GetDeepbookOrderBookDepthParams {
  /** DeepBook pool name (e.g., SUI_USDC) */
  pool_name: string;
  /** Maximum number of price levels to return for each side (bids/asks). Max 20. */
  limit?: number;
}

export interface GetDeepbookOHLCVParams {
  pool_name: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  /** Start timestamp in seconds (UNIX timestamp). Defaults to 1 day ago. */
  from?: number;
  /** End timestamp in seconds (UNIX timestamp). Defaults to current time. */
  to?: number;
  /** Maximum number of results to return */
  limit?: number;
}

// Deepbook Margin API Types
export interface DeepbookMarginPool {
  pool_id: string;
  asset_type: string;
  asset_decimals: number;
  asset_symbol: string;
  asset_name: string;
  deepbook_pool_id?: string;
  [key: string]: unknown;
}

export interface RegisteredDeepbookMarginPool {
  pool_id: string;
  pool_name: string;
  base_margin_pool_id: string;
  quote_margin_pool_id: string;
  base_asset_id: string;
  quote_asset_id: string;
  [key: string]: unknown;
}

export interface DeepbookMarginManager {
  balance_manager_id: string;
  owner: string;
  pool_id: string;
  deepbook_pool_id?: string;
  [key: string]: unknown;
}

export interface DeepbookMarginActiveLoan {
  loan_id: string;
  balance_manager_id: string;
  owner: string;
  pool_id: string;
  borrowed_amount: string;
  collateral_amount: string;
  [key: string]: unknown;
}

export interface DeepbookMarginActiveSupply {
  supply_id: string;
  supplier: string;
  pool_id: string;
  supplied_amount: string;
  [key: string]: unknown;
}

export interface DeepbookMarginLiquidation {
  liquidation_id: string;
  balance_manager_id: string;
  owner: string;
  pool_id: string;
  liquidated_amount: string;
  timestamp: number;
  [key: string]: unknown;
}

export interface DeepbookMarginSupplierCap {
  supplier: string;
  pool_id: string;
  cap_amount: string;
  current_supply: string;
  [key: string]: unknown;
}

export interface DeepbookMarginSupplyReferral {
  referrer: string;
  referee: string;
  pool_id: string;
  referral_amount: string;
  [key: string]: unknown;
}

// Deepbook Margin Request Interfaces
/**
 * Parameters for getting margin pools.
 */
export interface GetDeepbookMarginPoolsParams {
  /**
   * Filter by asset type.
   * @example "0x2::sui::SUI"
   */
  assetType?: string;
  /**
   * Filter by DeepBook pool ID.
   * @example "0x1234567890abcdef..."
   */
  deepbookPoolId?: string;
}

/**
 * Parameters for getting registered DeepBook pools.
 */
export interface GetRegisteredDeepbookMarginPoolsParams {
  /**
   * Filter by margin pool ID (searches in both base_margin_pool_id and quote_margin_pool_id).
   * @example "0x1234567890abcdef..."
   */
  marginPoolId?: string;
}

/**
 * Parameters for getting margin managers.
 */
export interface GetDeepbookMarginManagersParams {
  /**
   * Owner address. When provided, uses the optimized owner-specific endpoint.
   * @example "0x1234567890abcdef..."
   */
  owner?: string;
  /**
   * Filter by DeepBook pool ID.
   * @example "0x1234567890abcdef..."
   */
  deepbookPoolId?: string;
  /**
   * Filter by balance manager ID.
   * @example "0x1234567890abcdef..."
   */
  balanceManagerId?: string;
  /**
   * Page number for pagination (starts from 0).
   * @minimum 0
   * @default 0
   */
  page?: number;
  /**
   * Number of items per page.
   * @minimum 1
   * @maximum 50
   * @default 10
   */
  perPage?: number;
}

/**
 * Parameters for getting active loans.
 */
export interface GetDeepbookMarginActiveLoansParams {
  /**
   * Owner address. When provided, uses the optimized owner-specific endpoint.
   * @example "0x1234567890abcdef..."
   */
  owner?: string;
  /**
   * Filter by margin pool ID.
   * @example "0x1234567890abcdef..."
   */
  marginPoolId?: string;
  /**
   * Filter by balance manager ID.
   * @example "0x1234567890abcdef..."
   */
  balanceManagerId?: string;
  /**
   * Filter by margin manager ID. Only valid when `owner` is not provided.
   * @example "0x1234567890abcdef..."
   */
  marginManagerId?: string;
  /**
   * Page number for pagination (starts from 0).
   * @minimum 0
   * @default 0
   */
  page?: number;
  /**
   * Number of items per page.
   * @minimum 1
   * @maximum 50
   * @default 10
   */
  perPage?: number;
}

/**
 * Parameters for getting active supplies.
 */
export interface GetDeepbookMarginActiveSuppliesParams {
  /**
   * Owner address. When provided, uses the optimized owner-specific endpoint.
   * @example "0x1234567890abcdef..."
   */
  owner?: string;
  /**
   * Filter by margin pool ID.
   * @example "0x1234567890abcdef..."
   */
  marginPoolId?: string;
  /**
   * Filter by asset type.
   * @example "0x2::sui::SUI"
   */
  assetType?: string;
  /**
   * Filter by supplier capability ID. Only valid when `owner` is not provided.
   * @example "0x1234567890abcdef..."
   */
  supplierCapId?: string;
  /**
   * Page number for pagination (starts from 0).
   * @minimum 0
   * @default 0
   */
  page?: number;
  /**
   * Number of items per page.
   * @minimum 1
   * @maximum 50
   * @default 10
   */
  perPage?: number;
}

/**
 * Parameters for getting liquidations.
 */
export interface GetDeepbookMarginLiquidationsParams {
  /**
   * Owner address. When provided, uses the optimized owner-specific endpoint.
   * @example "0x1234567890abcdef..."
   */
  owner?: string;
  /**
   * Filter by margin pool ID.
   * @example "0x1234567890abcdef..."
   */
  marginPoolId?: string;
  /**
   * Filter by balance manager ID.
   * @example "0x1234567890abcdef..."
   */
  balanceManagerId?: string;
  /**
   * Filter by margin manager ID. Only valid when `owner` is not provided.
   * @example "0x1234567890abcdef..."
   */
  marginManagerId?: string;
  /**
   * Start checkpoint number (inclusive).
   * @example 1000000
   */
  fromCheckpoint?: number;
  /**
   * End checkpoint number (inclusive).
   * @example 2000000
   */
  toCheckpoint?: number;
  /**
   * Page number for pagination (starts from 0).
   * @minimum 0
   * @default 0
   */
  page?: number;
  /**
   * Number of items per page.
   * @minimum 1
   * @maximum 50
   * @default 10
   */
  perPage?: number;
}

/**
 * Parameters for getting supplier caps.
 */
export interface GetDeepbookMarginSupplierCapsParams {
  /**
   * Filter by owner address.
   * @example "0x1234567890abcdef..."
   */
  owner?: string;
  /**
   * Page number for pagination (starts from 0).
   * @minimum 0
   * @default 0
   */
  page?: number;
  /**
   * Number of items per page.
   * @minimum 1
   * @maximum 50
   * @default 10
   */
  perPage?: number;
}

/**
 * Parameters for getting a supplier cap by ID.
 */
export interface GetDeepbookMarginSupplierCapByIdParams {
  /**
   * The supplier capability ID.
   * @example "0x1234567890abcdef..."
   */
  supplierCapId: string;
}

/**
 * Parameters for getting supply referrals.
 */
export interface GetDeepbookMarginSupplyReferralsParams {
  /**
   * Filter by owner address.
   * @example "0x1234567890abcdef..."
   */
  owner?: string;
  /**
   * Filter by margin pool ID.
   * @example "0x1234567890abcdef..."
   */
  marginPoolId?: string;
  /**
   * Page number for pagination (starts from 0).
   * @minimum 0
   * @default 0
   */
  page?: number;
  /**
   * Number of items per page.
   * @minimum 1
   * @maximum 50
   * @default 10
   */
  perPage?: number;
}

/**
 * Parameters for getting a supply referral by ID.
 */
export interface GetDeepbookMarginSupplyReferralByIdParams {
  /**
   * The supply referral ID.
   * @example "0x1234567890abcdef..."
   */
  supplyReferralId: string;
}

// NFT API Response Types
export interface NFTCollection {
  collection_id: string;
  collection_name: string;
  description?: string;
  image_url?: string;
  creator?: string;
  total_supply?: number;
  created_at?: number;
}

export interface NFTKiosk {
  object_id: string;
  owner_cap_object_id: string;
  owner: string;
  personal_cap_object_id: string | null;
  checkpoint_id: number;
  updated_at: string;
  created_at: string;
}

export interface NFTToken {
  object_id: string;
  object_type: string;
  owner_dynamic_field_object_id: string;
  kiosk_object_id: string;
  owner: string | null;
  checkpoint_id: number;
  decoded_fields: Record<string, unknown>;
  decoded_display: Record<string, unknown>;
  updated_at: string;
  created_at: string;
  listed_value?: string;
  kiosk?: NFTKiosk;
}

export interface NFTMetadata {
  token_id: string;
  collection_id: string;
  attributes?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  image_url?: string;
  animation_url?: string;
  external_url?: string;
}

// NFT Request Interfaces
/**
 * Parameters for retrieving an NFT by its object ID.
 */
export interface GetNFTByIdParams {
  /** The Sui object ID of the NFT */
  object_id: string;
}

/**
 * Parameters for retrieving NFTs owned by an address.
 */
export interface GetNFTsByOwnerParams {
  /** The Sui address of the owner */
  address: string;
  /** Optional array of collection types to filter by */
  collections?: string[];
  /** Optional page number for pagination (starts from 0) */
  page?: number;
  /** Optional number of items per page */
  per_page?: number;
}

/**
 * Parameters for retrieving NFTs in a collection.
 */
export interface GetNFTsByCollectionParams {
  /** The collection type (e.g., '0x123::module::NFT') */
  type: string;
  /** Optional JSON object for filtering by field values */
  fields?: Record<string, unknown>;
  /** Optional page number for pagination (starts from 0) */
  page?: number;
  /** Optional number of items per page */
  per_page?: number;
}

/**
 * Parameters for retrieving collection holders.
 */
export interface GetCollectionHoldersParams {
  /** The collection type (e.g., '0x123::module::NFT') */
  type: string;
  /** Optional page number for pagination (starts from 0) */
  page?: number;
  /** Optional number of items per page */
  per_page?: number;
}

/**
 * Parameters for retrieving NFTs inside a kiosk.
 */
export interface GetKioskNFTsParams {
  /** The Sui object ID of the kiosk */
  kiosk_id: string;
  /** Optional page number for pagination (starts from 0) */
  page?: number;
  /** Optional number of items per page */
  per_page?: number;
}

// NFT Response Types
/**
 * Paginated response containing NFT tokens.
 */
export interface PaginatedNFTs {
  /** Array of NFT tokens */
  items: NFTToken[];
  /** Whether this is the last page */
  isLastPage: boolean;
  /** Current page number */
  currentPage: number;
  /** Number of items per page */
  perPage: number;
}

/**
 * Paginated response containing collection holders.
 */
export interface PaginatedCollectionHolders {
  /** Array of holder addresses with their NFT counts */
  holders: Array<{
    owner: string;
    count: number;
  }>;
  /** Whether this is the last page */
  isLastPage: boolean;
  /** Current page number */
  currentPage: number;
  /** Number of items per page */
  perPage: number;
}

/**
 * Paginated response containing NFTs inside a kiosk.
 */
export interface PaginatedKioskNFTs {
  /** Kiosk object */
  kiosk: NFTKiosk;
  /** Array of NFT tokens */
  items: NFTToken[];
  /** Whether this is the last page */
  isLastPage: boolean;
  /** Current page number */
  currentPage: number;
  /** Number of items per page */
  perPage: number;
}

// Deepbook Stream Types
export enum DeepbookStreamType {
  ALL_UPDATES = 'all-updates',
  LIVE_TRADES = 'live-trades',
}

// Deepbook Events Types
export enum DeepbookEventType {
  LIVE_TRADES = 'deepbook_live_trades',
  ORDER_BOOK_DEPTH = 'deepbook_order_book_depth',
  ALL_UPDATES_CANCELED = 'deepbook_all_updates_canceled',
  ALL_UPDATES_PLACED = 'deepbook_all_updates_placed',
  ALL_UPDATES_MODIFIED = 'deepbook_all_updates_modified',
  ALL_UPDATES_EXPIRED = 'deepbook_all_updates_expired',
}

export type DeepbookEventTypeString =
  | 'deepbook_live_trades'
  | 'deepbook_order_book_depth'
  | 'deepbook_all_updates_canceled'
  | 'deepbook_all_updates_placed'
  | 'deepbook_all_updates_modified'
  | 'deepbook_all_updates_expired';

export interface DeepbookOrderBookDepthData {
  pool_id: string;
  bids: Array<{
    price: number;
    total_quantity: number;
    order_count: number;
  }>;
  asks: Array<{
    price: number;
    total_quantity: number;
    order_count: number;
  }>;
}

export interface DeepbookAllUpdatesCanceledData {
  balance_manager_id: string;
  pool_id: string;
  order_id: string;
  client_order_id: number;
  trader: string;
  price: number;
  is_bid: boolean;
  original_quantity: number;
  base_asset_quantity_canceled: number;
  timestamp: number;
}

export interface DeepbookAllUpdatesPlacedData {
  balance_manager_id: string;
  pool_id: string;
  order_id: string;
  client_order_id: number;
  trader: string;
  price: number;
  is_bid: boolean;
  placed_quantity: number;
  expire_timestamp: number;
  timestamp: number;
}

export interface DeepbookAllUpdatesModifiedData {
  balance_manager_id: string;
  pool_id: string;
  order_id: string;
  client_order_id: number;
  trader: string;
  price: number;
  is_bid: boolean;
  previous_quantity: number;
  filled_quantity: number;
  new_quantity: number;
  timestamp: number;
}

export interface DeepbookAllUpdatesExpiredData {
  balance_manager_id: string;
  pool_id: string;
  order_id: string;
  client_order_id: number;
  trader: string;
  price: number;
  is_bid: boolean;
  original_quantity: number;
  base_asset_quantity_canceled: number;
  timestamp: number;
}

/**
 * Full package event with all metadata
 */
export interface FullPackageEvent {
  type: 'package_event';
  timestamp_ms: number;
  checkpoint_id: number;
  tx_hash: string;
  data: {
    event_index: number;
    sender: string;
    event_type: string;
    contents: unknown;
  };
}

export interface DeepbookEventBase {
  type: DeepbookEventTypeString;
  timestamp_ms: number;
  checkpoint_id: number;
  tx_hash: string;
}

export interface DeepbookLiveTradeEvent extends DeepbookEventBase {
  type: 'deepbook_live_trades';
  data: DeepbookTrade;
}

export interface DeepbookOrderBookDepthEvent extends DeepbookEventBase {
  type: 'deepbook_order_book_depth';
  data: DeepbookOrderBookDepthData;
}

export interface DeepbookAllUpdatesCanceledEvent extends DeepbookEventBase {
  type: 'deepbook_all_updates_canceled';
  data: DeepbookAllUpdatesCanceledData;
}

export interface DeepbookAllUpdatesPlacedEvent extends DeepbookEventBase {
  type: 'deepbook_all_updates_placed';
  data: DeepbookAllUpdatesPlacedData;
}

export interface DeepbookAllUpdatesModifiedEvent extends DeepbookEventBase {
  type: 'deepbook_all_updates_modified';
  data: DeepbookAllUpdatesModifiedData;
}

export interface DeepbookAllUpdatesExpiredEvent extends DeepbookEventBase {
  type: 'deepbook_all_updates_expired';
  data: DeepbookAllUpdatesExpiredData;
}

export type DeepbookEvent =
  | DeepbookLiveTradeEvent
  | DeepbookOrderBookDepthEvent
  | DeepbookAllUpdatesCanceledEvent
  | DeepbookAllUpdatesPlacedEvent
  | DeepbookAllUpdatesModifiedEvent
  | DeepbookAllUpdatesExpiredEvent;

/**
 * Union type for live trades events (only live trades and order book depth)
 */
export type DeepbookLiveTradeEventType = DeepbookLiveTradeEvent | DeepbookOrderBookDepthEvent;

export interface ReceiveAllUpdatesParams {
  lastId?: string;
  type?: DeepbookEventType | DeepbookEventTypeString;
}

export interface ReceiveLiveTradesParams {
  lastId?: string;
}

/**
 * Configuration options for SurfluxClient
*/
export interface SurfluxClientConfig {
  /**
   * Your Surflux API key
   */
  apiKey: string;
  /**
   * Network to use ('mainnet', 'testnet', 'custom')
   */
  network: SurfluxNetwork;
  /**
   * Optional custom URL to use. If provided and network is CUSTOM, it will override the network-specific URL.
   */
  customUrl?: string;
}
