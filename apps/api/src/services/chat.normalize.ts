/** Normalize user input for expression matching. */
export function normalizeChatText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s?'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(um+|uh+|er+|hmm+|like|so|well|okay so|ok so)\s+/g, '')
    .replace(/\s+(pls|plz|please|thx|thanks)\s*$/g, '')
    .trim();
}

const TYPO_FIXES: [RegExp, string][] = [
  [/\bassigments?\b/g, 'assignment'],
  [/\bassignmnts?\b/g, 'assignment'],
  [/\bclases\b/g, 'classes'],
  [/\bclas\b/g, 'class'],
  [/\bgrads?\b/g, 'grade'],
  [/\bgrae\b/g, 'grade'],
  [/\bhomewrk\b/g, 'homework'],
  [/\bhomwork\b/g, 'homework'],
  [/\btecher\b/g, 'teacher'],
  [/\bteacherss\b/g, 'teachers'],
  [/\bstudnt\b/g, 'student'],
  [/\bstudets\b/g, 'students'],
  [/\blogn\b/g, 'login'],
  [/\bsing in\b/g, 'sign in'],
  [/\bsing out\b/g, 'sign out'],
  [/\bsubmitt\b/g, 'submit'],
  [/\bsubmited\b/g, 'submitted'],
  [/\benrol\b/g, 'enroll'],
  [/\bcorse\b/g, 'course'],
  [/\bassgnment\b/g, 'assignment'],
  [/\bstatss\b/g, 'stats'],
  [/\bavrage\b/g, 'average'],
  [/\bavrg\b/g, 'average'],
];

export function fixChatTypos(text: string): string {
  let result = text;
  for (const [pattern, replacement] of TYPO_FIXES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function prepareChatText(message: string): string {
  return fixChatTypos(normalizeChatText(message));
}

/** True if normalized text matches any expression (exact, word, or phrase). */
export function matchesExpression(text: string, expressions: string[]): boolean {
  const normalized = prepareChatText(text);
  if (!normalized) return false;

  return expressions.some((raw) => {
    const expr = prepareChatText(raw);
    if (!expr) return false;
    if (normalized === expr) return true;

    // Short expressions must match as whole words to avoid false positives.
    if (expr.length <= 4) {
      const pattern = new RegExp(`\\b${expr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      return pattern.test(normalized);
    }

    if (normalized.includes(expr)) return true;
    if (expr.length >= 8 && expr.includes(normalized)) return true;
    return false;
  });
}

export function matchesWord(text: string, words: string[]): boolean {
  const normalized = prepareChatText(text);
  return words.some((word) => {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return pattern.test(normalized);
  });
}
