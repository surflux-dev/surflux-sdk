import { __validateIndexerClientConfig } from '../../../src/utils/index';
import { SurfluxNetwork, SurfluxClientConfig } from '../../../src/types';

describe('__validateIndexerClientConfig', () => {
  describe('valid configurations', () => {
    it('should not throw for valid mainnet configuration', () => {
      const config: SurfluxClientConfig = {
        apiKey: 'test-api-key-12345',
        network: SurfluxNetwork.MAINNET,
      };

      expect(() => __validateIndexerClientConfig(config)).not.toThrow();
    });

    it('should not throw for valid testnet configuration', () => {
      const config: SurfluxClientConfig = {
        apiKey: 'test-api-key-12345',
        network: SurfluxNetwork.TESTNET,
      };

      expect(() => __validateIndexerClientConfig(config)).not.toThrow();
    });

    it('should not throw for valid custom network configuration with customUrl', () => {
      const config: SurfluxClientConfig = {
        apiKey: 'test-api-key-12345',
        network: SurfluxNetwork.CUSTOM,
        customUrl: 'https://custom-api.example.com',
      };

      expect(() => __validateIndexerClientConfig(config)).not.toThrow();
    });

    it('should not throw when customUrl is provided for non-custom networks', () => {
      const config: SurfluxClientConfig = {
        apiKey: 'test-api-key-12345',
        network: SurfluxNetwork.MAINNET,
        customUrl: 'https://ignored-url.com',
      };

      expect(() => __validateIndexerClientConfig(config)).not.toThrow();
    });
  });

  describe('invalid configurations', () => {
    it('should throw error when config is undefined', () => {
      expect(() => {
        __validateIndexerClientConfig(undefined as unknown as SurfluxClientConfig);
      }).toThrow('Config is required. Please provide a valid config object.');
    });

    it('should throw error when config is null', () => {
      expect(() => {
        __validateIndexerClientConfig(null as unknown as SurfluxClientConfig);
      }).toThrow('Config is required. Please provide a valid config object.');
    });

    it('should throw error when network is missing', () => {
      const config = {
        apiKey: 'test-api-key-12345',
      } as SurfluxClientConfig;

      expect(() => {
        __validateIndexerClientConfig(config);
      }).toThrow('Network is required. Please provide a valid network.');
    });

    it('should throw error when network is undefined', () => {
      const config: SurfluxClientConfig = {
        apiKey: 'test-api-key-12345',
        network: undefined as unknown as SurfluxNetwork,
      };

      expect(() => {
        __validateIndexerClientConfig(config);
      }).toThrow('Network is required. Please provide a valid network.');
    });

    it('should throw error when network is invalid enum value', () => {
      const config: SurfluxClientConfig = {
        apiKey: 'test-api-key-12345',
        network: 'invalid-network' as SurfluxNetwork,
      };

      expect(() => {
        __validateIndexerClientConfig(config);
      }).toThrow('Network is required. Please provide a valid network.');
    });

    it('should throw error when custom network is used without customUrl', () => {
      const config: SurfluxClientConfig = {
        apiKey: 'test-api-key-12345',
        network: SurfluxNetwork.CUSTOM,
      };

      expect(() => {
        __validateIndexerClientConfig(config);
      }).toThrow('Custom URL is required for custom network. Please provide a valid custom URL.');
    });

    it('should throw error when custom network is used with empty customUrl', () => {
      const config: SurfluxClientConfig = {
        apiKey: 'test-api-key-12345',
        network: SurfluxNetwork.CUSTOM,
        customUrl: '',
      };

      expect(() => {
        __validateIndexerClientConfig(config);
      }).toThrow('Custom URL is required for custom network. Please provide a valid custom URL.');
    });

    it('should throw error when apiKey is missing', () => {
      const config = {
        network: SurfluxNetwork.MAINNET,
      } as SurfluxClientConfig;

      expect(() => {
        __validateIndexerClientConfig(config);
      }).toThrow('Surflux API key is required. Please provide a valid API key. You can get your API key from the Surflux dashboard.');
    });

    it('should throw error when apiKey is undefined', () => {
      const config: SurfluxClientConfig = {
        apiKey: undefined as unknown as string,
        network: SurfluxNetwork.MAINNET,
      };

      expect(() => {
        __validateIndexerClientConfig(config);
      }).toThrow('Surflux API key is required. Please provide a valid API key. You can get your API key from the Surflux dashboard.');
    });

    it('should throw error when apiKey is empty string', () => {
      const config: SurfluxClientConfig = {
        apiKey: '',
        network: SurfluxNetwork.MAINNET,
      };

      expect(() => {
        __validateIndexerClientConfig(config);
      }).toThrow('Surflux API key is required. Please provide a valid API key. You can get your API key from the Surflux dashboard.');
    });

    it('should throw error when apiKey is not a string', () => {
      const config = {
        apiKey: 12345,
        network: SurfluxNetwork.MAINNET,
      } as unknown as SurfluxClientConfig;

      expect(() => {
        __validateIndexerClientConfig(config);
      }).toThrow('Surflux API key is required. Please provide a valid API key. You can get your API key from the Surflux dashboard.');
    });
  });
});


