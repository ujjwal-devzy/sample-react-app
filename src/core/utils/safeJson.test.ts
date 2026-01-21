import { describe, expect, it } from 'vitest';
import { safeJsonParse } from './safeJson';

describe('safeJsonParse', () => {
  it('returns ok for valid JSON', () => {
    const result = safeJsonParse<{ name: string }>('{\"name\":\"taskflow\"}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('taskflow');
    }
  });

  it('returns error for invalid JSON', () => {
    const result = safeJsonParse<{ name: string }>('not-json');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});

