import { describe, it, expect } from 'vitest';
import { resolveTheme, THEME_STORAGE_KEY } from './theme';

describe('theme', () => {
  it('resolves explicit light and dark', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });

  it('exports storage key', () => {
    expect(THEME_STORAGE_KEY).toBe('theme');
  });
});
