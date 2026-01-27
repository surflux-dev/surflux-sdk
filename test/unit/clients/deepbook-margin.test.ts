import { SurfluxDeepbookMarginClient } from '../../../src/clients/deepbook-margin';
import { SurfluxNetwork } from '../../../src/types';
import { httpRequest } from '../../../src/utils/http';
import { getApiBaseUrl } from '../../../src/constants';
import type {
  DeepbookMarginPool,
  RegisteredDeepbookMarginPool,
  DeepbookMarginManager,
  DeepbookMarginActiveLoan,
  DeepbookMarginActiveSupply,
  DeepbookMarginLiquidation,
  DeepbookMarginSupplierCap,
  DeepbookMarginSupplyReferral,
  SurfluxClientConfig,
} from '../../../src/types';

// Mock dependencies
jest.mock('../../../src/utils/http');
jest.mock('../../../src/constants');

const mockHttpRequest = httpRequest as jest.MockedFunction<typeof httpRequest>;
const mockGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<typeof getApiBaseUrl>;

describe('SurfluxDeepbookMarginClient', () => {
  const validApiKey = 'test-api-key-12345';
  const testBaseUrl = 'https://testnet-api.surflux.dev';
  const mainnetBaseUrl = 'https://api.surflux.dev';
  const customBaseUrl = 'https://custom-api.example.com';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApiBaseUrl.mockReturnValue(testBaseUrl);
  });

  describe('Constructor', () => {
    it('should create instance with valid API key and testnet network', () => {
      // Arrange
      const config: SurfluxClientConfig = {
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      };

      // Act
      const client = new SurfluxDeepbookMarginClient(config);

      // Assert
      expect(client).toBeInstanceOf(SurfluxDeepbookMarginClient);
      expect(mockGetApiBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.TESTNET, undefined);
    });

    it('should create instance with valid API key and mainnet network', () => {
      // Arrange
      mockGetApiBaseUrl.mockReturnValue(mainnetBaseUrl);
      const config: SurfluxClientConfig = {
        apiKey: validApiKey,
        network: SurfluxNetwork.MAINNET,
      };

      // Act
      const client = new SurfluxDeepbookMarginClient(config);

      // Assert
      expect(client).toBeInstanceOf(SurfluxDeepbookMarginClient);
      expect(mockGetApiBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.MAINNET, undefined);
    });

    it('should create instance with custom URL when network is CUSTOM', () => {
      // Arrange
      mockGetApiBaseUrl.mockReturnValue(customBaseUrl);
      const config: SurfluxClientConfig = {
        apiKey: validApiKey,
        network: SurfluxNetwork.CUSTOM,
        customUrl: customBaseUrl,
      };

      // Act
      const client = new SurfluxDeepbookMarginClient(config);

      // Assert
      expect(client).toBeInstanceOf(SurfluxDeepbookMarginClient);
      expect(mockGetApiBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.CUSTOM, customBaseUrl);
    });

    it('should throw an error when config is invalid', () => {
      // Assert - undefined config
      expect(() => {
        new SurfluxDeepbookMarginClient(undefined as unknown as SurfluxClientConfig);
      }).toThrow('Config is required');

      // Assert - invalid network
      expect(() => {
        new SurfluxDeepbookMarginClient({ apiKey: validApiKey, network: 'invalid' as SurfluxNetwork });
      }).toThrow('Network is required. Please provide a valid network.');

      // Assert - undefined network
      expect(() => {
        new SurfluxDeepbookMarginClient({
          apiKey: validApiKey,
          network: undefined as unknown as SurfluxNetwork,
        });
      }).toThrow('Network is required. Please provide a valid network.');

      // Assert - undefined API key
      expect(() => {
        new SurfluxDeepbookMarginClient({
          apiKey: undefined as unknown as string,
          network: SurfluxNetwork.TESTNET,
        });
      }).toThrow('Surflux API key is required. Please provide a valid API key.');

      // Assert - empty API key
      expect(() => {
        new SurfluxDeepbookMarginClient({ apiKey: '', network: SurfluxNetwork.TESTNET });
      }).toThrow('Surflux API key is required. Please provide a valid API key.');

      // Assert - custom network without customUrl
      expect(() => {
        new SurfluxDeepbookMarginClient({
          apiKey: validApiKey,
          network: SurfluxNetwork.CUSTOM,
        });
      }).toThrow('Custom URL is required for custom network');
    });
  });

  describe('getMarginPools', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should return margin pools without params', async () => {
      // Arrange
      const mockPools: DeepbookMarginPool[] = [
        { pool_id: '0x123', asset_type: '0x2::sui::SUI', asset_decimals: 9, asset_symbol: 'SUI', asset_name: 'Sui' },
      ];
      mockHttpRequest.mockResolvedValue(mockPools);

      // Act
      const result = await client.getMarginPools();

      // Assert
      expect(result).toEqual(mockPools);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/pools`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should return margin pools with all params', async () => {
      // Arrange
      const mockPools: DeepbookMarginPool[] = [
        { pool_id: '0x123', asset_type: '0x2::sui::SUI', asset_decimals: 9, asset_symbol: 'SUI', asset_name: 'Sui' },
      ];
      mockHttpRequest.mockResolvedValue(mockPools);

      // Act
      const result = await client.getMarginPools({
        assetType: '0x2::sui::SUI',
        deepbookPoolId: '0x456',
      });

      // Assert
      expect(result).toEqual(mockPools);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/pools`, {
        apiKey: validApiKey,
        params: { assetType: '0x2::sui::SUI', deepbookPoolId: '0x456' },
      });
    });

    it('should handle API errors', async () => {
      // Arrange
      const errorMessage = 'API error: 500 Internal Server Error';
      mockHttpRequest.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(client.getMarginPools()).rejects.toThrow(errorMessage);
    });
  });

  describe('getRegisteredMarginPools', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should return registered pools without params', async () => {
      // Arrange
      const mockPools: RegisteredDeepbookMarginPool[] = [
        { pool_id: '0x123', pool_name: 'SUI_USDC', base_margin_pool_id: '0x111', quote_margin_pool_id: '0x222', base_asset_id: '0x333', quote_asset_id: '0x444' },
      ];
      mockHttpRequest.mockResolvedValue(mockPools);

      // Act
      const result = await client.getRegisteredMarginPools();

      // Assert
      expect(result).toEqual(mockPools);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/registered-deepbook-pools`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should return registered pools with marginPoolId param', async () => {
      // Arrange
      const mockPools: RegisteredDeepbookMarginPool[] = [
        { pool_id: '0x123', pool_name: 'SUI_USDC', base_margin_pool_id: '0x111', quote_margin_pool_id: '0x222', base_asset_id: '0x333', quote_asset_id: '0x444' },
      ];
      mockHttpRequest.mockResolvedValue(mockPools);

      // Act
      const result = await client.getRegisteredMarginPools({ marginPoolId: '0x111' });

      // Assert
      expect(result).toEqual(mockPools);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/registered-deepbook-pools`, {
        apiKey: validApiKey,
        params: { marginPoolId: '0x111' },
      });
    });
  });

  describe('getMarginManagers', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should return margin managers without params (base endpoint)', async () => {
      // Arrange
      const mockManagers: DeepbookMarginManager[] = [
        { balance_manager_id: '0x123', owner: '0xabc', pool_id: '0x456' },
      ];
      mockHttpRequest.mockResolvedValue(mockManagers);

      // Act
      const result = await client.getMarginManagers();

      // Assert
      expect(result).toEqual(mockManagers);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/margin-managers`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should return margin managers with owner (owner-specific endpoint)', async () => {
      // Arrange
      const mockManagers: DeepbookMarginManager[] = [
        { balance_manager_id: '0x123', owner: '0xabc', pool_id: '0x456' },
      ];
      mockHttpRequest.mockResolvedValue(mockManagers);
      const owner = '0xabc';

      // Act
      const result = await client.getMarginManagers({ owner });

      // Assert
      expect(result).toEqual(mockManagers);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/margin-managers/${owner}`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should return margin managers with all params', async () => {
      // Arrange
      const mockManagers: DeepbookMarginManager[] = [];
      mockHttpRequest.mockResolvedValue(mockManagers);

      // Act
      const result = await client.getMarginManagers({
        owner: '0xabc',
        deepbookPoolId: '0x456',
        balanceManagerId: '0x789',
        page: 0,
        perPage: 20,
      });

      // Assert
      expect(result).toEqual(mockManagers);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/margin-managers/0xabc`, {
        apiKey: validApiKey,
        params: { deepbookPoolId: '0x456', balanceManagerId: '0x789', page: 0, perPage: 20 },
      });
    });
  });

  describe('getActiveLoans', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should return active loans without params (base endpoint)', async () => {
      // Arrange
      const mockLoans: DeepbookMarginActiveLoan[] = [
        { loan_id: '0x123', balance_manager_id: '0x456', owner: '0xabc', pool_id: '0x789', borrowed_amount: '1000', collateral_amount: '2000' },
      ];
      mockHttpRequest.mockResolvedValue(mockLoans);

      // Act
      const result = await client.getActiveLoans();

      // Assert
      expect(result).toEqual(mockLoans);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/active-loans`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should return active loans with owner (owner-specific endpoint)', async () => {
      // Arrange
      const mockLoans: DeepbookMarginActiveLoan[] = [];
      mockHttpRequest.mockResolvedValue(mockLoans);
      const owner = '0xabc';

      // Act
      const result = await client.getActiveLoans({ owner });

      // Assert
      expect(result).toEqual(mockLoans);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/active-loans/${owner}`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should include marginManagerId only when owner is not provided', async () => {
      // Arrange
      const mockLoans: DeepbookMarginActiveLoan[] = [];
      mockHttpRequest.mockResolvedValue(mockLoans);

      // Act - without owner (marginManagerId should be included)
      await client.getActiveLoans({ marginManagerId: '0xmanager', marginPoolId: '0xpool' });

      // Assert
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/active-loans`, {
        apiKey: validApiKey,
        params: { marginManagerId: '0xmanager', marginPoolId: '0xpool' },
      });
    });

    it('should exclude marginManagerId when owner is provided', async () => {
      // Arrange
      const mockLoans: DeepbookMarginActiveLoan[] = [];
      mockHttpRequest.mockResolvedValue(mockLoans);

      // Act - with owner (marginManagerId should NOT be included even if passed)
      await client.getActiveLoans({ owner: '0xabc', marginManagerId: '0xmanager', marginPoolId: '0xpool' });

      // Assert
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/active-loans/0xabc`, {
        apiKey: validApiKey,
        params: { marginPoolId: '0xpool' },
      });
    });

    it('should return active loans with all params (without owner)', async () => {
      // Arrange
      const mockLoans: DeepbookMarginActiveLoan[] = [];
      mockHttpRequest.mockResolvedValue(mockLoans);

      // Act
      const result = await client.getActiveLoans({
        marginPoolId: '0xpool',
        balanceManagerId: '0xbalance',
        marginManagerId: '0xmanager',
        page: 1,
        perPage: 10,
      });

      // Assert
      expect(result).toEqual(mockLoans);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/active-loans`, {
        apiKey: validApiKey,
        params: { marginPoolId: '0xpool', balanceManagerId: '0xbalance', marginManagerId: '0xmanager', page: 1, perPage: 10 },
      });
    });
  });

  describe('getActiveSupplies', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should return active supplies without params (base endpoint)', async () => {
      // Arrange
      const mockSupplies: DeepbookMarginActiveSupply[] = [
        { supply_id: '0x123', supplier: '0xabc', pool_id: '0x456', supplied_amount: '5000' },
      ];
      mockHttpRequest.mockResolvedValue(mockSupplies);

      // Act
      const result = await client.getActiveSupplies();

      // Assert
      expect(result).toEqual(mockSupplies);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/active-supplies`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should return active supplies with owner (owner-specific endpoint)', async () => {
      // Arrange
      const mockSupplies: DeepbookMarginActiveSupply[] = [];
      mockHttpRequest.mockResolvedValue(mockSupplies);
      const owner = '0xabc';

      // Act
      const result = await client.getActiveSupplies({ owner });

      // Assert
      expect(result).toEqual(mockSupplies);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/active-supplies/${owner}`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should include supplierCapId only when owner is not provided', async () => {
      // Arrange
      const mockSupplies: DeepbookMarginActiveSupply[] = [];
      mockHttpRequest.mockResolvedValue(mockSupplies);

      // Act - without owner (supplierCapId should be included)
      await client.getActiveSupplies({ supplierCapId: '0xcap', marginPoolId: '0xpool' });

      // Assert
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/active-supplies`, {
        apiKey: validApiKey,
        params: { supplierCapId: '0xcap', marginPoolId: '0xpool' },
      });
    });

    it('should exclude supplierCapId when owner is provided', async () => {
      // Arrange
      const mockSupplies: DeepbookMarginActiveSupply[] = [];
      mockHttpRequest.mockResolvedValue(mockSupplies);

      // Act - with owner (supplierCapId should NOT be included even if passed)
      await client.getActiveSupplies({ owner: '0xabc', supplierCapId: '0xcap', marginPoolId: '0xpool' });

      // Assert
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/active-supplies/0xabc`, {
        apiKey: validApiKey,
        params: { marginPoolId: '0xpool' },
      });
    });

    it('should return active supplies with all params (without owner)', async () => {
      // Arrange
      const mockSupplies: DeepbookMarginActiveSupply[] = [];
      mockHttpRequest.mockResolvedValue(mockSupplies);

      // Act
      const result = await client.getActiveSupplies({
        marginPoolId: '0xpool',
        assetType: '0x2::sui::SUI',
        supplierCapId: '0xcap',
        page: 2,
        perPage: 25,
      });

      // Assert
      expect(result).toEqual(mockSupplies);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/active-supplies`, {
        apiKey: validApiKey,
        params: { marginPoolId: '0xpool', assetType: '0x2::sui::SUI', supplierCapId: '0xcap', page: 2, perPage: 25 },
      });
    });
  });

  describe('getLiquidations', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should return liquidations without params (base endpoint)', async () => {
      // Arrange
      const mockLiquidations: DeepbookMarginLiquidation[] = [
        { liquidation_id: '0x123', balance_manager_id: '0x456', owner: '0xabc', pool_id: '0x789', liquidated_amount: '1000', timestamp: 1700000000 },
      ];
      mockHttpRequest.mockResolvedValue(mockLiquidations);

      // Act
      const result = await client.getLiquidations();

      // Assert
      expect(result).toEqual(mockLiquidations);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/liquidations`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should return liquidations with owner (owner-specific endpoint)', async () => {
      // Arrange
      const mockLiquidations: DeepbookMarginLiquidation[] = [];
      mockHttpRequest.mockResolvedValue(mockLiquidations);
      const owner = '0xabc';

      // Act
      const result = await client.getLiquidations({ owner });

      // Assert
      expect(result).toEqual(mockLiquidations);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/liquidations/${owner}`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should include marginManagerId only when owner is not provided', async () => {
      // Arrange
      const mockLiquidations: DeepbookMarginLiquidation[] = [];
      mockHttpRequest.mockResolvedValue(mockLiquidations);

      // Act - without owner (marginManagerId should be included)
      await client.getLiquidations({ marginManagerId: '0xmanager', marginPoolId: '0xpool' });

      // Assert
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/liquidations`, {
        apiKey: validApiKey,
        params: { marginManagerId: '0xmanager', marginPoolId: '0xpool' },
      });
    });

    it('should exclude marginManagerId when owner is provided', async () => {
      // Arrange
      const mockLiquidations: DeepbookMarginLiquidation[] = [];
      mockHttpRequest.mockResolvedValue(mockLiquidations);

      // Act - with owner (marginManagerId should NOT be included even if passed)
      await client.getLiquidations({ owner: '0xabc', marginManagerId: '0xmanager', marginPoolId: '0xpool' });

      // Assert
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/liquidations/0xabc`, {
        apiKey: validApiKey,
        params: { marginPoolId: '0xpool' },
      });
    });

    it('should return liquidations with checkpoint range params', async () => {
      // Arrange
      const mockLiquidations: DeepbookMarginLiquidation[] = [];
      mockHttpRequest.mockResolvedValue(mockLiquidations);

      // Act
      const result = await client.getLiquidations({
        fromCheckpoint: 1000000,
        toCheckpoint: 2000000,
      });

      // Assert
      expect(result).toEqual(mockLiquidations);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/liquidations`, {
        apiKey: validApiKey,
        params: { fromCheckpoint: 1000000, toCheckpoint: 2000000 },
      });
    });

    it('should return liquidations with all params (without owner)', async () => {
      // Arrange
      const mockLiquidations: DeepbookMarginLiquidation[] = [];
      mockHttpRequest.mockResolvedValue(mockLiquidations);

      // Act
      const result = await client.getLiquidations({
        marginPoolId: '0xpool',
        balanceManagerId: '0xbalance',
        marginManagerId: '0xmanager',
        fromCheckpoint: 1000000,
        toCheckpoint: 2000000,
        page: 0,
        perPage: 50,
      });

      // Assert
      expect(result).toEqual(mockLiquidations);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/liquidations`, {
        apiKey: validApiKey,
        params: {
          marginPoolId: '0xpool',
          balanceManagerId: '0xbalance',
          marginManagerId: '0xmanager',
          fromCheckpoint: 1000000,
          toCheckpoint: 2000000,
          page: 0,
          perPage: 50,
        },
      });
    });
  });

  describe('getSupplierCaps', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should return supplier caps without params', async () => {
      // Arrange
      const mockCaps: DeepbookMarginSupplierCap[] = [
        { supplier: '0xabc', pool_id: '0x123', cap_amount: '10000', current_supply: '5000' },
      ];
      mockHttpRequest.mockResolvedValue(mockCaps);

      // Act
      const result = await client.getSupplierCaps();

      // Assert
      expect(result).toEqual(mockCaps);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/supplier-caps`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should return supplier caps with all params', async () => {
      // Arrange
      const mockCaps: DeepbookMarginSupplierCap[] = [];
      mockHttpRequest.mockResolvedValue(mockCaps);

      // Act
      const result = await client.getSupplierCaps({
        owner: '0xabc',
        page: 1,
        perPage: 20,
      });

      // Assert
      expect(result).toEqual(mockCaps);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/supplier-caps`, {
        apiKey: validApiKey,
        params: { owner: '0xabc', page: 1, perPage: 20 },
      });
    });
  });

  describe('getSupplierCapById', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should return supplier cap by ID', async () => {
      // Arrange
      const mockCap: DeepbookMarginSupplierCap = {
        supplier: '0xabc',
        pool_id: '0x123',
        cap_amount: '10000',
        current_supply: '5000',
      };
      mockHttpRequest.mockResolvedValue(mockCap);
      const supplierCapId = '0xcap123';

      // Act
      const result = await client.getSupplierCapById({ supplierCapId });

      // Assert
      expect(result).toEqual(mockCap);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/supplier-caps/${supplierCapId}`, {
        apiKey: validApiKey,
      });
    });

    it('should handle 404 not found error', async () => {
      // Arrange
      const errorMessage = 'API error: 404 Supplier cap not found';
      mockHttpRequest.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(client.getSupplierCapById({ supplierCapId: '0xinvalid' })).rejects.toThrow(errorMessage);
    });
  });

  describe('getSupplyReferrals', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should return supply referrals without params', async () => {
      // Arrange
      const mockReferrals: DeepbookMarginSupplyReferral[] = [
        { referrer: '0xref', referee: '0xree', pool_id: '0x123', referral_amount: '1000' },
      ];
      mockHttpRequest.mockResolvedValue(mockReferrals);

      // Act
      const result = await client.getSupplyReferrals();

      // Assert
      expect(result).toEqual(mockReferrals);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/supply-referrals`, {
        apiKey: validApiKey,
        params: {},
      });
    });

    it('should return supply referrals with all params', async () => {
      // Arrange
      const mockReferrals: DeepbookMarginSupplyReferral[] = [];
      mockHttpRequest.mockResolvedValue(mockReferrals);

      // Act
      const result = await client.getSupplyReferrals({
        owner: '0xowner',
        marginPoolId: '0xpool',
        page: 2,
        perPage: 15,
      });

      // Assert
      expect(result).toEqual(mockReferrals);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/supply-referrals`, {
        apiKey: validApiKey,
        params: { owner: '0xowner', marginPoolId: '0xpool', page: 2, perPage: 15 },
      });
    });
  });

  describe('getSupplyReferralById', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should return supply referral by ID', async () => {
      // Arrange
      const mockReferral: DeepbookMarginSupplyReferral = {
        referrer: '0xref',
        referee: '0xree',
        pool_id: '0x123',
        referral_amount: '1000',
      };
      mockHttpRequest.mockResolvedValue(mockReferral);
      const supplyReferralId = '0xreferral123';

      // Act
      const result = await client.getSupplyReferralById({ supplyReferralId });

      // Assert
      expect(result).toEqual(mockReferral);
      expect(mockHttpRequest).toHaveBeenCalledWith(`${testBaseUrl}/deepbook-margin/supply-referrals/${supplyReferralId}`, {
        apiKey: validApiKey,
      });
    });

    it('should handle 404 not found error', async () => {
      // Arrange
      const errorMessage = 'API error: 404 Supply referral not found';
      mockHttpRequest.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(client.getSupplyReferralById({ supplyReferralId: '0xinvalid' })).rejects.toThrow(errorMessage);
    });
  });

  describe('Error Handling', () => {
    let client: SurfluxDeepbookMarginClient;

    beforeEach(() => {
      client = new SurfluxDeepbookMarginClient({
        apiKey: validApiKey,
        network: SurfluxNetwork.TESTNET,
      });
    });

    it('should propagate network errors', async () => {
      // Arrange
      const networkError = new Error('Network error: ECONNREFUSED');
      mockHttpRequest.mockRejectedValue(networkError);

      // Act & Assert
      await expect(client.getMarginPools()).rejects.toThrow('Network error: ECONNREFUSED');
    });

    it('should propagate timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      mockHttpRequest.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(client.getActiveLoans()).rejects.toThrow('Request timeout');
    });

    it('should propagate unauthorized errors', async () => {
      // Arrange
      const authError = new Error('API error: 401 Unauthorized');
      mockHttpRequest.mockRejectedValue(authError);

      // Act & Assert
      await expect(client.getLiquidations()).rejects.toThrow('API error: 401 Unauthorized');
    });
  });
});
