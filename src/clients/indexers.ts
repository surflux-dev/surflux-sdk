import { SurfluxClientConfig } from '../types';
import { SurfluxDeepbookClient } from './deepbook';
import { NFTClient } from './nft';
import { __validateIndexerClientConfig } from '../utils';

/**
 * Main client for accessing Surflux indexer services.
 * Provides access to Deepbook and NFT indexer clients.
 */
export class SurfluxIndexersClient {
  /** Client for Deepbook trading pool data */
  public readonly deepbook: SurfluxDeepbookClient;
  /** Client for NFT collection and token data */
  public readonly nft: NFTClient;

  /**
   * Creates a new SurfluxIndexersClient instance.
   *
   * @param config - Configuration object
   * @param config.apiKey - Your Surflux API key
   * @param config.network - Network to use ('mainnet', 'testnet', 'custom')
   * @param config.customUrl - Optional custom URL to use. If provided and network is CUSTOM, it will override the network-specific URL.
   *
   * @example
   * ```typescript
   * const client = new SurfluxIndexersClient({
   *   apiKey: 'your-api-key',
   *   network: SurfluxNetwork.TESTNET,
   * });
   * const pools = await client.deepbook.getPools();
   * const nfts = await client.nft.getNFTsForCollection({ type: '0x...' });
   * ```
   * @throws {Error} If the API key is invalid or undefined
   */
  constructor(config: SurfluxClientConfig) {
    __validateIndexerClientConfig(config);

    this.deepbook = new SurfluxDeepbookClient(config);
    this.nft = new NFTClient(config.apiKey, config.network, config.customUrl);
  }
}

export type { SurfluxDeepbookClient } from './deepbook';
export type { NFTClient } from './nft';
