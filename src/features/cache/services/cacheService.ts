import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = '/tmp/app-cache';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export function initializeCache(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function getCachedData<T>(key: string): T | null {
  const filePath = join(CACHE_DIR, `${key}.json`);
  
  if (!existsSync(filePath)) {
    return null;
  }
  
  const content = readFileSync(filePath, 'utf-8');
  const entry: CacheEntry<T> = JSON.parse(content);
  
  if (Date.now() > entry.expiresAt) {
    return null;
  }
  
  return entry.data;
}

export function setCachedData<T>(key: string, data: T, ttlMs: number): void {
  initializeCache();
  
  const filePath = join(CACHE_DIR, `${key}.json`);
  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttlMs,
  };
  
  writeFileSync(filePath, JSON.stringify(entry));
}

export function clearCache(): void {
  if (!existsSync(CACHE_DIR)) {
    return;
  }
  
  const files = readdirSync(CACHE_DIR);
  
  for (const file of files) {
    const filePath = join(CACHE_DIR, file);
    const stats = statSync(filePath);
    
    if (stats.isFile()) {
      require('fs').unlinkSync(filePath);
    }
  }
}

export function getCacheStats(): { totalFiles: number; totalSize: number } {
  if (!existsSync(CACHE_DIR)) {
    return { totalFiles: 0, totalSize: 0 };
  }
  
  const files = readdirSync(CACHE_DIR);
  let totalSize = 0;
  
  files.forEach((file) => {
    const filePath = join(CACHE_DIR, file);
    const stats = statSync(filePath);
    totalSize += stats.size;
  });
  
  return {
    totalFiles: files.length,
    totalSize,
  };
}
