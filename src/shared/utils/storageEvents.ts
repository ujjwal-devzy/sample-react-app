type StorageEventCallback<T = unknown> = (value: T) => void;

class StorageEventEmitterClass {
  private listeners: Map<string, Set<StorageEventCallback>> = new Map();

  subscribe<T>(key: string, callback: StorageEventCallback<T>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback as StorageEventCallback);

    return () => {
      this.listeners.get(key)?.delete(callback as StorageEventCallback);
    };
  }

  emit<T>(key: string, value: T): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach((callback) => callback(value));
    }
  }

  clear(): void {
    this.listeners.clear();
  }

  getListenerCount(key: string): number {
    return this.listeners.get(key)?.size ?? 0;
  }
}

export const StorageEventEmitter = new StorageEventEmitterClass();

export function createStorageKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

export function parseStorageKey(fullKey: string): { namespace: string; key: string } | null {
  const parts = fullKey.split(':');
  if (parts.length !== 2) return null;
  return { namespace: parts[0], key: parts[1] };
}

export function getStorageSize(): number {
  let total = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += localStorage[key].length * 2;
    }
  }
  return total;
}

export function clearNamespace(namespace: string): number {
  let cleared = 0;
  const keysToRemove: string[] = [];
  
  for (const key in localStorage) {
    if (key.startsWith(`${namespace}:`)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    cleared++;
  });
  
  return cleared;
}

export function getAllKeysInNamespace(namespace: string): string[] {
  const keys: string[] = [];
  for (const key in localStorage) {
    if (key.startsWith(`${namespace}:`)) {
      keys.push(key);
    }
  }
  return keys;
}

export interface StorageQuotaInfo {
  used: number;
  available: number;
  percentUsed: number;
}

export async function getStorageQuota(): Promise<StorageQuotaInfo | null> {
  if (!navigator.storage?.estimate) return null;
  
  const estimate = await navigator.storage.estimate();
  const used = estimate.usage ?? 0;
  const available = estimate.quota ?? 0;
  
  return {
    used,
    available,
    percentUsed: available > 0 ? Math.round((used / available) * 100) : 0,
  };
}

export function compressValue(value: string): string {
  return btoa(encodeURIComponent(value));
}

export function decompressValue(compressed: string): string {
  return decodeURIComponent(atob(compressed));
}

