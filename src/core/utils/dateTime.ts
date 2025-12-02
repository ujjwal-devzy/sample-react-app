import { DateInput } from "./date";

export function parseDate(input: DateInput): Date {
    if (input instanceof Date) return input;
    if (typeof input === 'number') return new Date(input);
    return new Date(input);
  }

export function formatTime(
    input: DateInput,
    options: Intl.DateTimeFormatOptions = { timeStyle: 'short' },
    locale = 'en-US'
  ): string {
    return parseDate(input).toLocaleTimeString(locale, options);
  }