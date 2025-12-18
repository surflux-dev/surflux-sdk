import {
  DeepbookEvent,
  DeepbookLiveTradeEventType,
  DeepbookStreamType,
  ReceiveAllUpdatesParams,
  ReceiveLiveTradesParams,
} from './types';
import {
  getEventSourceClass,
  isValidApiKey,
  isEventSourceAvailable,
  matchesPattern,
  type EventHandler,
} from './utils';
import { getFluxBaseUrl } from './constants';

const EventSourceClass = getEventSourceClass();

// Type helper to get the event type based on stream type
type StreamEventType<T extends DeepbookStreamType> = T extends DeepbookStreamType.ALL_UPDATES
  ? DeepbookEvent
  : T extends DeepbookStreamType.LIVE_TRADES
  ? DeepbookLiveTradeEventType
  : never;

// Type helper to get allowed event type strings based on stream type
type AllowedEventType<T extends DeepbookStreamType> = T extends DeepbookStreamType.ALL_UPDATES
  ?
      | 'deepbook_live_trades'
      | 'deepbook_order_book_depth'
      | 'deepbook_all_updates_canceled'
      | 'deepbook_all_updates_placed'
      | 'deepbook_all_updates_modified'
      | 'deepbook_all_updates_expired'
  : T extends DeepbookStreamType.LIVE_TRADES
  ? 'deepbook_live_trades' | 'deepbook_order_book_depth'
  : never;

/**
 * Configuration options for SurfluxDeepbookEventsClient
 */
export interface SurfluxDeepbookEventsClientConfig<T extends DeepbookStreamType = DeepbookStreamType> {
  streamKey: string;
  poolName: string;
  streamType: T;
  network?: string;
}

/**
 * Client for receiving Deepbook real-time events and updates.
 * Provides methods to fetch all updates for a specific trading pool.
 *
 * @template T - The stream type (DeepbookStreamType.ALL_UPDATES or DeepbookStreamType.LIVE_TRADES)
 */
export class SurfluxDeepbookEventsClient<T extends DeepbookStreamType = DeepbookStreamType> {
  private streamKey: string;
  private poolName: string;
  private baseUrl: string;
  private eventSource: EventSource | null = null;
  private subscriptions: Map<string, Array<EventHandler<unknown>>> = new Map();
  private isConnected: boolean = false;
  private streamType: T;

  /**
   * Creates a new SurfluxDeepbookEventsClient instance.
   *
   * @param config - Configuration object
   * @param config.streamKey - Your Surflux stream key
   * @param config.poolName - The name of the trading pool (e.g., 'SUI-USDC')
   * @param config.streamType - The type of stream to connect to (ALL_UPDATES or LIVE_TRADES)
   * @param config.network - Network to use ('mainnet' or 'testnet', default: 'testnet')
   *
   * @example
   * ```typescript
   * import { SurfluxDeepbookEventsClient, DeepbookStreamType } from '@surflux/sdk';
   *
   * // For all updates
   * const allUpdatesClient = new SurfluxDeepbookEventsClient({
   *   streamKey: 'your-stream-key',
   *   poolName: 'SUI-USDC',
   *   streamType: DeepbookStreamType.ALL_UPDATES,
   *   network: 'testnet'
   * });
   *
   * // For live trades only
   * const liveTradesClient = new SurfluxDeepbookEventsClient({
   *   streamKey: 'your-stream-key',
   *   poolName: 'SUI-USDC',
   *   streamType: DeepbookStreamType.LIVE_TRADES,
   *   network: 'testnet'
   * });
   * ```
   */
  constructor(config: SurfluxDeepbookEventsClientConfig<T>) {
    if (!isValidApiKey(config.streamKey)) {
      throw new Error('Surflux stream key is required. Please provide a valid stream key.');
    }
    this.streamKey = config.streamKey;
    this.poolName = config.poolName;
    this.streamType = config.streamType;
    this.baseUrl = getFluxBaseUrl(config.network ?? 'testnet');
  }

