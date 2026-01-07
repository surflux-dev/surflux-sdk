import {
  getEventSourceClass,
  getCreateEventSource,
  isBrowser,
  isEventSourceAvailable,
  matchesPattern,
  type EventHandler,
  type EventSourceLike,
  type EventSourceClient,
  type CacheMethods,
  type EventCache,
  loadTimestampFromCache,
  saveTimestampToCache,
  shouldFilterEventByTimestamp,
  updateLatestTimestamp,
  createCache,
  CACHE_KEYS,
} from './utils';
import { getFluxBaseUrl } from './constants';
import { SurfluxNetwork } from './types';

export type { CacheMethods } from './utils';

let EventSourceClass: ReturnType<typeof getEventSourceClass> | null = null;
let createEventSource: ReturnType<typeof getCreateEventSource> | null = null;

if (isEventSourceAvailable()) {
  EventSourceClass = getEventSourceClass();
} else {
  try {
    createEventSource = getCreateEventSource();
  } catch { }
}

/**
 * Base event interface for Surflux package events
 */
export interface SurfluxEvent {
  type: string;
  timestamp_ms?: number;
  checkpoint_id?: number;
  tx_hash?: string;
  data: {
    event_index?: number;
    sender?: string;
    event_type?: string;
    contents: unknown;
  };
}

/**
 * Package event received from Surflux event stream
 */
interface SurfluxPackageEvent {
  type: 'package_event';
  timestamp_ms: number;
  checkpoint_id: number;
  tx_hash: string;
  data: {
    event_index: number;
    sender: string;
    event_type: string;
    contents: unknown;
  };
}

/**
 * Configuration options for SurfluxPackageEventsClient
 */
export interface SurfluxPackageEventsClientConfig {
  streamKey: string;
  /**
   * Optional network to use. If not provided, 'mainnet' will be used.
   */
  network?: SurfluxNetwork;
  /**
   * Optional custom URL to use. If provided and network is CUSTOM, it will override the network-specific URL.
   */
  customUrl?: string;
  /**
   * Optional timestamp in milliseconds. Only events newer than this timestamp will be processed.
   * If not provided, the cached timestamp will be used (if available).
   */
  fromTimestampMs?: number;
  /**
   * Optional cache methods. If provided, these will be used for persistent caching.
   * If not provided, an in-memory cache will be used automatically.
   * Caching is always enabled to avoid duplicate events.
   */
  cache?: CacheMethods;
}

/**
 * Client for receiving real-time package events from Surflux.
 * Provides methods to subscribe to events, handle event streams, and manage connections.
 */
export class SurfluxPackageEventsClient {
  private readonly streamKey: string;
  private readonly sseUrl: string;
  private fromTimestampMs?: number;
  private readonly cache: EventCache;
  private readonly cacheKey: string;
  private eventSource: EventSourceLike | EventSourceClient | null = null;
  private subscriptions: Map<string, EventHandler<unknown>[]> = new Map();
  private isConnected: boolean = false;
  private latestTimestampMs?: number;

  constructor(config: SurfluxPackageEventsClientConfig) {
    this.streamKey = config.streamKey;

    const baseUrl = getFluxBaseUrl(config.network ?? SurfluxNetwork.MAINNET, config.customUrl);
    this.sseUrl = `${baseUrl}/events?api-key=${this.streamKey}`;

    this.fromTimestampMs = config.fromTimestampMs;
    this.cache = createCache(config.cache);
    this.cacheKey = CACHE_KEYS.PACKAGE_EVENTS;
  }

