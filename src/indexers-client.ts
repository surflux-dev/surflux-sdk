import { SurfluxNetwork } from './types';
import { DeepbookClient } from './deepbook-client';
import { NFTClient } from './nft-client';

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
   * @param apiKey - Your Surflux API key
   * @param network - Network to use ('mainnet' or 'testnet')
   *
   * @example
   * ```typescript
   * const client = new SurfluxIndexersClient('your-api-key', 'testnet');
   * const pools = await client.deepbook.getPools();
   * const nfts = await client.nft.getNFTsForCollection({ type: '0x...' });
   * ```
   */
  constructor(apiKey: string, network: SurfluxNetwork | string) {
    const networkString = String(network);
    this.deepbook = new DeepbookClient(apiKey, networkString);
    this.nft = new NFTClient(apiKey, networkString);
  }
}

export type { DeepbookClient } from './deepbook-client';
export type { NFTClient } from './nft-client';
