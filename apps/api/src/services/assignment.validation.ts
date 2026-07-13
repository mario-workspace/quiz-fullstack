/** Reject assignment due dates before today (local date from YYYY-MM-DD input). */
export function validateDueDateNotPast(dueDate?: string | null): void {
  if (!dueDate) return;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dueDate);
  if (!match) {
    throw new Error('Invalid due date');
  }

  const due = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (due < startOfToday) {
    throw new Error('Due date cannot be in the past');
  }
}