  async connect(): Promise<void> {
    const cachedTimestamp = await loadTimestampFromCache(this.cache, this.cacheKey, this.fromTimestampMs);
    if (cachedTimestamp !== undefined) {
      this.fromTimestampMs = cachedTimestamp;
    }

    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      const isBrowserEnv = isEventSourceAvailable();

      try {
        if (isBrowserEnv && EventSourceClass) {
          this.eventSource = new EventSourceClass(this.sseUrl);
          this.eventSource.addEventListener('open', () => {
            console.log('Connected to Surflux event stream');
            this.isConnected = true;
            resolve();
          });

          this.eventSource.addEventListener('message', (event: Event) => {
            if (event instanceof MessageEvent) {
              this.handleMessageEvent(event);
            }
          });

          this.eventSource.addEventListener('error', (error: Event) => {
            console.error('EventSource error:', error);
            if (!this.isConnected) {
              reject(new Error('EventSource connection failed'));
            }
          });
        } else if (createEventSource) {
          const messageHandler = (event: { data: string; event?: string; id?: string }) => {
            try {
              const rawData = JSON.parse(event.data);
              if (rawData.type === 'package_event' && rawData.data?.event_type) {
                const packageEvent = rawData as SurfluxPackageEvent;
                const transformedEvent: SurfluxEvent = {
                  type: packageEvent.data.event_type,
                  timestamp_ms: packageEvent.timestamp_ms,
                  checkpoint_id: packageEvent.checkpoint_id,
                  tx_hash: packageEvent.tx_hash,
                  data: {
                    event_index: packageEvent.data.event_index,
                    sender: packageEvent.data.sender,
                    event_type: packageEvent.data.event_type,
                    contents: packageEvent.data.contents,
                  },
                };
                this.handleEvent(transformedEvent, packageEvent);
              } else {
                const data = rawData as SurfluxEvent;
                this.handleEvent(data);
              }
            } catch (error) {
              console.error('Error parsing event:', error);
            }
          };

          this.eventSource = createEventSource({
            url: this.sseUrl,
            headers: {
              Accept: 'text/event-stream',
              'Cache-Control': 'no-cache',
              'User-Agent': '@surflux/sdk',
            },
            onMessage: messageHandler,
          });
        } else {
          throw new Error('EventSource is not available in this environment');
        }
      } catch (error) {
        reject(
          new Error(`Failed to create EventSource: ${error instanceof Error ? error.message : String(error)}`)
        );
      }
    });
  }

  private handleMessageEvent(event: MessageEvent): void {
    try {
      const rawData = JSON.parse(event.data);
      if (rawData.type === 'package_event' && rawData.data?.event_type) {
        const packageEvent = rawData as SurfluxPackageEvent;
        const transformedEvent: SurfluxEvent = {
          type: packageEvent.data.event_type,
          timestamp_ms: packageEvent.timestamp_ms,
          checkpoint_id: packageEvent.checkpoint_id,
          tx_hash: packageEvent.tx_hash,
          data: {
            event_index: packageEvent.data.event_index,
            sender: packageEvent.data.sender,
            event_type: packageEvent.data.event_type,
            contents: packageEvent.data.contents,
          },
        };
        this.handleEvent(transformedEvent, packageEvent);
      } else {
        const data = rawData as SurfluxEvent;
        this.handleEvent(data);
      }
    } catch (error) {
      console.error('Error parsing event:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      console.log('Disconnected from event stream');
    }

    await saveTimestampToCache(this.cache, this.cacheKey, this.latestTimestampMs);
  }

  private handleEvent(event: SurfluxEvent, fullPackageEvent?: SurfluxPackageEvent): void {
    if (!event.type) return;

    if (shouldFilterEventByTimestamp(event.timestamp_ms, this.fromTimestampMs)) {
      return;
    }

    this.latestTimestampMs = updateLatestTimestamp(event.timestamp_ms, this.latestTimestampMs);

    const eventTypeParts = event.type.split('::');
    const eventTypeName = eventTypeParts[eventTypeParts.length - 1];

    const handlerEntries: Array<{ handler: EventHandler; isWildcard: boolean }> = [];

    const exactHandlers = this.subscriptions.get(event.type);
    if (exactHandlers) {
      exactHandlers.forEach((handler) => {
        handlerEntries.push({ handler, isWildcard: false });
      });
    }

    const nameHandlers = this.subscriptions.get(eventTypeName);
    if (nameHandlers) {
      nameHandlers.forEach((handler) => {
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
          if (fullPackageEvent) {
            handler(fullPackageEvent as Parameters<typeof handler>[0]);
          } else {
            handler(event as Parameters<typeof handler>[0]);
          }
        } else {
          handler(event.data.contents || event.data);
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    });
  }

  on<T = unknown>(eventType: string, handler: EventHandler<T>): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    this.subscriptions.get(eventType)!.push(handler as EventHandler<unknown>);
  }

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

  onAll<T = SurfluxEvent>(handler: EventHandler<T>): void {
    this.on('*', handler as EventHandler<unknown>);
  }

  waitFor<T = unknown>(eventType: string, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const handler: EventHandler<T> = (event: T) => {
        if (timeoutId) clearTimeout(timeoutId);
        this.off(eventType, handler as EventHandler<unknown>);
        resolve(event);
      };

      const timeoutId = timeout
        ? setTimeout(() => {
          this.off(eventType, handler as EventHandler<unknown>);
          reject(new Error(`Timeout waiting for event: ${eventType}`));
        }, timeout)
        : null;

      this.on(eventType, handler);
    });
  }

  onEvent<T = unknown>(eventTypeName: string, handler: EventHandler<T>): void {
    this.on(eventTypeName, handler);
    return;
  }

  createTypedHandlers<T extends Record<string, unknown>>(eventHandlers: {
    [K in keyof T]?: (event: T[K]) => void;
  }): void {
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      if (handler) {
        this.onEvent(eventName, handler);
      }
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }
}
