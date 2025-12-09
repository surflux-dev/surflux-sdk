// Network enum
export enum SurfluxNetwork {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
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

export interface NFTToken {
  token_id: string;
  collection_id: string;
  token_name?: string;
  description?: string;
  image_url?: string;
  metadata?: Record<string, unknown>;
  owner?: string;
  minted_at?: number;
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
export interface GetNFTByIdParams {
  object_id: string;
}

export interface GetNFTsForOwnerParams {
  address: string;
  collections?: string[]; // Array of collection types
  page?: number;
  per_page?: number;
}

export interface GetNFTsForCollectionParams {
  type: string; // Collection type (e.g., '0x...::module::Type')
  fields?: Record<string, unknown>; // JSON object for filtering
  page?: number;
  per_page?: number;
}

export interface GetCollectionHoldersParams {
  type: string; // Collection type
  page?: number;
  per_page?: number;
}

// NFT Response Types
export interface NftsResponseDto {
  data: NFTToken[];
  total: number;
  page: number;
  per_page: number;
}

export interface CollectionHoldersDto {
  holders: Array<{
    address: string;
    count: number;
  }>;
  total: number;
  page: number;
  per_page: number;
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
