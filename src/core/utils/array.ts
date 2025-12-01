/**
 * Array Utilities
 * Functions for array manipulation and transformation
 */

/**
 * Group array items by a key
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Create a lookup map from array by key
 */
export function keyBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T> {
  return array.reduce((acc, item) => {
    acc[keyFn(item)] = item;
    return acc;
  }, {} as Record<string, T>);
}

/**
 * Sort array by multiple fields
 */
export function sortBy<T>(
  array: T[],
  ...sortFns: Array<(item: T) => number | string | Date>
): T[] {
  return [...array].sort((a, b) => {
    for (const sortFn of sortFns) {
      const aVal = sortFn(a);
      const bVal = sortFn(b);
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

/**
 * Sort array by field with direction
 */
export function sortByField<T>(
  array: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Remove duplicates by key function
 */
export function uniqueBy<T>(array: T[], keyFn: (item: T) => unknown): T[] {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [];
  
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten nested array
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.flat() as T[];
}

/**
 * Deep flatten nested arrays
 */
export function flattenDeep<T>(array: unknown[]): T[] {
  return array.flat(Infinity) as T[];
}

/**
 * Get intersection of two arrays
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter(item => set2.has(item));
}

/**
 * Get difference between two arrays (items in arr1 not in arr2)
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter(item => !set2.has(item));
}

/**
 * Get union of two arrays
 */
export function union<T>(arr1: T[], arr2: T[]): T[] {
  return unique([...arr1, ...arr2]);
}

/**
 * Move item in array from one index to another
 */
export function moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Swap two items in array
 */
export function swapItems<T>(array: T[], index1: number, index2: number): T[] {
  const result = [...array];
  [result[index1], result[index2]] = [result[index2], result[index1]];
  return result;
}

/**
 * Insert item at specific index
 */
export function insertAt<T>(array: T[], index: number, item: T): T[] {
  return [...array.slice(0, index), item, ...array.slice(index)];
}

/**
 * Remove item at specific index
 */
export function removeAt<T>(array: T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

/**
 * Update item at specific index
 */
export function updateAt<T>(array: T[], index: number, item: T): T[] {
  return array.map((existing, i) => (i === index ? item : existing));
}

/**
 * Find item and index
 */
export function findWithIndex<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): { item: T; index: number } | null {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      return { item: array[i], index: i };
    }
  }
  return null;
}

/**
 * Partition array into two arrays based on predicate
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  for (const item of array) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  
  return [truthy, falsy];
}

/**
 * Get first item or default
 */
export function first<T>(array: T[], defaultValue?: T): T | undefined {
  return array.length > 0 ? array[0] : defaultValue;
}

/**
 * Get last item or default
 */
export function last<T>(array: T[], defaultValue?: T): T | undefined {
  return array.length > 0 ? array[array.length - 1] : defaultValue;
}

/**
 * Get random item from array
 */
export function sample<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random items from array
 */
export function sampleSize<T>(array: T[], size: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, size);
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Sum array of numbers
 */
export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0);
}

/**
 * Sum array by key
 */
export function sumBy<T>(array: T[], keyFn: (item: T) => number): number {
  return array.reduce((acc, item) => acc + keyFn(item), 0);
}

/**
 * Get average of array of numbers
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}

/**
 * Get min value from array
 */
export function min(array: number[]): number | undefined {
  if (array.length === 0) return undefined;
  return Math.min(...array);
}

/**
 * Get max value from array
 */
export function max(array: number[]): number | undefined {
  if (array.length === 0) return undefined;
  return Math.max(...array);
}

/**
 * Get min by key
 */
export function minBy<T>(array: T[], keyFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  return array.reduce((min, item) => (keyFn(item) < keyFn(min) ? item : min));
}

/**
 * Get max by key
 */
export function maxBy<T>(array: T[], keyFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  return array.reduce((max, item) => (keyFn(item) > keyFn(max) ? item : max));
}

/**
 * Count occurrences of each value
 */
export function countBy<T>(array: T[], keyFn: (item: T) => string): Record<string, number> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Compact array (remove falsy values)
 */
export function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[] {
  return array.filter(Boolean) as T[];
}

/**
 * Range function to create array of numbers
 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Create array filled with value
 */
export function fill<T>(length: number, value: T | ((index: number) => T)): T[] {
  return Array.from({ length }, (_, i) => 
    typeof value === 'function' ? (value as (index: number) => T)(i) : value
  );
}

/**
 * Zip multiple arrays together
 */
export function zip<T>(...arrays: T[][]): T[][] {
  const maxLength = Math.max(...arrays.map(arr => arr.length));
  return Array.from({ length: maxLength }, (_, i) => 
    arrays.map(arr => arr[i])
  );
}

/**
 * Check if arrays are equal
 */
export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
}

/**
 * Deep compare arrays
 */
export function arraysDeepEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => 
    JSON.stringify(item) === JSON.stringify(arr2[index])
  );
}

