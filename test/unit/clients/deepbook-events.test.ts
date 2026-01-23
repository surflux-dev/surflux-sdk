import { SurfluxDeepbookEventsClient } from '../../../src/clients/deepbook-events';
import { DeepbookStreamType, SurfluxNetwork } from '../../../src/types';
import { getFluxBaseUrl } from '../../../src/constants';
import {
  getEventSourceClass,
  getCreateEventSource,
  isEventSourceAvailable,
  createCache,
  loadTimestampFromCache,
  saveTimestampToCache,
  shouldFilterEventByTimestamp,
  updateLatestTimestamp,
  matchesPattern,
} from '../../../src/utils';

jest.mock('../../../src/constants');

// Create mock EventSource instance with stored handlers
const mockEventSourceInstance: {
  addEventListener: jest.Mock;
  close: jest.Mock;
  _openHandler?: () => void;
  _messageHandler?: (event: Event | MessageEvent) => void;
  _errorHandler?: (error: Event) => void;
} = {
  addEventListener: jest.fn((event: string, handler: any) => {
    // Store handlers for easy access
    if (event === 'open') {
      mockEventSourceInstance._openHandler = handler;
    }
    if (event === 'message') {
      mockEventSourceInstance._messageHandler = handler;
    }
    if (event === 'error') {
      mockEventSourceInstance._errorHandler = handler;
    }
  }),
  close: jest.fn(),
};

jest.mock('../../../src/utils', () => {
  const actual = jest.requireActual('../../../src/utils');

  // Create EventSource constructor inside factory - returns our shared instance
  const EventSourceConstructorMock = jest.fn().mockImplementation(() => mockEventSourceInstance);

  return {
    ...actual,
    getEventSourceClass: jest.fn(() => EventSourceConstructorMock),
    getCreateEventSource: jest.fn(),
    isEventSourceAvailable: jest.fn(() => true),
    createCache: jest.fn(() => ({})),
    loadTimestampFromCache: jest.fn(() => Promise.resolve(undefined)),
    saveTimestampToCache: jest.fn(() => Promise.resolve()),
    shouldFilterEventByTimestamp: jest.fn(() => false),
    updateLatestTimestamp: jest.fn((ts?: number) => ts),
    matchesPattern: jest.fn(() => false),
  };
});

const mockGetFluxBaseUrl = getFluxBaseUrl as jest.MockedFunction<typeof getFluxBaseUrl>;
const mockGetCreateEventSource = getCreateEventSource as jest.MockedFunction<typeof getCreateEventSource>;
const mockIsEventSourceAvailable = isEventSourceAvailable as jest.MockedFunction<typeof isEventSourceAvailable>;
const mockLoadTimestampFromCache = loadTimestampFromCache as jest.MockedFunction<typeof loadTimestampFromCache>;
const mockShouldFilterEventByTimestamp = shouldFilterEventByTimestamp as jest.MockedFunction<typeof shouldFilterEventByTimestamp>;
const mockUpdateLatestTimestamp = updateLatestTimestamp as jest.MockedFunction<typeof updateLatestTimestamp>;
const mockMatchesPattern = matchesPattern as jest.MockedFunction<typeof matchesPattern>;

