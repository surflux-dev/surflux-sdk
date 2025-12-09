import { isBrowser, isNodeJS } from './utils';

interface PathModule {
  resolve: (path: string) => string;
}

interface PathModuleWithJoin {
  join: (...paths: string[]) => string;
}

interface FsModule {
  existsSync: (path: string) => boolean;
}

interface FsModuleWithReadJson {
  readJsonSync: (path: string) => unknown;
}

/**
 * Safely requires a Node.js module, handling both require and eval scenarios
 */
function safeRequire(moduleName: string): unknown {
  if (typeof require !== 'undefined') {
    return require(moduleName);
  }
  try {
    const requireFunc = eval('require') as (module: string) => unknown;
    return requireFunc(moduleName);
  } catch {
    return null;
  }
}

/**
 * Safely resolves a file path using Node.js path module, with fallback for browser environments
 */
export function safePathResolve(pathStr: string): string {
  if (isBrowser() || !isNodeJS()) {
    return pathStr;
  }
  try {
    const pathModule = safeRequire('path') as PathModule | null;
    if (pathModule?.resolve && typeof pathModule.resolve === 'function') {
      return pathModule.resolve(pathStr);
    }
  } catch (error) {
    console.warn('Failed to resolve path, using as-is:', error);
  }
  return pathStr;
}

/**
 * Safely joins path segments using Node.js path module, with fallback for browser environments
 */
export function safePathJoin(...paths: string[]): string {
  if (isBrowser() || !isNodeJS()) {
    return paths.filter(Boolean).join('/').replace(/\/+/g, '/');
  }
  try {
    const pathModule = safeRequire('path') as PathModuleWithJoin | null;
    if (pathModule?.join && typeof pathModule.join === 'function') {
      return pathModule.join(...paths);
    }
  } catch (error) {
    console.warn('Failed to join path, using fallback:', error);
  }
  return paths.filter(Boolean).join('/').replace(/\/+/g, '/');
}

/**
 * Safely checks if a file exists using Node.js fs-extra module, returns false in browser environments
 */
export function safeFsExistsSync(filePath: string): boolean {
  if (isBrowser() || !isNodeJS()) {
    return false;
  }
  try {
    const fsModule = safeRequire('fs-extra') as FsModule | null;
    if (fsModule?.existsSync && typeof fsModule.existsSync === 'function') {
      return fsModule.existsSync(filePath);
    }
  } catch {
    // Silently fail in browser or if module is not available
  }
  return false;
}

/**
 * Safely reads a JSON file using Node.js fs-extra module, returns null in browser environments
 */
export function safeFsReadJsonSync(filePath: string): unknown {
  if (isBrowser() || !isNodeJS()) {
    return null;
  }
  try {
    const fsModule = safeRequire('fs-extra') as FsModuleWithReadJson | null;
    if (fsModule?.readJsonSync && typeof fsModule.readJsonSync === 'function') {
      return fsModule.readJsonSync(filePath);
    }
  } catch {
    // Silently fail in browser or if module is not available
  }
  return null;
}
