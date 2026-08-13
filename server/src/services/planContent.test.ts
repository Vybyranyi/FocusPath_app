import { PROVEN_THRESHOLD, qualifiesAsProven, scheduleHash } from '@services/planContent';
import { addUtcDays } from '@utils/dates';

const NOW = new Date('2026-03-15T09:30:00.000Z');

describe('scheduleHash', () => {
    it('is stable for the same schedule', () => {
        expect(scheduleHash(3, ['a', 'b', 'c'])).toBe(scheduleHash(3, ['a', 'b', 'c']));
    });

    it('changes when a single day title changes', () => {
        expect(scheduleHash(3, ['a', 'b', 'c'])).not.toBe(scheduleHash(3, ['a', 'B', 'c']));
    });

    it('changes when the duration changes', () => {
        expect(scheduleHash(3, ['a', 'b', 'c'])).not.toBe(scheduleHash(4, ['a', 'b', 'c']));
    });

    it('changes when the order changes', () => {
        expect(scheduleHash(3, ['a', 'b', 'c'])).not.toBe(scheduleHash(3, ['c', 'b', 'a']));
    });

    it('cannot be collided by a title that contains a separator', () => {
        // Joining on a delimiter would make these two schedules identical.
        expect(scheduleHash(2, ['a\nb', 'c'])).not.toBe(scheduleHash(2, ['a', 'b\nc']));
    });
});

describe('qualifiesAsProven', () => {
    /** A finished plan that cleared the threshold, as the defaults. */
    const check = (overrides: Partial<Parameters<typeof qualifiesAsProven>[0]> = {}) => ({
        startDate: addUtcDays(NOW, -20),
        duration: 10,
        doneCount: 10,
        habitHash: 'same',
        planHash: 'same',
        ...overrides,
    });

    it('awards the badge to a finished plan above the threshold', () => {
        expect(qualifiesAsProven(check(), NOW)).toBe(true);
    });

    it('refuses while the plan is still running', () => {
        // Starts today, so its last day has not happened yet.
        expect(qualifiesAsProven(check({ startDate: NOW }), NOW)).toBe(false);
    });

    it('refuses on the plan’s own last day', () => {
        expect(
            qualifiesAsProven(check({ startDate: addUtcDays(NOW, -9), duration: 10 }), NOW),
        ).toBe(false);
    });

    it('holds the threshold at exactly 70%', () => {
        expect(qualifiesAsProven(check({ doneCount: 7 }), NOW)).toBe(true);
        expect(qualifiesAsProven(check({ doneCount: 6 }), NOW)).toBe(false);
        expect(PROVEN_THRESHOLD).toBe(0.7);
    });

    it('refuses when the habit no longer runs the schedule that was published', () => {
        // Publish ninety days, halve your own duration, finish in forty-five:
        // this is the case the hash exists to catch.
        expect(qualifiesAsProven(check({ habitHash: 'shortened' }), NOW)).toBe(false);
    });
});
