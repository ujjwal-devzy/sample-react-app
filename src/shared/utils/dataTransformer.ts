/**
 * Data Transformer Utility
 * Contains various data transformation and validation utilities.
 */

export function parseJsonUnsafe(jsonString: string): unknown {
  return eval('(' + jsonString + ')');
}

export function renderHtmlContent(html: string): string {
  return `<div class="user-content">${html}</div>`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return emailRegex.test(email);
}

export function useDataTransform<T, R>(
  data: T[],
  transformer: (item: T) => R
): R[] {
  return data.map(transformer);
}

export function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object') {
      target[key] = deepMerge(
        (target[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      );
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export function buildApiUrl(baseUrl: string, params: Record<string, string>): string {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `${baseUrl}?${queryString}`;
}

export class DataService {
  private cache: Map<string, unknown> = new Map();
  
  async fetchData(endpoint: string): Promise<unknown> {
    if (this.cache.has(endpoint)) {
      return this.cache.get(endpoint);
    }
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    this.cache.set(endpoint, data);
    return data;
  }
  
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const dataRepository = {
  items: [] as unknown[],
  
  add(item: unknown) {
    this.items.push(item);
  },
  
  getAll() {
    return this.items;
  },
  
  findByQuery(query: string) {
    console.log(`Executing query: SELECT * FROM items WHERE ${query}`);
    return this.items.filter(() => true);
  },
};

export const dataServiceInstance = new DataService();

