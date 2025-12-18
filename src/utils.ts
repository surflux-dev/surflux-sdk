/**
 * Type guard to validate API key
 */
export function isValidApiKey(apiKey: string | undefined): apiKey is string {
  return typeof apiKey === 'string' && apiKey.length > 0;
}

/**
 * Event handler function type
 */
export interface EventHandler<T = unknown> {
  (event: T): void;
}

export interface EventSourceLike {
  addEventListener(type: string, listener: (event: MessageEvent | Event) => void): void;
  removeEventListener(type: string, listener: (event: MessageEvent | Event) => void): void;
  close(): void;
  readyState?: number;
  url?: string;
}

export interface EventSourceConstructor {
  new (url: string, eventSourceInitDict?: { headers?: Record<string, string> }): EventSourceLike;
}
export interface EventSourceClient {
  close(): void;
  readyState: 'open' | 'closed' | 'connecting';
  lastEventId?: string;
}
export type CreateEventSourceFunction = (options: {
  url: string;
  headers?: Record<string, string>;
  onMessage?: (event: { data: string; event?: string; id?: string }) => void;
  fetch?: typeof fetch;
}) => EventSourceClient;

/**
 * Global object with EventSource property (browser native)
 */
interface GlobalWithEventSource {
  EventSource: EventSourceConstructor;
}

/**
 * Gets the EventSource class constructor for browser, or createEventSource function for Node.js
 */
export function getEventSourceClass(): EventSourceConstructor {
  const globalObj =
    typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : null;
  if (globalObj && 'EventSource' in globalObj) {
    return (globalObj as GlobalWithEventSource).EventSource;
  }

  throw new Error('Native EventSource not available.');
}
export function getCreateEventSource(): CreateEventSourceFunction {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createEventSource } = require('eventsource-client');
    if (typeof createEventSource !== 'function') {
      throw new Error('createEventSource function not found in eventsource-client package');
    }
    return createEventSource as CreateEventSourceFunction;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`eventsource-client is not available. Error: ${errorMessage}`);
  }
}

/**
 * Checks if the code is running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Checks if the code is running in a Node.js environment
 */
export function isNodeJS(): boolean {
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
}

/**
 * Gets the global object (globalThis, window, or null)
 */
export function getGlobalObject(): typeof globalThis | Window | null {
  return typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : null;
}

/**
 * Checks if EventSource is available in the current environment
 */
export function isEventSourceAvailable(): boolean {
  const globalObj = getGlobalObject();
  return globalObj !== null && 'EventSource' in globalObj;
}

/**
 * Matches an event type against a pattern (supports wildcards with *)
 */
export function matchesPattern(eventType: string, pattern: string): boolean {
  if (pattern === '*') {
    return true;
  }
  const regexPattern = pattern.replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(eventType);
}

/**
 * Simple cache interface - user can provide just get/set functions
 */
export interface CacheMethods {
  get(key: string): Promise<string | null | undefined> | string | null | undefined;
  set(key: string, value: string): Promise<void> | void;
}

/**
 * Internal cache interface (always present)
 * This is the actual cache used internally - always created (either from user's methods or in-memory)
 */
export interface EventCache {
  get(key: string): Promise<string | null | undefined> | string | null | undefined;
  set(key: string, value: string): Promise<void> | void;
}

/**
 * Default cache keys for different client types
 */
export const CACHE_KEYS = {
  PACKAGE_EVENTS: 'surflux_package_events_last_timestamp',
  DEEPBOOK_EVENTS: 'surflux_deepbook_events_last_timestamp',
} as const;

/**
 * Creates an EventCache from user's cache methods or creates in-memory cache
 */
export function createCache(cacheMethods?: CacheMethods): EventCache {
  if (cacheMethods) {
    return {
      get: cacheMethods.get,
      set: cacheMethods.set,
    };
  }

  // Create in-memory cache
  const memoryCache = new Map<string, string>();
  return {
    get(key: string): string | null | undefined {
      return memoryCache.get(key) ?? null;
    },
    set(key: string, value: string): void {
      memoryCache.set(key, value);
    },
  };
}

/**
 * Loads timestamp from cache if available
 */
export async function loadTimestampFromCache(
  cache: EventCache,
  cacheKey: string,
  currentFromTimestampMs: number | undefined
): Promise<number | undefined> {
  if (currentFromTimestampMs !== undefined) {
    return undefined;
  }

  try {
    const cachedTimestamp = await Promise.resolve(cache.get(cacheKey));
    if (cachedTimestamp) {
      const parsedTimestamp = parseInt(cachedTimestamp, 10);
      if (!isNaN(parsedTimestamp)) {
        return parsedTimestamp;
      }
    }
  } catch (error) {
    console.warn('Failed to load timestamp from cache:', error);
  }

  return undefined;
}

/**
 * Saves timestamp to cache
 */
export async function saveTimestampToCache(
  cache: EventCache,
  cacheKey: string,
  latestTimestampMs: number | undefined
): Promise<void> {
  if (latestTimestampMs === undefined) {
    return;
  }

  try {
    await Promise.resolve(cache.set(cacheKey, latestTimestampMs.toString()));
  } catch (error) {
    console.warn('Failed to save timestamp to cache:', error);
  }
}

/**
 * Checks if an event should be filtered based on timestamp
 * @param eventTimestampMs - Event timestamp in milliseconds
 * @param fromTimestampMs - Filter timestamp threshold
 * @returns true if event should be filtered (skipped), false otherwise
 */
export function shouldFilterEventByTimestamp(
  eventTimestampMs: number | undefined,
  fromTimestampMs: number | undefined
): boolean {
  if (fromTimestampMs === undefined || eventTimestampMs === undefined) {
    return false;
  }
  return eventTimestampMs <= fromTimestampMs;
}

/**
 * Updates the latest timestamp tracker
 * @param eventTimestampMs - Event timestamp in milliseconds
 * @param currentLatestTimestampMs - Current latest timestamp value
 * @returns The updated latest timestamp
 */
export function updateLatestTimestamp(
  eventTimestampMs: number | undefined,
  currentLatestTimestampMs: number | undefined
): number | undefined {
  if (eventTimestampMs === undefined) {
    return currentLatestTimestampMs;
  }

  if (currentLatestTimestampMs === undefined || eventTimestampMs > currentLatestTimestampMs) {
    return eventTimestampMs;
  }

  return currentLatestTimestampMs;
}
