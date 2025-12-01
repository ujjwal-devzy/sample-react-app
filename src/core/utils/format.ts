/**
 * Formatting Utilities
 * Functions for formatting data for display
 */

// ============================================
// NUMBER FORMATTING
// ============================================

export interface NumberFormatOptions {
  locale?: string;
  decimals?: number;
  compact?: boolean;
  currency?: string;
  percent?: boolean;
}

/**
 * Format number with locale support
 */
export function formatNumber(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const {
    locale = 'en-US',
    decimals,
    compact = false,
    currency,
    percent = false,
  } = options;

  const formatOptions: Intl.NumberFormatOptions = {};

  if (currency) {
    formatOptions.style = 'currency';
    formatOptions.currency = currency;
  } else if (percent) {
    formatOptions.style = 'percent';
    formatOptions.minimumFractionDigits = decimals ?? 0;
    formatOptions.maximumFractionDigits = decimals ?? 0;
  }

  if (decimals !== undefined) {
    formatOptions.minimumFractionDigits = decimals;
    formatOptions.maximumFractionDigits = decimals;
  }

  if (compact) {
    formatOptions.notation = 'compact';
    formatOptions.compactDisplay = 'short';
  }

  return new Intl.NumberFormat(locale, formatOptions).format(value);
}

/**
 * Format currency
 */
export function formatCurrency(
  value: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return formatNumber(value, { locale, currency });
}

/**
 * Format percentage
 */
export function formatPercent(
  value: number,
  decimals = 0,
  locale = 'en-US'
): string {
  return formatNumber(value / 100, { locale, percent: true, decimals });
}

/**
 * Format compact number (e.g., 1.5K, 2.3M)
 */
export function formatCompact(value: number, locale = 'en-US'): string {
  return formatNumber(value, { locale, compact: true });
}

/**
 * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(value: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const remainder = value % 100;
  
  const suffix = suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
  return `${value}${suffix}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(
  phone: string,
  format: 'us' | 'international' = 'us'
): string {
  const digits = phone.replace(/\D/g, '');

  if (format === 'us' && digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (format === 'international' && digits.length >= 10) {
    const countryCode = digits.length > 10 ? digits.slice(0, digits.length - 10) : '';
    const rest = digits.slice(-10);
    return `+${countryCode || '1'} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
  }

  return phone;
}

// ============================================
// STRING FORMATTING
// ============================================

/**
 * Format string as sentence case
 */
export function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Format enum value for display
 */
export function formatEnumValue(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Format list as readable string
 */
export function formatList(
  items: string[],
  options: { conjunction?: 'and' | 'or'; oxford?: boolean } = {}
): string {
  const { conjunction = 'and', oxford = true } = options;

  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  const oxfordComma = oxford ? ',' : '';

  return `${rest.join(', ')}${oxfordComma} ${conjunction} ${last}`;
}

/**
 * Format count with unit
 */
export function formatCount(
  count: number,
  singular: string,
  plural?: string
): string {
  const unit = count === 1 ? singular : (plural || `${singular}s`);
  return `${formatNumber(count)} ${unit}`;
}

// ============================================
// DATE FORMATTING (EXTENDED)
// ============================================

/**
 * Format time range
 */
export function formatTimeRange(
  start: Date,
  end: Date,
  options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
): string {
  const startStr = start.toLocaleTimeString('en-US', options);
  const endStr = end.toLocaleTimeString('en-US', options);
  return `${startStr} - ${endStr}`;
}

/**
 * Format date range
 */
export function formatDateRange(
  start: Date,
  end: Date,
  locale = 'en-US'
): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  const sameDay = sameMonth && start.getDate() === end.getDate();

  if (sameDay) {
    return start.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (sameMonth) {
    return `${start.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(locale, { day: 'numeric', year: 'numeric' })}`;
  }

  if (sameYear) {
    return `${start.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  return `${start.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

// ============================================
// FILE SIZE FORMATTING
// ============================================

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Parse file size string to bytes
 */
export function parseFileSize(sizeStr: string): number {
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5,
  };

  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB|PB)$/i);
  if (!match) return 0;

  const [, value, unit] = match;
  return parseFloat(value) * (units[unit.toUpperCase()] || 1);
}

// ============================================
// ADDRESS FORMATTING
// ============================================

export interface Address {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Format address as single line
 */
export function formatAddressSingleLine(address: Address): string {
  const parts = [
    address.street,
    address.street2,
    address.city,
    address.state && address.postalCode
      ? `${address.state} ${address.postalCode}`
      : address.state || address.postalCode,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Format address as multi-line
 */
export function formatAddressMultiLine(address: Address): string {
  const lines = [
    address.street,
    address.street2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean);

  return lines.join('\n');
}

// ============================================
// NAME FORMATTING
// ============================================

export interface NameParts {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * Format name parts into full name
 */
export function formatFullName(parts: NameParts): string {
  const nameOrder = [
    parts.prefix,
    parts.firstName,
    parts.middleName,
    parts.lastName,
    parts.suffix,
  ].filter(Boolean);

  return nameOrder.join(' ');
}

/**
 * Format name in "Last, First" format
 */
export function formatLastFirst(parts: NameParts): string {
  if (parts.lastName && parts.firstName) {
    return `${parts.lastName}, ${parts.firstName}`;
  }
  return parts.firstName || parts.lastName || '';
}

// ============================================
// JSON FORMATTING
// ============================================

/**
 * Format JSON with indentation
 */
export function formatJSON(
  value: unknown,
  indent = 2
): string {
  return JSON.stringify(value, null, indent);
}

/**
 * Minify JSON string
 */
export function minifyJSON(jsonStr: string): string {
  try {
    return JSON.stringify(JSON.parse(jsonStr));
  } catch {
    return jsonStr;
  }
}

// ============================================
// TASK-SPECIFIC FORMATTING
// ============================================

/**
 * Format task ID for display (e.g., "PROJ-123")
 */
export function formatTaskId(projectKey: string, taskNumber: number): string {
  return `${projectKey}-${taskNumber}`;
}

/**
 * Format priority for display with color
 */
export function formatPriority(priority: string): { label: string; color: string } {
  const priorities: Record<string, { label: string; color: string }> = {
    low: { label: 'Low', color: '#10b981' },
    medium: { label: 'Medium', color: '#f59e0b' },
    high: { label: 'High', color: '#f97316' },
    critical: { label: 'Critical', color: '#ef4444' },
  };

  return priorities[priority.toLowerCase()] || { label: priority, color: '#6b7280' };
}

/**
 * Format progress percentage
 */
export function formatProgress(completed: number, total: number): string {
  if (total === 0) return '0%';
  const percent = Math.round((completed / total) * 100);
  return `${percent}%`;
}

/**
 * Format time estimate (e.g., "2h 30m", "1d 4h")
 */
export function formatTimeEstimate(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 8) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 8);
  const remainingHours = hours % 8;

  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }

  return `${days}d`;
}

/**
 * Parse time estimate string to minutes
 */
export function parseTimeEstimate(estimate: string): number {
  const dayMatch = estimate.match(/(\d+)d/);
  const hourMatch = estimate.match(/(\d+)h/);
  const minuteMatch = estimate.match(/(\d+)m/);

  const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;
  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

  return days * 8 * 60 + hours * 60 + minutes;
}

