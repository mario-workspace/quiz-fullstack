import { describe, it, expect } from 'vitest';
import { validateDueDateNotPast } from './assignment.validation';

describe('validateDueDateNotPast', () => {
  it('allows empty due date', () => {
    expect(() => validateDueDateNotPast(undefined)).not.toThrow();
    expect(() => validateDueDateNotPast(null)).not.toThrow();
  });

  it('allows today and future dates', () => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    expect(() => validateDueDateNotPast(iso)).not.toThrow();

    const future = new Date(today);
    future.setDate(future.getDate() + 7);
    expect(() => validateDueDateNotPast(future.toISOString().slice(0, 10))).not.toThrow();
  });

  it('rejects past dates', () => {
    expect(() => validateDueDateNotPast('2000-01-01')).toThrow('Due date cannot be in the past');
  });
});
