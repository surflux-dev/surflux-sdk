export const API_BASE_URLS = {
  mainnet: {
    api: 'https://api.surflux.dev',
    flux: 'https://flux.surflux.dev',
  },
  testnet: {
    api: 'https://testnet-api.surflux.dev',
    flux: 'https://testnet-flux.surflux.dev',
  },
} as const;

/**
 * Gets the API base URL for a given network
 */
export function getApiBaseUrl(network: string): string {
  return network === 'mainnet' ? API_BASE_URLS.mainnet.api : API_BASE_URLS.testnet.api;
}

/**
 * Gets the Flux (SSE) base URL for a given network
 */
export function getFluxBaseUrl(network: string): string {
  return network === 'mainnet' ? API_BASE_URLS.mainnet.flux : API_BASE_URLS.testnet.flux;
}
