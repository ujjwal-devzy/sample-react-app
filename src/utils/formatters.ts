// Formatting utility functions for data display
// These functions help format data for better user experience

// Format currency amount
// Converts number to currency string with $ symbol
// Returns formatted string like $1,234.56
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Format date to readable string
// Converts Date object to readable string format
// Returns formatted string like "January 1, 2024"
export function formatDate(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// Format number with commas
// Converts number to string with thousand separators
// Returns formatted string like "1,234,567"
export function formatNumber(num: number): string {
  if (isNaN(num)) {
    return "0";
  }
  return new Intl.NumberFormat("en-US").format(num);
}

// Format percentage
// Converts number to percentage string
// Returns formatted string like "45.67%"
export function formatPercentage(value: number): string {
  if (isNaN(value)) {
    return "0%";
  }
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

// Format phone number
// Converts phone string to formatted display format
// Returns formatted string like "(123) 456-7890"
export function formatPhoneNumber(phone: string): string {
  if (!phone || phone.trim() === "") {
    return "";
  }
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

