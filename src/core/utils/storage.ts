/**
 * Storage Utilities
 * Functions for localStorage and sessionStorage management
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface StorageOptions {
  prefix?: string;
  storage?: Storage;
  serializer?: {
    serialize: (value: unknown) => string;
    deserialize: (value: string) => unknown;
  };
}

export interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiry?: number;
}

// ============================================
// DEFAULT SERIALIZER
// ============================================

const defaultSerializer = {
  serialize: (value: unknown): string => {
    return JSON.stringify(value, (_key, val) => {
      if (val instanceof Date) {
        return { __type: 'Date', value: val.toISOString() };
      }
      if (val instanceof Map) {
        return { __type: 'Map', value: Array.from(val.entries()) };
      }
      if (val instanceof Set) {
        return { __type: 'Set', value: Array.from(val) };
      }
      return val;
    });
  },
  deserialize: (value: string): unknown => {
    return JSON.parse(value, (_, val) => {
      if (val && typeof val === 'object' && '__type' in val) {
        switch (val.__type) {
          case 'Date':
            return new Date(val.value);
          case 'Map':
            return new Map(val.value);
          case 'Set':
            return new Set(val.value);
        }
      }
      return val;
    });
  },
};

// ============================================
// STORAGE CLASS
// ============================================

/**
 * Enhanced storage wrapper with type safety and expiration
 */
export class StorageManager {
  private prefix: string;
  private storage: Storage;
  private serializer: typeof defaultSerializer;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || '';
    this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : new Map() as unknown as Storage);
    this.serializer = options.serializer || defaultSerializer;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  /**
   * Get item from storage
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const fullKey = this.getKey(key);
      const raw = this.storage.getItem(fullKey);

      if (raw === null) {
        return defaultValue;
      }

      const item = this.serializer.deserialize(raw) as StorageItem<T>;

      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key);
        return defaultValue;
      }

      return item.value;
    } catch (error) {
      console.error(`Error reading from storage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in storage
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    try {
      const fullKey = this.getKey(key);
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiry: ttlMs ? Date.now() + ttlMs : undefined,
      };

      this.storage.setItem(fullKey, this.serializer.serialize(item));
    } catch (error) {
      console.error(`Error writing to storage key "${key}":`, error);
      
      // Try to clear expired items and retry
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearExpired();
        try {
          const fullKey = this.getKey(key);
          const item: StorageItem<T> = {
            value,
            timestamp: Date.now(),
            expiry: ttlMs ? Date.now() + ttlMs : undefined,
          };
          this.storage.setItem(fullKey, this.serializer.serialize(item));
        } catch {
          console.error('Storage quota exceeded even after clearing expired items');
        }
      }
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string): void {
    const fullKey = this.getKey(key);
    this.storage.removeItem(fullKey);
  }

  /**
   * Check if key exists in storage
   */
  has(key: string): boolean {
    const fullKey = this.getKey(key);
    return this.storage.getItem(fullKey) !== null;
  }

  /**
   * Get all keys with prefix
   */
  keys(): string[] {
    const keys: string[] = [];
    const prefixLength = this.prefix ? this.prefix.length + 1 : 0;

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && (!this.prefix || key.startsWith(`${this.prefix}_`))) {
        keys.push(key.slice(prefixLength));
      }
    }

    return keys;
  }

  /**
   * Clear all items with prefix
   */
  clear(): void {
    if (!this.prefix) {
      this.storage.clear();
      return;
    }

    const keysToRemove = this.keys();
    keysToRemove.forEach(key => this.remove(key));
  }

  /**
   * Clear expired items
   */
  clearExpired(): void {
    const keys = this.keys();
    
    for (const key of keys) {
      try {
        const fullKey = this.getKey(key);
        const raw = this.storage.getItem(fullKey);
        
        if (raw) {
          const item = this.serializer.deserialize(raw) as StorageItem<unknown>;
          if (item.expiry && Date.now() > item.expiry) {
            this.remove(key);
          }
        }
      } catch {
        // Skip invalid items
      }
    }
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    let size = 0;
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && (!this.prefix || key.startsWith(`${this.prefix}_`))) {
        const value = this.storage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    }

    return size * 2; // UTF-16 encoding
  }

  /**
   * Get all items as object
   */
  getAll<T = unknown>(): Record<string, T> {
    const result: Record<string, T> = {};
    
    for (const key of this.keys()) {
      const value = this.get<T>(key);
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }
}

// ============================================
// SINGLETON INSTANCES
// ============================================

export const localStorageManager = new StorageManager({
  prefix: 'taskflow',
  storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
});

export const sessionStorageManager = new StorageManager({
  prefix: 'taskflow',
  storage: typeof sessionStorage !== 'undefined' ? sessionStorage : undefined,
});

// Friendly alias
export const storage = localStorageManager;

// ============================================
// SIMPLE FUNCTIONS
// ============================================

/**
 * Get item from localStorage
 */
export function getFromStorage<T>(key: string, defaultValue?: T): T | undefined {
  return localStorageManager.get<T>(key, defaultValue);
}

/**
 * Set item in localStorage
 */
export function setInStorage<T>(key: string, value: T, ttlMs?: number): void {
  localStorageManager.set(key, value, ttlMs);
}

/**
 * Remove item from localStorage
 */
export function removeFromStorage(key: string): void {
  localStorageManager.remove(key);
}

/**
 * Get item from sessionStorage
 */
export function getFromSession<T>(key: string, defaultValue?: T): T | undefined {
  return sessionStorageManager.get<T>(key, defaultValue);
}

/**
 * Set item in sessionStorage
 */
export function setInSession<T>(key: string, value: T): void {
  sessionStorageManager.set(key, value);
}

/**
 * Remove item from sessionStorage
 */
export function removeFromSession(key: string): void {
  sessionStorageManager.remove(key);
}

// ============================================
// COOKIE UTILITIES
// ============================================

export interface CookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Get cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const matches = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`)
  );
  
  return matches ? decodeURIComponent(matches[1]) : null;
}

/**
 * Set cookie
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === 'undefined') return;

  const {
    expires,
    path = '/',
    domain,
    secure = false,
    sameSite = 'lax',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    const expiryDate = typeof expires === 'number'
      ? new Date(Date.now() + expires)
      : expires;
    cookieString += `; expires=${expiryDate.toUTCString()}`;
  }

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  if (sameSite) {
    cookieString += `; samesite=${sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Remove cookie
 */
export function removeCookie(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  setCookie(name, '', { ...options, expires: new Date(0) });
}

/**
 * Get all cookies as object
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};

  return document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=').map(c => c.trim());
    if (name) {
      acc[decodeURIComponent(name)] = decodeURIComponent(value || '');
    }
    return acc;
  }, {} as Record<string, string>);
}

// ============================================
// INDEXED DB HELPERS
// ============================================

/**
 * Simple IndexedDB wrapper for larger data storage
 */
export class IndexedDBStore {
  private dbName: string;
  private storeName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, storeName: string, version = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result?.value);
      };
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ key, value });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async keys(): Promise<string[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string[]);
    });
  }
}

