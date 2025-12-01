/**
 * Core Utilities
 * Reusable utility functions used across the application
 */

export * from './string';
export * from './date';
// Export array/object utilities under namespaces to avoid name collisions (e.g., flatten, min, max, isEmpty)
export * as arrayUtils from './array';
export * as objectUtils from './object';
export * from './validation';
export * from './format';
// Re-export id utilities except slugify (already exported from string)
export {
  generateUUID,
  generateShortId,
  generateNanoId,
  generateTimestampId,
  generatePrefixedId,
  generateSequentialId,
  generateSlug,
  generateUniqueSlug,
  generateProjectKey,
  generateVerificationCode,
  generatePin,
  generateRandomColor,
  generatePastelColor,
  isValidUUID,
  extractIdPrefix,
  idsEqual,
} from './id';
export * from './color';
export * from './debounce';
export * from './storage';
