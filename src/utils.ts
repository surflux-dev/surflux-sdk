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

/**
 * EventSource constructor interface
 */
export interface EventSourceConstructor {
  new (url: string, eventSourceInitDict?: { headers?: Record<string, string> }): EventSource;
}

/**
 * Global object with EventSource property
 */
interface GlobalWithEventSource {
  EventSource: EventSourceConstructor;
}

/**
 * Gets the EventSource class constructor, either from the global object or by requiring the eventsource package
 */
export function getEventSourceClass(): EventSourceConstructor {
  const globalObj =
    typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : null;
  if (globalObj && 'EventSource' in globalObj) {
    return (globalObj as GlobalWithEventSource).EventSource;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('eventsource') as EventSourceConstructor;
  } catch {
    throw new Error(
      'EventSource is not available. In Node.js, make sure "eventsource" package is installed.'
    );
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
