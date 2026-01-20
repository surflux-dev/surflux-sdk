// Network enum
export enum SurfluxNetwork {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
  CUSTOM = 'custom',
}

// Deepbook API Response Types
export interface PoolInfo {
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
}

export interface OrderBookEntry {
  price: string;
  total_quantity: string;
  order_count: string;
}

export interface OrderBookDepth {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface Trade {
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

export interface OHLCVCandle {
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
export interface GetTradesParams {
  pool_name: string;
  from?: number; // Unix timestamp in seconds
  to?: number; // Unix timestamp in seconds
  limit?: number;
}

export interface GetOrderBookParams {
  pool_name: string;
  limit?: number;
}

export interface GetOHLCVParams {
  pool_name: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  from?: number; // Unix timestamp in seconds
  to?: number; // Unix timestamp in seconds
  limit?: number;
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
  data: Trade;
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
