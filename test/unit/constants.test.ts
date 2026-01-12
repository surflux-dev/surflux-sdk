import { SurfluxNetwork } from '../../src/types';
import { getApiBaseUrl, getFluxBaseUrl } from '../../src/constants';

describe('constants', () => {
  describe('getApiBaseUrl', () => {
    it('should return mainnet API URL for MAINNET network', () => {
      const url = getApiBaseUrl(SurfluxNetwork.MAINNET);
      expect(url).toBe('https://api.surflux.dev');
    });

    it('should return testnet API URL for TESTNET network', () => {
      const url = getApiBaseUrl(SurfluxNetwork.TESTNET);
      expect(url).toBe('https://testnet-api.surflux.dev');
    });

    it('should return custom URL for CUSTOM network when provided', () => {
      const customUrl = 'https://custom-api.example.com';
      const url = getApiBaseUrl(SurfluxNetwork.CUSTOM, customUrl);
      expect(url).toBe(customUrl);
    });

    it('should throw error for CUSTOM network when custom URL is not provided', () => {
      expect(() => {
        getApiBaseUrl(SurfluxNetwork.CUSTOM);
      }).toThrow('Custom URL is required for custom network');
    });

    it('should throw error for CUSTOM network when custom URL is empty string', () => {
      expect(() => {
        getApiBaseUrl(SurfluxNetwork.CUSTOM, '');
      }).toThrow('Custom URL is required for custom network');
    });

    it('should ignore custom URL parameter for non-CUSTOM networks', () => {
      const customUrl = 'https://ignored-url.com';
      const mainnetUrl = getApiBaseUrl(SurfluxNetwork.MAINNET, customUrl);
      const testnetUrl = getApiBaseUrl(SurfluxNetwork.TESTNET, customUrl);

      expect(mainnetUrl).toBe('https://api.surflux.dev');
      expect(testnetUrl).toBe('https://testnet-api.surflux.dev');
    });
  });

  describe('getFluxBaseUrl', () => {
    it('should return mainnet Flux URL for MAINNET network', () => {
      const url = getFluxBaseUrl(SurfluxNetwork.MAINNET);
      expect(url).toBe('https://flux.surflux.dev');
    });

    it('should return testnet Flux URL for TESTNET network', () => {
      const url = getFluxBaseUrl(SurfluxNetwork.TESTNET);
      expect(url).toBe('https://testnet-flux.surflux.dev');
    });

    it('should return custom URL for CUSTOM network when provided', () => {
      const customUrl = 'https://custom-flux.example.com';
      const url = getFluxBaseUrl(SurfluxNetwork.CUSTOM, customUrl);
      expect(url).toBe(customUrl);
    });

    it('should throw error for CUSTOM network when custom URL is not provided', () => {
      expect(() => {
        getFluxBaseUrl(SurfluxNetwork.CUSTOM);
      }).toThrow('Custom URL is required for custom network');
    });

    it('should throw error for CUSTOM network when custom URL is empty string', () => {
      expect(() => {
        getFluxBaseUrl(SurfluxNetwork.CUSTOM, '');
      }).toThrow('Custom URL is required for custom network');
    });

    it('should ignore custom URL parameter for non-CUSTOM networks', () => {
      const customUrl = 'https://ignored-url.com';
      const mainnetUrl = getFluxBaseUrl(SurfluxNetwork.MAINNET, customUrl);
      const testnetUrl = getFluxBaseUrl(SurfluxNetwork.TESTNET, customUrl);

      expect(mainnetUrl).toBe('https://flux.surflux.dev');
      expect(testnetUrl).toBe('https://testnet-flux.surflux.dev');
    });
  });
});

