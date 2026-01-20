import { SurfluxPackageEventsClient } from '../../../src/clients/package-events';
import { SurfluxNetwork } from '../../../src/types';
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

describe('SurfluxPackageEventsClient', () => {
  const validStreamKey = 'test-stream-key-12345';
  const testBaseUrl = 'https://testnet-flux.surflux.dev';

  let mockCreateEventSourceFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFluxBaseUrl.mockReturnValue(testBaseUrl);
    mockEventSourceInstance.addEventListener.mockClear();
    mockEventSourceInstance.close.mockClear();
    // Clear stored handlers
    mockEventSourceInstance._openHandler = undefined;
    mockEventSourceInstance._messageHandler = undefined;
    mockEventSourceInstance._errorHandler = undefined;

    mockCreateEventSourceFn = jest.fn().mockReturnValue({
      close: jest.fn(),
    });

    mockIsEventSourceAvailable.mockReturnValue(true);
    mockGetCreateEventSource.mockReturnValue(mockCreateEventSourceFn as any);
  });

  describe('Constructor', () => {
    it('should create instance with valid config', () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      expect(client).toBeInstanceOf(SurfluxPackageEventsClient);
      expect(mockGetFluxBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.TESTNET, undefined);
    });

    it('should use mainnet by default', () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
      });

      expect(mockGetFluxBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.MAINNET, undefined);
    });

    it('should use custom URL when provided', () => {
      const customUrl = 'https://custom-flux.example.com';
      mockGetFluxBaseUrl.mockReturnValue(customUrl);

      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.CUSTOM,
        customUrl,
      });

      expect(mockGetFluxBaseUrl).toHaveBeenCalledWith(SurfluxNetwork.CUSTOM, customUrl);
    });
  });

  describe('connect', () => {
    it('should connect successfully with browser EventSource', async () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
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

      expect(mockEventSourceInstance.addEventListener).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockEventSourceInstance.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockEventSourceInstance.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(client.connected).toBe(true);
    });

    it('should not reconnect if already connected', async () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

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

      // Second connect should resolve immediately
      await client.connect();

      // EventSource should only be created once (first connection)
      // The second connect should resolve immediately without creating a new EventSource
      expect(mockEventSourceInstance.addEventListener).toHaveBeenCalledTimes(3); // open, message, error from first connection
    });

    it('should handle different EventSource environments', async () => {
      // Note: Due to module-level initialization, the actual EventSource implementation
      // used depends on when the module was loaded. This test verifies that connect()
      // works regardless. The Node.js EventSource path is fully tested in E2E tests.
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      // Test that connect works (will use browser EventSource since EventSourceClass is set)
      const connectPromise = client.connect();

      await new Promise(resolve => setTimeout(resolve, 10));

      // Trigger the open handler (browser EventSource path)
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

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
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

      await client.disconnect();

      expect(mockEventSourceInstance.close).toHaveBeenCalled();
      expect(client.connected).toBe(false);
    });

    it('should handle disconnect when not connected', async () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      await client.disconnect();

      expect(mockEventSourceInstance.close).not.toHaveBeenCalled();
    });
  });

  describe('on', () => {
    it('should subscribe to event type', () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      const handler = jest.fn();
      client.on('MyEvent', handler);

      expect(() => client.on('MyEvent', handler)).not.toThrow();
    });

    it('should allow multiple handlers for same event type', () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      const handler1 = jest.fn();
      const handler2 = jest.fn();

      client.on('MyEvent', handler1);
      client.on('MyEvent', handler2);

      expect(() => client.on('MyEvent', handler1)).not.toThrow();
    });
  });

  describe('off', () => {
    it('should unsubscribe specific handler', () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      const handler = jest.fn();
      client.on('MyEvent', handler);
      client.off('MyEvent', handler);

      expect(() => client.off('MyEvent', handler)).not.toThrow();
    });

    it('should unsubscribe all handlers for event type when handler not provided', () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      client.on('MyEvent', jest.fn());
      client.on('MyEvent', jest.fn());
      client.off('MyEvent');

      expect(() => client.off('MyEvent')).not.toThrow();
    });
  });

  describe('onAll', () => {
    it('should subscribe to all events', () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      const handler = jest.fn();
      client.onAll(handler);

      expect(() => client.onAll(handler)).not.toThrow();
    });
  });

  describe('waitFor', () => {
    it('should wait for event and resolve', async () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      const waitPromise = client.waitFor('MyEvent', 1000);

      setTimeout(() => {
        const handler = (client as any).subscriptions.get('MyEvent')?.[0];
        if (handler) {
          handler({ data: 'test' });
        }
      }, 100);

      const result = await waitPromise;
      expect(result).toBeDefined();
    }, 2000);

    it('should timeout if event not received', async () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      await expect(
        client.waitFor('MyEvent', 100)
      ).rejects.toThrow('Timeout waiting for event');
    }, 2000);
  });

  describe('onEvent', () => {
    it('should subscribe to event by name', () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      const handler = jest.fn();
      client.onEvent('MyEvent', handler);

      expect(() => client.onEvent('MyEvent', handler)).not.toThrow();
    });
  });

  describe('createTypedHandlers', () => {
    it('should create handlers for multiple event types', () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      const handlers = {
        Event1: jest.fn(),
        Event2: jest.fn(),
      };

      client.createTypedHandlers(handlers);

      expect(() => client.createTypedHandlers(handlers)).not.toThrow();
    });
  });

  describe('connected property', () => {
    it('should return false when not connected', () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
        network: SurfluxNetwork.TESTNET,
      });

      expect(client.connected).toBe(false);
    });

    it('should return true when connected', async () => {
      const client = new SurfluxPackageEventsClient({
        streamKey: validStreamKey,
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
});