  /**
   * Connects to the Deepbook event stream based on the stream type selected in the constructor.
   *
   * @param params - Optional parameters
   * @param params.lastId - Optional last event ID to fetch updates from (format: timestamp-sequence)
   * @param params.type - Optional event type filter (only for ALL_UPDATES stream)
   * @returns A promise that resolves when the connection is established
   *
   * @example
   * ```typescript
   * // For all updates client
   * await allUpdatesClient.connect({ lastId: '1755091934020-0' });
   *
   * // For live trades client
   * await liveTradesClient.connect({ lastId: '1755091934020-0' });
   * ```
   */
  connect(
    params?: T extends DeepbookStreamType.ALL_UPDATES ? ReceiveAllUpdatesParams : ReceiveLiveTradesParams
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Disconnect existing connection if any
      if (this.isConnected) {
        this.disconnect();
      }

      const endpoint = this.streamType === DeepbookStreamType.ALL_UPDATES ? 'all-updates' : 'live-trades';
      const queryParams: string[] = [`api-key=${this.streamKey}`];

      if (params) {
        const { lastId } = params;
        if (lastId !== undefined) {
          queryParams.push(`last-id=${encodeURIComponent(lastId)}`);
        }

        // Only all-updates supports type filter
        if (this.streamType === DeepbookStreamType.ALL_UPDATES && 'type' in params) {
          const { type } = params as ReceiveAllUpdatesParams;
          if (type !== undefined) {
            queryParams.push(`type=${encodeURIComponent(type)}`);
          }
        }
      }

      const SSE_URL = `${this.baseUrl}/deepbook/${encodeURIComponent(
        this.poolName
      )}/${endpoint}?${queryParams.join('&')}`;

      const isBrowserEnv = isEventSourceAvailable();

      if (isBrowserEnv) {
        this.eventSource = new EventSourceClass(SSE_URL);
      } else {
        this.eventSource = new EventSourceClass(SSE_URL, {
          headers: {
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
            'User-Agent': '@surflux/sdk',
          },
        });
      }

      if (this.eventSource) {
        this.eventSource.onopen = () => {
          this.isConnected = true;
          console.log(`Connected to Deepbook ${endpoint} stream`);
          resolve();
        };

        this.eventSource.onmessage = (event: MessageEvent) => {
          try {
            const deepbookEvent = JSON.parse(event.data) as StreamEventType<T>;
            this.handleEvent(deepbookEvent);
          } catch (error) {
            console.error('Error parsing event:', error instanceof Error ? error : String(error));
          }
        };

        this.eventSource.onerror = (error: Event) => {
          console.error('EventSource error:', error);
          if (!this.isConnected) {
            reject(new Error('EventSource connection failed'));
          }
        };
      } else {
        reject(new Error('Failed to create EventSource'));
      }
    });
  }

  /**
   * Disconnects from the Deepbook event stream.
   *
   * @example
   * ```typescript
   * client.disconnect();
   * ```
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      const endpoint = this.streamType === DeepbookStreamType.ALL_UPDATES ? 'all-updates' : 'live-trades';
      console.log(`Disconnected from Deepbook ${endpoint} stream`);
    }
  }

  /**
   * Gets the connection status.
   */
  get connected(): boolean {
    return this.isConnected;
  }

  private handleEvent(event: StreamEventType<T>): void {
    if (!event.type) return;

    const handlerEntries: Array<{ handler: EventHandler; isWildcard: boolean }> = [];

    const exactHandlers = this.subscriptions.get(event.type);
    if (exactHandlers) {
      exactHandlers.forEach((handler) => {
        handlerEntries.push({ handler, isWildcard: false });
      });
    }

    const wildcardHandlers = this.subscriptions.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        handlerEntries.push({ handler, isWildcard: true });
      });
    }

    for (const [pattern, patternHandlers] of this.subscriptions.entries()) {
      if (pattern === '*') continue;
      if (pattern.includes('*') && matchesPattern(event.type, pattern)) {
        patternHandlers.forEach((handler) => {
          handlerEntries.push({ handler, isWildcard: false });
        });
      }
    }

    handlerEntries.forEach(({ handler, isWildcard }) => {
      try {
        if (isWildcard) {
          handler(event);
        } else {
          handler(event.data);
        }
      } catch (error) {
        console.error(
          `Error in event handler for ${event.type}:`,
          error instanceof Error ? error : String(error)
        );
      }
    });
  }

  /**
   * Subscribes to a specific event type.
   * The available event types depend on the stream type selected in the constructor.
   *
   * @param eventType - The event type to subscribe to (type-safe based on stream type)
   * @param handler - The handler function to call when the event is received
   *
   * @example
   * ```typescript
   * // For live trades client - only 'deepbook_live_trades' and 'deepbook_order_book_depth' are available
   * liveTradesClient.on('deepbook_live_trades', (trade: Trade) => {
   *   console.log('Trade:', trade);
   * });
   *
   * // For all updates client - all event types are available
   * allUpdatesClient.on('deepbook_all_updates_placed', (order: DeepbookAllUpdatesPlacedData) => {
   *   console.log('Order placed:', order);
   * });
   * ```
   */
  on(eventType: AllowedEventType<T>, handler: EventHandler<unknown>): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    this.subscriptions.get(eventType)!.push(handler);
  }

  /**
   * Unsubscribes from a specific event type.
   * @param eventType - The event type to unsubscribe from
   * @param handler - Optional specific handler to remove. If not provided, all handlers for the event type are removed.
   *
   * @example
   * ```typescript
   * client.off('deepbook_live_trades', myHandler);
   * // or remove all handlers
   * client.off('deepbook_live_trades');
   * ```
   */
  off(eventType: string, handler?: EventHandler): void {
    if (!handler) {
      this.subscriptions.delete(eventType);
      return;
    }

    const handlers = this.subscriptions.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      if (handlers.length === 0) {
        this.subscriptions.delete(eventType);
      }
    }
  }

  /**
   * Subscribes to all events.
   * @param handler - The handler function to call for all events
   *
   * @example
   * ```typescript
   * client.onAll((event) => {
   *   console.log('Any event:', event);
   * });
   * ```
   */
  onAll<U = StreamEventType<T>>(handler: EventHandler<U>): void {
    if (!this.subscriptions.has('*')) {
      this.subscriptions.set('*', []);
    }
    this.subscriptions.get('*')!.push(handler as EventHandler<unknown>);
  }

  /**
   * Waits for a specific event type to occur.
   * @param eventType - The event type to wait for (type-safe based on stream type)
   * @param timeout - Optional timeout in milliseconds
   * @returns A promise that resolves with the event data
   *
   * @example
   * ```typescript
   * const trade = await client.waitFor('deepbook_live_trades', 5000);
   * ```
   */
  waitFor<ET extends AllowedEventType<T>>(eventType: ET, timeout?: number): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timeoutId = timeout
        ? setTimeout(() => {
            this.off(eventType, handler);
            reject(new Error(`Timeout waiting for event: ${eventType}`));
          }, timeout)
        : null;

      const handler = (event: unknown) => {
        if (timeoutId) clearTimeout(timeoutId);
        this.off(eventType, handler);
        resolve(event);
      };

      this.on(eventType, handler);
    });
  }
}
