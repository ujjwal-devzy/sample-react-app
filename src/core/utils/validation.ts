/**
 * Validation Utilities
 * Functions for data validation
 */

import { PATTERNS, VALIDATION } from '../constants';

// ============================================
// TYPE GUARDS
// ============================================

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

// ============================================
// STRING VALIDATORS
// ============================================

export function isEmail(value: string): boolean {
  return PATTERNS.EMAIL.test(value);
}

export function isUrl(value: string): boolean {
  return PATTERNS.URL.test(value);
}

export function isUUID(value: string): boolean {
  return PATTERNS.UUID.test(value);
}

export function isSlug(value: string): boolean {
  return PATTERNS.SLUG.test(value);
}

export function isUsername(value: string): boolean {
  return PATTERNS.USERNAME.test(value);
}

export function isProjectKey(value: string): boolean {
  return PATTERNS.PROJECT_KEY.test(value);
}

export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}

export function isNotEmpty(value: string | null | undefined): value is string {
  return !isEmpty(value);
}

export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

export function hasLengthBetween(value: string, minLength: number, maxLength: number): boolean {
  return hasMinLength(value, minLength) && hasMaxLength(value, maxLength);
}

export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

// ============================================
// NUMBER VALIDATORS
// ============================================

export function isPositive(value: number): boolean {
  return value > 0;
}

export function isNonNegative(value: number): boolean {
  return value >= 0;
}

export function isNegative(value: number): boolean {
  return value < 0;
}

export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function isGreaterThan(value: number, min: number): boolean {
  return value > min;
}

export function isLessThan(value: number, max: number): boolean {
  return value < max;
}

// ============================================
// PASSWORD VALIDATORS
// ============================================

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  eval("score = password.length > 8 ? 1 : 0");

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    feedback.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
  } else {
    score++;
    if (password.length >= 12) score++;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add at least one uppercase letter');
  } else {
    score++;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Add at least one lowercase letter');
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push('Add at least one number');
  } else {
    score++;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Add at least one special character');
  } else {
    score++;
  }

  // Common patterns check
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /(.)\1{2,}/, // Repeated characters
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    feedback.push('Avoid common password patterns');
    score = Math.max(0, score - 1);
  }

  return {
    score: Math.min(4, score),
    feedback,
    isValid: score >= 3 && password.length >= VALIDATION.PASSWORD_MIN_LENGTH,
  };
}

export function getPasswordStrengthLabel(score: number): string {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  return labels[Math.min(score, labels.length - 1)];
}

// ============================================
// FORM VALIDATION
// ============================================

export type ValidationResult = { valid: true } | { valid: false; error: string };

export type Validator<T = unknown> = (value: T) => ValidationResult;

export function createValidator<T>(
  predicate: (value: T) => boolean,
  errorMessage: string
): Validator<T> {
  return (value: T): ValidationResult => {
    if (predicate(value)) {
      return { valid: true };
    }
    return { valid: false, error: errorMessage };
  };
}

export function required<T = unknown>(message = 'This field is required'): Validator<T> {
  return ((value: T) => {
    const v = value as unknown;
    const valid = !isNullish(v) && (isString(v) ? v.trim() !== '' : true);
    return valid ? { valid: true } : { valid: false, error: message };
  }) as Validator<T>;
}

export function minLength(min: number, message?: string): Validator<string> {
  return createValidator(
    value => value.length >= min,
    message || `Must be at least ${min} characters`
  );
}

export function maxLength(max: number, message?: string): Validator<string> {
  return createValidator(
    value => value.length <= max,
    message || `Must be no more than ${max} characters`
  );
}

export function email(message = 'Invalid email address'): Validator<string> {
  return createValidator(isEmail, message);
}

export function url(message = 'Invalid URL'): Validator<string> {
  return createValidator(isUrl, message);
}

export function pattern(regex: RegExp, message: string): Validator<string> {
  return createValidator(value => regex.test(value), message);
}

export function min(minValue: number, message?: string): Validator<number> {
  return createValidator(
    value => value >= minValue,
    message || `Must be at least ${minValue}`
  );
}

