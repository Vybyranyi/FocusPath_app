import { addUtcDays, daysBetween, startOfUtcDay } from '@utils/dates';

export interface ScheduledDay {
    dayTitle: string;
    date: Date;
    completed: boolean;
}

/**
 * The consecutive run of completed days ending at the most recent one.
 *
 * "Current" allows the run to end yesterday as well as today, because a day is
 * not a failure until it is over — a user mid-run who has not ticked today yet
 * still has their streak. A run that ended earlier than yesterday is broken and
 * counts zero. Days beyond today are ignored: marking a future day of the plan
 * cannot extend a streak that has not reached it.
 *
 * Pure and time-injectable so the behaviour can be tested without waiting a day.
 */
export const calculateStreak = (
    completions: ReadonlyArray<{ date: Date | string; completed: boolean }>,
    now: Date = new Date(),
): number => {
    const today = startOfUtcDay(now).getTime();

    const completedDays = [
        ...new Set(
            completions
                .filter(entry => entry.completed)
                .map(entry => startOfUtcDay(entry.date).getTime())
                .filter(day => day <= today),
        ),
    ].sort((a, b) => a - b);

    if (completedDays.length === 0) {
        return 0;
    }

    const mostRecent = completedDays[completedDays.length - 1];
    if (daysBetween(mostRecent, today) > 1) {
        return 0;
    }

    let streak = 1;
    for (let index = completedDays.length - 1; index > 0; index--) {
        if (daysBetween(completedDays[index - 1], completedDays[index]) !== 1) {
            break;
        }
        streak++;
    }

    return streak;
};

/**
 * Builds the day-by-day plan for a habit.
 *
 * When a habit is rescheduled, entries are carried over by their position in
 * the plan rather than by their date: "day three of my plan" stays day three
 * even if the start moves. Days past a shortened duration fall away; days added
 * by a longer one start empty.
 */
export const buildSchedule = (
    startDate: Date,
    duration: number,
    defaultTitle: string,
    existing: ReadonlyArray<ScheduledDay> = [],
): ScheduledDay[] =>
    Array.from({ length: duration }, (_unused, offset) => {
        const previous = existing[offset];
        return {
            dayTitle: previous?.dayTitle ?? defaultTitle,
            date: addUtcDays(startDate, offset),
            completed: previous?.completed ?? false,
        };
    });

/** Last day the habit covers, inclusive. */
export const endOfSchedule = (startDate: Date, duration: number): Date =>
    addUtcDays(startDate, duration - 1);

/** Whether every day of the plan has been completed. */
export const isPlanComplete = (
    completions: ReadonlyArray<{ completed: boolean }>,
    duration: number,
): boolean => completions.filter(entry => entry.completed).length >= duration;
