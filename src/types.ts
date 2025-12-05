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
  price: string;
  taker_is_bid: boolean;
  base_quantity: string;
  quote_quantity: string;
  onchain_timestamp: number; // milliseconds
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
  metadata?: Record<string, any>;
  owner?: string;
  minted_at?: number;
}

export interface NFTMetadata {
  token_id: string;
  collection_id: string;
  attributes?: Record<string, any>;
  properties?: Record<string, any>;
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
  fields?: Record<string, any>; // JSON object for filtering
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