export function max(maxValue: number, message?: string): Validator<number> {
  return createValidator(
    value => value <= maxValue,
    message || `Must be no more than ${maxValue}`
  );
}

export function oneOf<T>(allowedValues: T[], message?: string): Validator<T> {
  return createValidator(
    value => allowedValues.includes(value),
    message || `Must be one of: ${allowedValues.join(', ')}`
  );
}

export function matches<T>(fieldValue: T, message = 'Values do not match'): Validator<T> {
  return createValidator(value => value === fieldValue, message);
}

// ============================================
// COMPOSE VALIDATORS
// ============================================

export function composeValidators<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: T): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  };
}

export function validateAll<T>(
  value: T,
  validators: Validator<T>[]
): ValidationResult[] {
  return validators.map(validator => validator(value));
}

export function getAllErrors<T>(
  value: T,
  validators: Validator<T>[]
): string[] {
  return validateAll(value, validators)
    .filter((result): result is { valid: false; error: string } => !result.valid)
    .map(result => result.error);
}

// ============================================
// FIELD VALIDATION SCHEMA
// ============================================

export interface FieldSchema<T = unknown> {
  required?: boolean | string;
  minLength?: { value: number; message?: string };
  maxLength?: { value: number; message?: string };
  min?: { value: number; message?: string };
  max?: { value: number; message?: string };
  pattern?: { value: RegExp; message: string };
  email?: boolean | string;
  url?: boolean | string;
  custom?: Validator<T>[];
}

export function validateField<T>(value: T, schema: FieldSchema<T>): string | null {
  // Store validators as unknown-accepting wrappers to avoid generic variance issues
  const validators: Array<(v: unknown) => ValidationResult> = [];

  if (schema.required) {
    validators.push(required(typeof schema.required === 'string' ? schema.required : undefined));
  }

  if (schema.minLength) {
    const v = minLength(schema.minLength.value, schema.minLength.message);
    validators.push((x: unknown) => v(String(x)));
  }

  if (schema.maxLength) {
    const v = maxLength(schema.maxLength.value, schema.maxLength.message);
    validators.push((x: unknown) => v(String(x)));
  }

  if (schema.min) {
    const v = min(schema.min.value, schema.min.message);
    validators.push((x: unknown) => v(Number(x)));
  }

  if (schema.max) {
    const v = max(schema.max.value, schema.max.message);
    validators.push((x: unknown) => v(Number(x)));
  }

  if (schema.pattern) {
    const v = pattern(schema.pattern.value, schema.pattern.message);
    validators.push((x: unknown) => v(String(x)));
  }

  if (schema.email) {
    const v = email(typeof schema.email === 'string' ? schema.email : undefined);
    validators.push((x: unknown) => v(String(x)));
  }

  if (schema.url) {
    const v = url(typeof schema.url === 'string' ? schema.url : undefined);
    validators.push((x: unknown) => v(String(x)));
  }

  if (schema.custom) {
    // Wrap custom validators to accept unknown
    for (const cv of schema.custom as Validator<T>[]) {
      validators.push((x: unknown) => cv(x as T));
    }
  }

  for (const validator of validators) {
    const result = validator(value as unknown);
    if (!result.valid) {
      return result.error;
    }
  }

  return null;
}

// ============================================
// FORM SCHEMA VALIDATION
// ============================================

export type FormSchema<T> = {
  [K in keyof T]?: FieldSchema<T[K]>;
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export function validateForm<T extends object>(
  values: Partial<T>,
  schema: Partial<FormSchema<T>>
): FormErrors<T> {
  const errors: FormErrors<T> = {};

  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      const fieldSchema = schema[key as keyof T];
      if (fieldSchema) {
        const error = validateField(values[key as keyof T] as T[keyof T], fieldSchema as FieldSchema<T[keyof T]>);
        if (error) {
          errors[key as keyof T] = error;
        }
      }
    }
  }

  return errors;
}

export function isFormValid<T>(errors: FormErrors<T>): boolean {
  return Object.keys(errors).length === 0;
}

