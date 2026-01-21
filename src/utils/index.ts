import { SurfluxClientConfig, SurfluxNetwork } from '../types';

/**
 * @internal
 * Validates if an API key is a non-empty string.
 */
function isValidApiKey(apiKey: string | undefined): apiKey is string {
  return typeof apiKey === 'string' && apiKey.length > 0;
}

/**
 * @internal
 * Validates if a network is a valid SurfluxNetwork enum value.
 */
function isValidNetwork(network: SurfluxNetwork): network is SurfluxNetwork {
  return Object.values(SurfluxNetwork).includes(network);
}

/**
 * @internal
 * Validates the configuration for indexer clients.
 */
function __validateIndexerClientConfig(config: SurfluxClientConfig): void {
  if (!config) {
    throw new Error('Config is required. Please provide a valid config object.');
  }

  if (!config.network || !isValidNetwork(config.network)) {
    throw new Error('Network is required. Please provide a valid network.');
  }

  if (config.network === SurfluxNetwork.CUSTOM && !config.customUrl) {
    throw new Error('Custom URL is required for custom network. Please provide a valid custom URL.');
  }

  if (!config.apiKey || !isValidApiKey(config.apiKey)) {
    throw new Error('Surflux API key is required. Please provide a valid API key. You can get your API key from the Surflux dashboard.');
  }

  return;
}

export { __validateIndexerClientConfig };

export * from './cache';
export * from './events';
export * from './http';
export * from './query';
