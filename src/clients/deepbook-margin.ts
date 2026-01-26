import {
  SurfluxClientConfig,
} from '../types';
import {
  __validateIndexerClientConfig,
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
}