describe('SurfluxDeepbookEventsClient', () => {
  const validStreamKey = 'test-stream-key-12345';
  const testBaseUrl = 'https://testnet-flux.surflux.dev';
  const testPoolName = 'SUI_USDC';

  let mockCreateEventSourceFn: jest.Mock;

  // Helper to create a mock MessageEvent that passes instanceof check
  const createMockMessageEvent = (data: string): MessageEvent => {
    const mock = Object.create(MessageEvent.prototype);
    Object.defineProperty(mock, 'data', {
      value: data,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    return mock as MessageEvent;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFluxBaseUrl.mockReturnValue(testBaseUrl);
    mockEventSourceInstance.addEventListener.mockClear();
    mockEventSourceInstance.close.mockClear();
    // Clear stored handlers
    mockEventSourceInstance._openHandler = undefined;
    mockEventSourceInstance._messageHandler = undefined;
    mockEventSourceInstance._errorHandler = undefined;
    // Reset utility mocks to default values
    mockShouldFilterEventByTimestamp.mockReturnValue(false);
    mockUpdateLatestTimestamp.mockImplementation((ts?: number) => ts);
    mockMatchesPattern.mockReturnValue(false);
    mockLoadTimestampFromCache.mockResolvedValue(undefined);

    mockCreateEventSourceFn = jest.fn().mockReturnValue({
      close: jest.fn(),
    });

    // Default to browser environment with EventSource
    mockIsEventSourceAvailable.mockReturnValue(true);
    mockGetCreateEventSource.mockReturnValue(mockCreateEventSourceFn as any);
  });

  describe('Constructor', () => {
    it('should create instance with valid config for ALL_UPDATES', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      expect(client).toBeInstanceOf(SurfluxDeepbookEventsClient);
      expect(mockGetFluxBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.TESTNET, undefined);
    });

    it('should create instance with valid config for LIVE_TRADES', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.LIVE_TRADES,
        network: SurfluxNetwork.TESTNET,
      });

      expect(client).toBeInstanceOf(SurfluxDeepbookEventsClient);
    });

    it('should use mainnet by default', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
      });

      expect(mockGetFluxBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.MAINNET, undefined);
    });

    it('should throw error when streamKey is missing', () => {
      expect(() => {
        new SurfluxDeepbookEventsClient({
          streamKey: '',
          poolName: testPoolName,
          streamType: DeepbookStreamType.ALL_UPDATES,
        } as any);
      }).toThrow('Surflux stream key is required');
    });

    it('should use custom URL when provided', () => {
      const customUrl = 'https://custom-flux.example.com';
      mockGetFluxBaseUrl.mockReturnValue(customUrl);

      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.CUSTOM,
        customUrl,
      });

      expect(mockGetFluxBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.CUSTOM, customUrl);
    });
  });

  describe('connect', () => {
    it('should connect successfully with browser EventSource', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const connectPromise = client.connect();

      // Wait for addEventListener to be called (it's called synchronously when EventSource is created)
      // Use a small delay to ensure the handler is stored
      await new Promise(resolve => setTimeout(resolve, 10));

      // Simulate EventSource 'open' event - handler is stored when addEventListener is called
      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      } else {
        // If handler not found, try to get it from mock calls
        const openCall = mockEventSourceInstance.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'open'
        );
        if (openCall && openCall[1]) {
          openCall[1]();
        }
      }

      await connectPromise;

      expect(mockEventSourceInstance.addEventListener).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockEventSourceInstance.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockEventSourceInstance.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(client.connected).toBe(true);
    });

    it('should connect with lastId parameter', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const connectPromise = client.connect({ lastId: '1234567890-0' });

      await new Promise(resolve => setTimeout(resolve, 10));

      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      } else {
        const openCall = mockEventSourceInstance.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'open'
        );
        if (openCall && openCall[1]) {
          openCall[1]();
        }
      }

      await connectPromise;
      expect(client.connected).toBe(true);
    });

    it('should connect with type filter for ALL_UPDATES', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const connectPromise = client.connect({
        lastId: '1234567890-0',
        type: 'deepbook_live_trades',
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      } else {
        const openCall = mockEventSourceInstance.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'open'
        );
        if (openCall && openCall[1]) {
          openCall[1]();
        }
      }

      await connectPromise;
      expect(client.connected).toBe(true);
    });

    it('should handle different EventSource environments', async () => {
      // Note: Due to module-level initialization, the actual EventSource implementation
      // used depends on when the module was loaded. This test verifies that connect()
      // works regardless. The Node.js EventSource path is fully tested in E2E tests.
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      // Test that connect works (will use browser EventSource since EventSourceClass is set)
      const connectPromise = client.connect();

      await new Promise(resolve => setTimeout(resolve, 10));

      // Trigger the open handler
      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      } else {
        const openCall = mockEventSourceInstance.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'open'
        );
        if (openCall && openCall[1]) {
          openCall[1]();
        }
      }

      await connectPromise;
      expect(client.connected).toBe(true);
    });

    it('should disconnect existing connection before reconnecting', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      // First connection
      const connectPromise1 = client.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      const openHandler1 = mockEventSourceInstance._openHandler;
      if (openHandler1) {
        openHandler1();
      } else {
        const openCall = mockEventSourceInstance.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'open'
        );
        if (openCall && openCall[1]) {
          openCall[1]();
        }
      }
      await connectPromise1;

      // Second connection should disconnect first
      const connectPromise2 = client.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockEventSourceInstance.close).toHaveBeenCalled();

      const openHandler2 = mockEventSourceInstance._openHandler;
      if (openHandler2) {
        openHandler2();
      } else {
        const openCall = mockEventSourceInstance.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'open'
        );
        if (openCall && openCall[1]) {
          openCall[1]();
        }
      }
      await connectPromise2;
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      // Connect first
      const connectPromise = client.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      } else {
        const openCall = mockEventSourceInstance.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'open'
        );
        if (openCall && openCall[1]) {
          openCall[1]();
        }
      }
      await connectPromise;

      // Disconnect
      await client.disconnect();

      expect(mockEventSourceInstance.close).toHaveBeenCalled();
      expect(client.connected).toBe(false);
    });

    it('should handle disconnect when not connected', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      await client.disconnect();

      expect(mockEventSourceInstance.close).not.toHaveBeenCalled();
    });
  });

  describe('on', () => {
    it('should subscribe to event type', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const handler = jest.fn();
      client.on('deepbook_live_trades', handler);

      // Handler should be registered (we can't directly test Map, but we can test it works via event handling)
      expect(() => client.on('deepbook_live_trades', handler)).not.toThrow();
    });

    it('should allow multiple handlers for same event type', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const handler1 = jest.fn();
      const handler2 = jest.fn();

      client.on('deepbook_live_trades', handler1);
      client.on('deepbook_live_trades', handler2);

      expect(() => client.on('deepbook_live_trades', handler1)).not.toThrow();
    });
  });

  describe('off', () => {
    it('should unsubscribe specific handler', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const handler = jest.fn();
      client.on('deepbook_live_trades', handler);
      client.off('deepbook_live_trades', handler);

      // Should not throw
      expect(() => client.off('deepbook_live_trades', handler)).not.toThrow();
    });

    it('should unsubscribe all handlers for event type when handler not provided', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      client.on('deepbook_live_trades', jest.fn());
      client.on('deepbook_live_trades', jest.fn());
      client.off('deepbook_live_trades');

      // Should not throw
      expect(() => client.off('deepbook_live_trades')).not.toThrow();
    });
  });

  describe('onAll', () => {
    it('should subscribe to all events', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const handler = jest.fn();
      client.onAll(handler);

      expect(() => client.onAll(handler)).not.toThrow();
    });
  });

  describe('waitFor', () => {
    it('should wait for event and resolve', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const waitPromise = client.waitFor('deepbook_live_trades', 1000);

      // Simulate event being received
      setTimeout(() => {
        const handler = (client as any).subscriptions.get('deepbook_live_trades')?.[0];
        if (handler) {
          handler({ data: { price: 100 } });
        }
      }, 100);

      const result = await waitPromise;
      expect(result).toBeDefined();
    }, 2000);

    it('should timeout if event not received', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      await expect(
        client.waitFor('deepbook_live_trades', 100)
      ).rejects.toThrow('Timeout waiting for event');
    }, 2000);
  });

  describe('connected property', () => {
    it('should return false when not connected', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      expect(client.connected).toBe(false);
    });

    it('should return true when connected', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const connectPromise = client.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      } else {
        const openCall = mockEventSourceInstance.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'open'
        );
        if (openCall && openCall[1]) {
          openCall[1]();
        }
      }
      await connectPromise;

      expect(client.connected).toBe(true);
    });
  });

  describe('Cache handling', () => {
    it('should use cached timestamp when available', async () => {
      const cachedTimestamp = 1234567890;
      mockLoadTimestampFromCache.mockResolvedValue(cachedTimestamp);

      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const connectPromise = client.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      }
      await connectPromise;

      expect(mockLoadTimestampFromCache).toHaveBeenCalled();
      expect((client as any).fromTimestampMs).toBe(cachedTimestamp);
    });
  });

  describe('Error handling', () => {
    it('should handle EventSource error when not connected', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const connectPromise = client.connect();
      await new Promise(resolve => setTimeout(resolve, 10));

      const errorHandler = mockEventSourceInstance._errorHandler;
      if (errorHandler) {
        errorHandler(new Event('error'));
      }

      await expect(connectPromise).rejects.toThrow('EventSource connection failed');
    });

    it('should handle JSON parsing error in message handler', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const connectPromise = client.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      }
      await connectPromise;

      const messageHandler = mockEventSourceInstance._messageHandler;
      if (messageHandler) {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const invalidMessage = createMockMessageEvent('invalid json{');
        messageHandler(invalidMessage);
        expect(consoleSpy).toHaveBeenCalledWith('Error parsing event:', expect.any(Error));
        consoleSpy.mockRestore();
      }
    });

    it('should handle non-MessageEvent in message handler', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const connectPromise = client.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      }
      await connectPromise;

      const messageHandler = mockEventSourceInstance._messageHandler;
      if (messageHandler) {
        const regularEvent = new Event('message');
        expect(() => messageHandler(regularEvent)).not.toThrow();
      }
    });
  });

  describe('handleEvent', () => {
    it('should return early if event has no type', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const handleEvent = (client as any).handleEvent.bind(client);
      expect(() => handleEvent({})).not.toThrow();
    });

    it('should filter events by timestamp', () => {
      mockShouldFilterEventByTimestamp.mockReturnValue(true);
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const handler = jest.fn();
      client.on('deepbook_live_trades', handler);

      // Call handleEvent directly to test it
      const handleEvent = (client as any).handleEvent.bind(client);
      handleEvent({
        type: 'deepbook_live_trades',
        timestamp_ms: 1000,
        data: { price: 100 },
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should call exact handlers', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const handler1 = jest.fn();
      const handler2 = jest.fn();
      client.on('deepbook_live_trades', handler1);
      client.on('deepbook_live_trades', handler2);

      // Call handleEvent directly to test it
      const handleEvent = (client as any).handleEvent.bind(client);
      handleEvent({
        type: 'deepbook_live_trades',
        timestamp_ms: 1000,
        data: { price: 100 },
      });

      expect(handler1).toHaveBeenCalledWith({ price: 100 });
      expect(handler2).toHaveBeenCalledWith({ price: 100 });
    });

    it('should call wildcard handlers with full event', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const handler = jest.fn();
      client.onAll(handler);

      const event = {
        type: 'deepbook_live_trades',
        timestamp_ms: 1000,
        data: { price: 100 },
      };

      // Call handleEvent directly to test it
      const handleEvent = (client as any).handleEvent.bind(client);
      handleEvent(event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should call pattern-matched handlers', () => {
      mockMatchesPattern.mockReturnValue(true);
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const handler = jest.fn();
      // Use type assertion to test pattern matching functionality
      (client as any).on('deepbook_*', handler);

      // Call handleEvent directly to test it
      const handleEvent = (client as any).handleEvent.bind(client);
      handleEvent({
        type: 'deepbook_live_trades',
        timestamp_ms: 1000,
        data: { price: 100 },
      });

      expect(handler).toHaveBeenCalledWith({ price: 100 });
    });

    it('should handle handler errors gracefully', () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const handler = jest.fn(() => {
        throw new Error('Handler error');
      });
      client.on('deepbook_live_trades', handler);

      // Call handleEvent directly to test it
      const handleEvent = (client as any).handleEvent.bind(client);
      expect(() => {
        handleEvent({
          type: 'deepbook_live_trades',
          timestamp_ms: 1000,
          data: { price: 100 },
        });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in event handler for deepbook_live_trades:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should update latest timestamp', () => {
      mockUpdateLatestTimestamp.mockReturnValue(2000);
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.ALL_UPDATES,
        network: SurfluxNetwork.TESTNET,
      });

      // Call handleEvent directly to test it
      const handleEvent = (client as any).handleEvent.bind(client);
      handleEvent({
        type: 'deepbook_live_trades',
        timestamp_ms: 1000,
        data: { price: 100 },
      });

      expect(mockUpdateLatestTimestamp).toHaveBeenCalledWith(1000, undefined);
      expect((client as any).latestTimestampMs).toBe(2000);
    });
  });

  describe('LIVE_TRADES stream type', () => {
    it('should connect to live-trades endpoint', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.LIVE_TRADES,
        network: SurfluxNetwork.TESTNET,
      });

      const connectPromise = client.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      }
      await connectPromise;

      expect(mockEventSourceInstance.addEventListener).toHaveBeenCalled();
    });

    it('should not allow type filter for LIVE_TRADES', async () => {
      const client = new SurfluxDeepbookEventsClient({
        streamKey: validStreamKey,
        poolName: testPoolName,
        streamType: DeepbookStreamType.LIVE_TRADES,
        network: SurfluxNetwork.TESTNET,
      });

      const connectPromise = client.connect({
        lastId: '1234567890-0',
        // @ts-expect-error - type filter should not be allowed for LIVE_TRADES
        type: 'deepbook_live_trades',
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      const openHandler = mockEventSourceInstance._openHandler;
      if (openHandler) {
        openHandler();
      }
      await connectPromise;

      expect(client.connected).toBe(true);
    });
  });
});
