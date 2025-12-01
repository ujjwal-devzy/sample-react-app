/**
 * Date Utilities
 * Functions for date manipulation and formatting
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type DateInput = Date | string | number;

export interface RelativeTimeOptions {
  addSuffix?: boolean;
  includeSeconds?: boolean;
}

export interface DateRangeResult {
  start: Date;
  end: Date;
}

// ============================================
// PARSING & CONVERSION
// ============================================

/**
 * Parse any date input into a Date object
 */
export function parseDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  return new Date(input);
}

/**
 * Convert date to ISO string
 */
export function toISOString(input: DateInput): string {
  return parseDate(input).toISOString();
}

/**
 * Convert date to Unix timestamp (seconds)
 */
export function toUnixTimestamp(input: DateInput): number {
  return Math.floor(parseDate(input).getTime() / 1000);
}

/**
 * Convert Unix timestamp to Date
 */
export function fromUnixTimestamp(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

// ============================================
// FORMATTING
// ============================================

/**
 * Format date with locale support
 */
export function formatDate(
  input: DateInput,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale = 'en-US'
): string {
  return parseDate(input).toLocaleDateString(locale, options);
}

/**
 * Format time with locale support
 */
export function formatTime(
  input: DateInput,
  options: Intl.DateTimeFormatOptions = { timeStyle: 'short' },
  locale = 'en-US'
): string {
  return parseDate(input).toLocaleTimeString(locale, options);
}

/**
 * Format datetime with locale support
 */
export function formatDateTime(
  input: DateInput,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
  locale = 'en-US'
): string {
  return parseDate(input).toLocaleString(locale, options);
}

/**
 * Format date as relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(input: DateInput, baseDate: DateInput = new Date()): string {
  const date = parseDate(input);
  const base = parseDate(baseDate);
  const diffMs = date.getTime() - base.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) {
    return rtf.format(diffSec, 'second');
  }
  if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, 'minute');
  }
  if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, 'hour');
  }
  if (Math.abs(diffDay) < 7) {
    return rtf.format(diffDay, 'day');
  }
  if (Math.abs(diffWeek) < 4) {
    return rtf.format(diffWeek, 'week');
  }
  if (Math.abs(diffMonth) < 12) {
    return rtf.format(diffMonth, 'month');
  }
  return rtf.format(diffYear, 'year');
}

/**
 * Format duration in human readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Format date for task due display
 */
export function formatDueDate(input: DateInput): string {
  const date = parseDate(input);
  const now = new Date();
  const diff = diffInDays(now, date);

  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  if (diff > 0 && diff < 7) return formatDate(date, { weekday: 'long' });
  if (diff < 0 && diff > -7) return `${Math.abs(diff)} days ago`;
  
  const isSameYear = date.getFullYear() === now.getFullYear();
  return formatDate(date, {
    month: 'short',
    day: 'numeric',
    year: isSameYear ? undefined : 'numeric',
  });
}

// ============================================
// COMPARISON & CHECKS
// ============================================

/**
 * Check if a date is today
 */
export function isToday(input: DateInput): boolean {
  const date = parseDate(input);
  const today = new Date();
  return isSameDay(date, today);
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(input: DateInput): boolean {
  const date = parseDate(input);
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(date, tomorrow);
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(input: DateInput): boolean {
  const date = parseDate(input);
  const yesterday = addDays(new Date(), -1);
  return isSameDay(date, yesterday);
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: DateInput, date2: DateInput): boolean {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Check if two dates are in the same week
 */
export function isSameWeek(date1: DateInput, date2: DateInput): boolean {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const startOfWeek1 = getStartOfWeek(d1);
  const startOfWeek2 = getStartOfWeek(d2);
  return isSameDay(startOfWeek1, startOfWeek2);
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(date1: DateInput, date2: DateInput): boolean {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

/**
 * Check if a date is in the past
 */
export function isPast(input: DateInput): boolean {
  return parseDate(input) < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFuture(input: DateInput): boolean {
  return parseDate(input) > new Date();
}

/**
 * Check if a date is between two dates
 */
export function isBetween(input: DateInput, start: DateInput, end: DateInput): boolean {
  const date = parseDate(input);
  return date >= parseDate(start) && date <= parseDate(end);
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(input: DateInput): boolean {
  const day = parseDate(input).getDay();
  return day === 0 || day === 6;
}

/**
 * Check if a date is a weekday
 */
export function isWeekday(input: DateInput): boolean {
  return !isWeekend(input);
}

// ============================================
// MANIPULATION
// ============================================

/**
 * Add days to a date
 */
export function addDays(input: DateInput, days: number): Date {
  const date = parseDate(input);
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add weeks to a date
 */
export function addWeeks(input: DateInput, weeks: number): Date {
  return addDays(input, weeks * 7);
}

/**
 * Add months to a date
 */
export function addMonths(input: DateInput, months: number): Date {
  const date = parseDate(input);
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 */
export function addYears(input: DateInput, years: number): Date {
  const date = parseDate(input);
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Add hours to a date
 */
export function addHours(input: DateInput, hours: number): Date {
  const date = parseDate(input);
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add minutes to a date
 */
export function addMinutes(input: DateInput, minutes: number): Date {
  const date = parseDate(input);
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Subtract days from a date
 */
export function subtractDays(input: DateInput, days: number): Date {
  return addDays(input, -days);
}

// ============================================
// DIFFERENCE CALCULATIONS
// ============================================

/**
 * Get difference in milliseconds between two dates
 */
export function diffInMs(date1: DateInput, date2: DateInput): number {
  return parseDate(date1).getTime() - parseDate(date2).getTime();
}

/**
 * Get difference in seconds between two dates
 */
export function diffInSeconds(date1: DateInput, date2: DateInput): number {
  return Math.floor(diffInMs(date1, date2) / 1000);
}

/**
 * Get difference in minutes between two dates
 */
export function diffInMinutes(date1: DateInput, date2: DateInput): number {
  return Math.floor(diffInMs(date1, date2) / (1000 * 60));
}

/**
 * Get difference in hours between two dates
 */
export function diffInHours(date1: DateInput, date2: DateInput): number {
  return Math.floor(diffInMs(date1, date2) / (1000 * 60 * 60));
}

/**
 * Get difference in days between two dates
 */
export function diffInDays(date1: DateInput, date2: DateInput): number {
  return Math.floor(diffInMs(date1, date2) / (1000 * 60 * 60 * 24));
}

/**
 * Get difference in weeks between two dates
 */
export function diffInWeeks(date1: DateInput, date2: DateInput): number {
  return Math.floor(diffInDays(date1, date2) / 7);
}

/**
 * Get difference in months between two dates
 */
export function diffInMonths(date1: DateInput, date2: DateInput): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
}

// ============================================
// BOUNDARIES
// ============================================

/**
 * Get start of day
 */
export function getStartOfDay(input: DateInput): Date {
  const date = parseDate(input);
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function getEndOfDay(input: DateInput): Date {
  const date = parseDate(input);
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of week (Sunday)
 */
export function getStartOfWeek(input: DateInput): Date {
  const date = parseDate(input);
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of week (Saturday)
 */
export function getEndOfWeek(input: DateInput): Date {
  const date = parseDate(input);
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (6 - day));
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of month
 */
export function getStartOfMonth(input: DateInput): Date {
  const date = parseDate(input);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get end of month
 */
export function getEndOfMonth(input: DateInput): Date {
  const date = parseDate(input);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Get start of year
 */
export function getStartOfYear(input: DateInput): Date {
  const date = parseDate(input);
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * Get end of year
 */
export function getEndOfYear(input: DateInput): Date {
  const date = parseDate(input);
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

// ============================================
// DATE RANGES
// ============================================

/**
 * Get this week's date range
 */
export function getThisWeek(): DateRangeResult {
  const now = new Date();
  return {
    start: getStartOfWeek(now),
    end: getEndOfWeek(now),
  };
}

/**
 * Get this month's date range
 */
export function getThisMonth(): DateRangeResult {
  const now = new Date();
  return {
    start: getStartOfMonth(now),
    end: getEndOfMonth(now),
  };
}

/**
 * Get last N days date range
 */
export function getLastNDays(n: number): DateRangeResult {
  const now = new Date();
  return {
    start: getStartOfDay(subtractDays(now, n - 1)),
    end: getEndOfDay(now),
  };
}

/**
 * Get next N days date range
 */
export function getNextNDays(n: number): DateRangeResult {
  const now = new Date();
  return {
    start: getStartOfDay(now),
    end: getEndOfDay(addDays(now, n - 1)),
  };
}

// ============================================
// CALENDAR HELPERS
// ============================================

/**
 * Get days in a month
 */
export function getDaysInMonth(input: DateInput): number {
  const date = parseDate(input);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Get calendar grid for a month (includes days from prev/next months)
 */
export function getMonthCalendarGrid(input: DateInput): Date[] {
  const date = parseDate(input);
  const firstDay = getStartOfMonth(date);
  const lastDay = getEndOfMonth(date);
  
  const startDate = getStartOfWeek(firstDay);
  const endDate = getEndOfWeek(lastDay);
  
  const days: Date[] = [];
  let current = new Date(startDate);
  
  while (current <= endDate) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }
  
  return days;
}

/**
 * Get week number of the year
 */
export function getWeekNumber(input: DateInput): number {
  const date = parseDate(input);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

