import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles conditional classes', () => {
    const isHidden = false;
    const isActive = true;
    expect(cn('base', isHidden && 'hidden', 'visible')).toBe('base visible');
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('handles undefined and null inputs', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('merges tailwind conflicts correctly', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
