import { describe, it, expect } from 'vitest';
import { formatMarks, formatMarksBadge, getMarksBadgeVariant } from './marks';

describe('marks formatting (platform requirement)', () => {
  it('formatMarks returns plain numbers without percent', () => {
    expect(formatMarks(85)).toBe('85');
    expect(formatMarks(85)).not.toContain('%');
  });

  it('formatMarksBadge uses marks label', () => {
    expect(formatMarksBadge(92)).toBe('92 marks');
  });

  it('getMarksBadgeVariant maps score bands', () => {
    expect(getMarksBadgeVariant(95)).toBe('success');
    expect(getMarksBadgeVariant(75)).toBe('default');
    expect(getMarksBadgeVariant(55)).toBe('secondary');
    expect(getMarksBadgeVariant(40)).toBe('destructive');
  });
});
