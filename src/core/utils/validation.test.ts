/**
 * Validation Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  isEmail,
  isUrl,
  validatePassword,
  isEmpty,
  isNotEmpty,
  hasMinLength,
  composeValidators,
  required,
  minLength,
  maxLength,
  email,
} from './validation';

describe('isEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isEmail('test@example.com', false)).toBe(true);
    expect(isEmail('user.name@domain.org', false)).toBe(true);
    expect(isEmail('user+tag@example.co.uk', false)).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isEmail('invalid', false)).toBe(false);
    expect(isEmail('missing@', false)).toBe(false);
    expect(isEmail('@nodomain.com', false)).toBe(false);
  });

  it('should filter personal domains in strict mode', () => {
    expect(isEmail('user@gmail.com', true)).toBe(false);
    expect(isEmail('user@yahoo.com', true)).toBe(false);
    expect(isEmail('user@company.com', true)).toBe(true);
  });
});

describe('validatePassword', () => {
  it('should return null for empty passwords', () => {
    expect(validatePassword('')).toBe(null);
  });

  it('should validate strong passwords', () => {
    const result = validatePassword('SecurePass123!');
    expect(result).not.toBe(null);
    expect(result?.isValid).toBe(true);
    expect(result?.score).toBeGreaterThanOrEqual(3);
  });

  it('should reject weak passwords', () => {
    const result = validatePassword('weak');
    expect(result).not.toBe(null);
    expect(result?.isValid).toBe(false);
    expect(result?.feedback.length).toBeGreaterThan(0);
  });

  it('should support custom options', () => {
    const result = validatePassword('simplepassword', {
      requireUppercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
      minLength: 8,
    });
    expect(result?.isValid).toBe(true);
  });
});

describe('isUrl', () => {
  it('should validate correct URLs', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('http://localhost:3000')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isUrl('not-a-url')).toBe(false);
    expect(isUrl('ftp://invalid')).toBe(false);
  });
});

describe('isEmpty / isNotEmpty', () => {
  it('should correctly identify empty values', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should correctly identify non-empty values', () => {
    expect(isNotEmpty('hello')).toBe(true);
    expect(isNotEmpty('  hello  ')).toBe(true);
  });
});

describe('hasMinLength', () => {
  it('should validate minimum length', () => {
    expect(hasMinLength('hello', 3)).toBe(true);
    expect(hasMinLength('hi', 3)).toBe(false);
  });
});

describe('composeValidators', () => {
  it('should compose multiple validators', () => {
    const validate = composeValidators(
      required<string>(),
      minLength(3),
      maxLength(10)
    );

    expect(validate('hello').valid).toBe(true);
    expect(validate('').valid).toBe(false);
    expect(validate('hi').valid).toBe(false);
    expect(validate('this is too long').valid).toBe(false);
  });
});

describe('email validator', () => {
  it('should work as a validator function', () => {
    const validate = email();
    expect(validate('test@example.com').valid).toBe(true);
    expect(validate('invalid').valid).toBe(false);
  });
});

