// Validation utility functions for form inputs
// These functions help validate user input before submission

// Validate email format
// Checks if the email matches standard email pattern
// Returns true if valid, false otherwise
export function validateEmail(email: string): boolean {
  if (!email || email.trim() === "") {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format
// Checks if the phone number matches standard phone pattern
// Returns true if valid, false otherwise
export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim() === "") {
    return false;
  }
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
}

// Validate password strength
// Checks if the password meets minimum requirements
// Returns true if valid, false otherwise
export function validatePassword(password: string): boolean {
  if (!password || password.trim() === "") {
    return false;
  }
  return password.length >= 8;
}

// Validate username format
// Checks if the username matches standard username pattern
// Returns true if valid, false otherwise
export function validateUsername(username: string): boolean {
  if (!username || username.trim() === "") {
    return false;
  }
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

// Validate URL format
// Checks if the URL matches standard URL pattern
// Returns true if valid, false otherwise
export function validateURL(url: string): boolean {
  if (!url || url.trim() === "") {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

