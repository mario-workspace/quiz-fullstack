/** Format a numeric score for display as marks (not percent). */
export function formatMarks(score: number): string {
  return String(score);
}

/** Compact marks label for badges and headers. */
export function formatMarksBadge(score: number): string {
  return `${formatMarks(score)} marks`;
}

/** Badge color by mark value (0–100 scale). */
export function getMarksBadgeVariant(
  score: number,
): 'success' | 'default' | 'secondary' | 'destructive' {
  if (score >= 90) return 'success';
  if (score >= 70) return 'default';
  if (score >= 50) return 'secondary';
  return 'destructive';
}
