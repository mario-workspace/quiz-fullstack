import { describe, it, expect } from 'vitest';
import { matchesExpression } from './chat.normalize';
import {
  ASSIGNMENT_PHRASES,
  CLASS_COUNT_PHRASES,
  GREETING_PHRASES,
  GRADE_PHRASES,
  HELP_MENU_PHRASES,
  STATS_PHRASES,
} from './chat.phrases';

describe('chat.phrases', () => {
  it('has a large expression library', () => {
    const total =
      GREETING_PHRASES.length +
      ASSIGNMENT_PHRASES.length +
      CLASS_COUNT_PHRASES.length +
      GRADE_PHRASES.length +
      STATS_PHRASES.length +
      HELP_MENU_PHRASES.length;
    expect(total).toBeGreaterThan(80);
  });

  it('matches casual class count phrasing', () => {
    expect(matchesExpression('how many courses am i taking?', CLASS_COUNT_PHRASES)).toBe(true);
    expect(matchesExpression('whats my class count', CLASS_COUNT_PHRASES)).toBe(true);
  });

  it('matches casual assignment phrasing', () => {
    expect(matchesExpression('any homework due?', ASSIGNMENT_PHRASES)).toBe(true);
    expect(matchesExpression('what stuff is due', ASSIGNMENT_PHRASES)).toBe(true);
  });

  it('matches casual grade phrasing', () => {
    expect(matchesExpression('how did i do on grades', GRADE_PHRASES)).toBe(true);
    expect(matchesExpression('check my score please', GRADE_PHRASES)).toBe(true);
  });

  it('matches typos after normalization', () => {
    expect(matchesExpression('how many clas am i in', CLASS_COUNT_PHRASES)).toBe(true);
    expect(matchesExpression('any homwork due', ASSIGNMENT_PHRASES)).toBe(true);
    expect(matchesExpression('my avrage grade', GRADE_PHRASES)).toBe(true);
  });
});
