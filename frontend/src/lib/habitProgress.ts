/**
 * How far through a habit's plan, as a whole percentage.
 *
 * Five components worked this out for themselves and no two agreed: some
 * floored, some rounded, some clamped and some could show more than 100%.
 */
export const getHabitProgress = (completed: number, total: number): number => {
  if (total <= 0) return 0;

  return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
};
