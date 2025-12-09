import {
  getEventSourceClass,
  isBrowser,
  isEventSourceAvailable,
  matchesPattern,
  type EventHandler,
} from './utils';
import { safePathResolve, safePathJoin, safeFsExistsSync, safeFsReadJsonSync } from './fs-utils';
import { getFluxBaseUrl } from './constants';

const EventSourceClass = getEventSourceClass();

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
 * Client for receiving real-time package events from Surflux.
 * Provides methods to subscribe to events, handle event streams, and manage connections.
 */
export class SurfluxPackageEventsClient {
  private readonly apiKey: string;
  private readonly packageId: string;
  private readonly network: string;
  private readonly generatedTypesPath: string;
  private eventSource: EventSource | null = null;
  private subscriptions: Map<string, EventHandler<unknown>[]> = new Map();
  private isConnected: boolean = false;

  constructor(
    apiKey: string,
    packageId: string,
    generatedTypesPath: string = './sui-events',
    network: string = 'testnet'
  ) {
    this.apiKey = apiKey;
    this.packageId = packageId;
    this.network = network;
    this.generatedTypesPath = generatedTypesPath;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      const baseUrl = getFluxBaseUrl(this.network);
      const SSE_URL = `${baseUrl}/events?api-key=${this.apiKey}`;

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
          console.log('Connected to Surflux event stream');
          this.isConnected = true;
          resolve();
        };

        this.eventSource.onmessage = (event: MessageEvent) => {
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

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      console.log('Disconnected from event stream');
    }
  }

  private handleEvent(event: SurfluxEvent, fullPackageEvent?: SurfluxPackageEvent): void {
    if (!event.type) return;

    if (!event.type.includes(this.packageId)) {
      return;
    }

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
    if (isBrowser()) {
      this.on(eventTypeName, handler);
      return;
    }

    try {
      const resolvedPath = safePathResolve(this.generatedTypesPath);
      if (!resolvedPath) {
        this.on(eventTypeName, handler);
        return;
      }

      const packageInfoPath = safePathJoin(resolvedPath, 'package-info.json');
      if (!packageInfoPath) {
        this.on(eventTypeName, handler);
        return;
      }

      if (safeFsExistsSync(packageInfoPath)) {
        const packageInfo = safeFsReadJsonSync(packageInfoPath);

        if (
          packageInfo &&
          typeof packageInfo === 'object' &&
          'packageId' in packageInfo &&
          typeof packageInfo.packageId === 'string'
        ) {
          const typesPath = safePathJoin(resolvedPath, 'types.ts');
          if (safeFsExistsSync(typesPath)) {
            const fullEventTypePattern = `${packageInfo.packageId}::*::${eventTypeName}`;
            this.on(fullEventTypePattern, handler);
          }

          this.on(eventTypeName, handler);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load types from filesystem, using event name only:', error);
    }

    this.on(eventTypeName, handler);
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
