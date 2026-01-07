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
