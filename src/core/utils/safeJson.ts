export type SafeJsonParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function safeJsonParse<T>(input: string): SafeJsonParseResult<T> {
  try {
    return { ok: true, value: JSON.parse(input) as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to parse JSON',
    };
  }
}

