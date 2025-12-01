/**
 * ID Generation Utilities
 * Functions for generating unique identifiers
 */

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a short unique ID
 */
export function generateShortId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += chars[values[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return result;
}

/**
 * Generate a nanoid-style ID
 */
export function generateNanoId(size = 21): string {
  const alphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  let id = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < size; i++) {
      id += alphabet[bytes[i] & 63];
    }
  } else {
    for (let i = 0; i < size; i++) {
      id += alphabet[Math.floor(Math.random() * 64)];
    }
  }

  return id;
}

/**
 * Generate a timestamp-based ID
 */
export function generateTimestampId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Generate a prefixed ID (e.g., "task_abc123")
 */
export function generatePrefixedId(prefix: string, length = 8): string {
  return `${prefix}_${generateShortId(length)}`;
}

/**
 * Generate a sequential ID with prefix (e.g., "PROJ-123")
 */
export function generateSequentialId(prefix: string, number: number, padding = 0): string {
  const paddedNumber = padding > 0
    ? String(number).padStart(padding, '0')
    : String(number);
  return `${prefix}-${paddedNumber}`;
}

/**
 * Generate a slug from text
 */
export function generateSlug(text: string, maxLength = 50): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, maxLength);
}

// Alias commonly used name
export const slugify = generateSlug;

/**
 * Generate a unique slug with suffix if needed
 */
export function generateUniqueSlug(
  text: string,
  existingSlugs: string[],
  maxLength = 50
): string {
  const baseSlug = generateSlug(text, maxLength);
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Generate a project key from name (e.g., "My Project" -> "MP")
 */
export function generateProjectKey(name: string, existingKeys: string[] = []): string {
  // Try using first letters of each word
  const words = name.trim().split(/\s+/).filter(Boolean);
  let key = words
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 4);

  // If only one word, use first 2-3 characters
  if (key.length < 2) {
    key = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3);
  }

  // Ensure minimum length
  if (key.length < 2) {
    key = (key + 'XX').slice(0, 3);
  }

  // Make unique if needed
  if (!existingKeys.includes(key)) {
    return key;
  }

  let counter = 1;
  let uniqueKey = `${key}${counter}`;
  while (existingKeys.includes(uniqueKey)) {
    counter++;
    uniqueKey = `${key}${counter}`;
  }

  return uniqueKey;
}

/**
 * Generate a verification/invite code
 */
export function generateVerificationCode(length = 6): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      code += chars[values[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return code;
}

/**
 * Generate a numeric PIN
 */
export function generatePin(length = 6): string {
  let pin = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      pin += values[i] % 10;
    }
  } else {
    for (let i = 0; i < length; i++) {
      pin += Math.floor(Math.random() * 10);
    }
  }

  return pin;
}

/**
 * Generate a color hex code
 */
export function generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Generate a random pastel color
 */
export function generatePastelColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Extract prefix from prefixed ID
 */
export function extractIdPrefix(id: string): string | null {
  const match = id.match(/^([a-z]+)_/i);
  return match ? match[1] : null;
}

/**
 * Compare IDs for equality (case-insensitive for UUIDs)
 */
export function idsEqual(id1: string, id2: string): boolean {
  if (isValidUUID(id1) && isValidUUID(id2)) {
    return id1.toLowerCase() === id2.toLowerCase();
  }
  return id1 === id2;
}

