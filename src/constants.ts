import { SurfluxNetwork } from "./types";

const SURFLUX_API_BASE_URLS: Record<SurfluxNetwork, { api: string; flux: string }> = {
  [SurfluxNetwork.MAINNET]: {
    api: 'https://api.surflux.dev',
    flux: 'https://flux.surflux.dev',
  },
  [SurfluxNetwork.TESTNET]: {
    api: 'https://testnet-api.surflux.dev',
    flux: 'https://testnet-flux.surflux.dev',
  },
  [SurfluxNetwork.CUSTOM]: {
    api: '',
    flux: '',
  },
};

export function getApiBaseUrl(network: SurfluxNetwork, customUrl?: string): string {
  if (network !== SurfluxNetwork.CUSTOM) {
    return SURFLUX_API_BASE_URLS[network].api;
  }

  if (!customUrl) {
    throw new Error('Custom URL is required for custom network');
  }

  return customUrl;
}

export function getFluxBaseUrl(network: SurfluxNetwork, customUrl?: string): string {
  if (network !== SurfluxNetwork.CUSTOM) {
    return SURFLUX_API_BASE_URLS[network].flux;
  }

  if (!customUrl) {
    throw new Error('Custom URL is required for custom network');
  }

  return customUrl;
}
