import { SurfluxNetwork } from '../types';
import { DeepbookClient } from './deepbook-client';
import { NFTClient } from './nft-client';
import { isValidApiKey } from '../utils';

/**
 * Main client for accessing Surflux indexer services.
 * Provides access to Deepbook and NFT indexer clients.
 */
export class SurfluxIndexersClient {
  /** Client for Deepbook trading pool data */
  public readonly deepbook: DeepbookClient;
  /** Client for NFT collection and token data */
  public readonly nft: NFTClient;

  /**
   * Creates a new SurfluxIndexersClient instance.
   *
   * @param apiKey - Your Surflux API key (can be undefined, but will throw an error if invalid)
   * @param network - Network to use ('mainnet', 'testnet', 'custom')
   * @param customUrl - Optional custom URL to use. If provided and network is CUSTOM, it will override the network-specific URL.
   *
   * @example
   * ```typescript
   * const client = new SurfluxIndexersClient('your-api-key', 'testnet');
   * const pools = await client.deepbook.getPools();
   * const nfts = await client.nft.getNFTsForCollection({ type: '0x...' });
   * ```
   * @throws {Error} If the API key is invalid or undefined
   */
  constructor(apiKey: string | undefined, network: SurfluxNetwork, customUrl?: string) {
    if (!isValidApiKey(apiKey)) {
      throw new Error('Surflux API key is required. Please provide a valid API key.');
    }
    this.deepbook = new DeepbookClient(apiKey, network, customUrl);
    this.nft = new NFTClient(apiKey, network, customUrl);
  }
}

export type { DeepbookClient } from './deepbook-client';
export type { NFTClient } from './nft-client';
