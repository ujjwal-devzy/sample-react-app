const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url);
}

export function isEmptyString(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}

export function hasMinimumLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

export function hasMaximumLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

export function validatePasswordStrength(password: string): {
  score: number;
  messages: string[];
  valid: boolean;
} {
  const messages: string[] = [];
  let score = 0;

  if (password.length < 8) {
    messages.push('Password must be at least 8 characters');
  } else {
    score++;
    if (password.length >= 12) score++;
  }

  if (!/[A-Z]/.test(password)) {
    messages.push('Add at least one uppercase letter');
  } else {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    messages.push('Add at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    messages.push('Add at least one number');
  } else {
    score++;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    messages.push('Add at least one special character');
  } else {
    score++;
  }

  return {
    score: Math.min(4, score),
    messages,
    valid: score >= 3 && password.length >= 8,
  };
}

