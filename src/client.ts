function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

function isNodeJS(): boolean {
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
}

interface PathModule {
  resolve: (path: string) => string;
}

function safePathResolve(pathStr: string): string {
  if (isBrowser() || !isNodeJS()) {
    return pathStr;
  }
  try {
    let pathModule: PathModule | null = null;
    if (typeof require !== 'undefined') {
      pathModule = require('path') as PathModule;
    } else {
      try {
        const requireFunc = eval('require') as (module: string) => unknown;
        pathModule = requireFunc('path') as PathModule;
      } catch {
        return pathStr;
      }
    }
    if (pathModule && pathModule.resolve && typeof pathModule.resolve === 'function') {
      return pathModule.resolve(pathStr);
    }
  } catch (error) {
    console.warn('Failed to resolve path, using as-is:', error);
  }
  return pathStr;
}

interface PathModuleWithJoin {
  join: (...paths: string[]) => string;
}

function safePathJoin(...paths: string[]): string {
  if (isBrowser() || !isNodeJS()) {
    return paths.filter(Boolean).join('/').replace(/\/+/g, '/');
  }
  try {
    let pathModule: PathModuleWithJoin | null = null;
    if (typeof require !== 'undefined') {
      pathModule = require('path') as PathModuleWithJoin;
    } else {
      try {
        const requireFunc = eval('require') as (module: string) => unknown;
        pathModule = requireFunc('path') as PathModuleWithJoin;
      } catch {
        return paths.filter(Boolean).join('/').replace(/\/+/g, '/');
      }
    }
    if (pathModule && pathModule.join && typeof pathModule.join === 'function') {
      return pathModule.join(...paths);
    }
  } catch (error) {
    console.warn('Failed to join path, using fallback:', error);
  }
  return paths.filter(Boolean).join('/').replace(/\/+/g, '/');
}

interface FsModule {
  existsSync: (path: string) => boolean;
}

function safeFsExistsSync(filePath: string): boolean {
  if (isBrowser() || !isNodeJS()) {
    return false;
  }
  try {
    let fsModule: FsModule | null = null;
    if (typeof require !== 'undefined') {
      fsModule = require('fs-extra') as FsModule;
    } else {
      try {
        const requireFunc = eval('require') as (module: string) => unknown;
        fsModule = requireFunc('fs-extra') as FsModule;
      } catch {
        return false;
      }
    }
    if (fsModule && fsModule.existsSync && typeof fsModule.existsSync === 'function') {
      return fsModule.existsSync(filePath);
    }
  } catch {
    return false;
  }
  return false;
}

interface FsModuleWithReadJson {
  readJsonSync: (path: string) => unknown;
}

function safeFsReadJsonSync(filePath: string): unknown {
  if (isBrowser() || !isNodeJS()) {
    return null;
  }
  try {
    let fsModule: FsModuleWithReadJson | null = null;
    if (typeof require !== 'undefined') {
      fsModule = require('fs-extra') as FsModuleWithReadJson;
    } else {
      try {
        const requireFunc = eval('require') as (module: string) => unknown;
        fsModule = requireFunc('fs-extra') as FsModuleWithReadJson;
      } catch {
        return null;
      }
    }
    if (fsModule && fsModule.readJsonSync && typeof fsModule.readJsonSync === 'function') {
      return fsModule.readJsonSync(filePath);
    }
  } catch {
    return null;
  }
  return null;
}

interface EventSourceConstructor {
  new (url: string, eventSourceInitDict?: { headers?: Record<string, string> }): EventSource;
}

interface GlobalWithEventSource {
  EventSource: EventSourceConstructor;
}

function getEventSourceClass(): EventSourceConstructor {
  const globalObj =
    typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : null;
  if (globalObj && 'EventSource' in globalObj) {
    return (globalObj as GlobalWithEventSource).EventSource;
  }

  try {
    return require('eventsource') as EventSourceConstructor;
  } catch (e) {
    throw new Error(
      'EventSource is not available. In Node.js, make sure "eventsource" package is installed.'
    );
  }
}

const EventSourceClass = getEventSourceClass();

interface SurfluxEvent {
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

interface FullPackageEvent {
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

interface EventHandler<T = unknown> {
  (event: T): void;
}

export class SurfluxPackageEventsClient {
  private apiKey: string;
  private packageId: string;
  private network: string;
  private eventSource: EventSource | null = null;
  private subscriptions: Map<string, EventHandler<unknown>[]> = new Map();
  private isConnected: boolean = false;
  private generatedTypesPath: string;

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

      const baseUrl =
        this.network === 'mainnet' ? 'https://flux.surflux.dev' : 'https://testnet-flux.surflux.dev';
      const SSE_URL = `${baseUrl}/events?api-key=${this.apiKey}`;

      const globalObj =
        typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : null;
      const isBrowser = globalObj && 'EventSource' in globalObj;

      if (isBrowser) {
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
      if (pattern.includes('*') && this.matchesPattern(event.type, pattern)) {
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

  private matchesPattern(eventType: string, pattern: string): boolean {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(eventType);
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

  onAll(handler: EventHandler<SurfluxEvent>): void {
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
