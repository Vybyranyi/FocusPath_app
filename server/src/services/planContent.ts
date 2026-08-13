import { createHash } from 'crypto';
import { endOfSchedule } from '@services/habitSchedule';
import { startOfUtcDay } from '@utils/dates';

/**
 * A fingerprint of a schedule: its length and every day title, in order.
 *
 * One mechanism, two jobs, and that is the point of having it at all:
 *
 * 1. The proven badge. A plan may be published on day zero and earn its badge
 *    later, when the source habit finishes — but only if the habit still runs
 *    the schedule that was published. Without this check an author publishes
 *    ninety days, halves their own duration, finishes in forty-five and gets a
 *    badge for a route they never walked.
 * 2. Honest clone statistics. A clone counts towards a plan's completion rate
 *    only while its hash still equals the plan's. That rules out a changed
 *    duration *and* rewritten days at once, with no "modified" flag to keep in
 *    step across three places.
 *
 * The input is JSON-encoded rather than joined with a separator, so a day title
 * that happens to contain the separator cannot collide with a different plan.
 */
export const scheduleHash = (duration: number, dayTitles: readonly string[]): string =>
    createHash('sha256').update(JSON.stringify([duration, dayTitles])).digest('hex');

/** Share of days that must be `done` before a plan may call itself proven. */
export const PROVEN_THRESHOLD = 0.7;

export interface ProvenCheck {
    /** Midnight UTC of the source habit's first day. */
    startDate: Date;
    duration: number;
    /** Days of the source habit currently marked `done`. */
    doneCount: number;
    /** `scheduleHash` of the source habit as it stands now. */
    habitHash: string;
    /** `contentHash` stored on the plan when it was published. */
    planHash: string;
}

/**
 * Whether a plan has earned its badge.
 *
 * Pure and time-injectable, like `calculateStreak`, so all three conditions can
 * be tested without waiting out a ninety-day plan.
 *
 * The calendar condition is deliberately "the last day is behind us" rather than
 * "every day is done": a plan finished at 80% is still a plan someone walked,
 * and requiring 100% would mean the badge only ever lands on perfect runs.
 */
export const qualifiesAsProven = (
    { startDate, duration, doneCount, habitHash, planHash }: ProvenCheck,
    now: Date = new Date(),
): boolean => {
    if (habitHash !== planHash) {
        return false;
    }

    if (startOfUtcDay(now) <= endOfSchedule(startOfUtcDay(startDate), duration)) {
        return false;
    }

    return duration > 0 && doneCount / duration >= PROVEN_THRESHOLD;
};
