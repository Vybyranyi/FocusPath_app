import { buildSchedule, calculateStreak, endOfSchedule, isPlanComplete } from '@services/habitSchedule';
import { addUtcDays, startOfUtcDay } from '@utils/dates';

const NOW = new Date('2026-03-15T09:30:00.000Z');
const day = (offset: number) => addUtcDays(NOW, offset);

/** A completed entry `offset` days from NOW; negative is in the past. */
const done = (offset: number) => ({ date: day(offset), completed: true });
const missed = (offset: number) => ({ date: day(offset), completed: false });

describe('calculateStreak', () => {
    it('is zero when nothing has been completed', () => {
        expect(calculateStreak([missed(0), missed(-1)], NOW)).toBe(0);
    });

    it('counts a run that ends today', () => {
        expect(calculateStreak([done(-2), done(-1), done(0)], NOW)).toBe(3);
    });

    it('keeps the streak alive when today is not ticked yet', () => {
        // The day is not over, so a run ending yesterday is still current.
        // The previous implementation counted back from today and returned 0
        // here, wiping a run of any length the moment midnight passed.
        expect(calculateStreak([done(-3), done(-2), done(-1)], NOW)).toBe(3);
    });

    it('counts a single completed day', () => {
        expect(calculateStreak([done(0)], NOW)).toBe(1);
        expect(calculateStreak([done(-1)], NOW)).toBe(1);
    });

    it('is zero once the run ended before yesterday', () => {
        expect(calculateStreak([done(-4), done(-3), done(-2)], NOW)).toBe(0);
    });

    it('counts only the run at the end, not every completed day', () => {
        expect(
            calculateStreak([done(-9), done(-8), missed(-7), done(-1), done(0)], NOW),
        ).toBe(2);
    });

    it('ignores days of the plan that today has not reached', () => {
        // Marking tomorrow ahead of time should not inflate a current streak.
        expect(calculateStreak([done(0), done(1), done(2)], NOW)).toBe(1);
    });

    it('is unaffected by the order entries arrive in', () => {
        expect(calculateStreak([done(0), done(-2), done(-1)], NOW)).toBe(3);
    });

    it('does not let a repeated date break the count', () => {
        expect(calculateStreak([done(-1), done(-1), done(0)], NOW)).toBe(2);
    });

    it('compares by day, not by clock time', () => {
        const laterToday = { date: new Date('2026-03-15T23:59:00.000Z'), completed: true };
        const earlyYesterday = { date: new Date('2026-03-14T00:00:01.000Z'), completed: true };

        expect(calculateStreak([earlyYesterday, laterToday], NOW)).toBe(2);
    });
});

describe('buildSchedule', () => {
    const start = startOfUtcDay('2026-03-15T00:00:00.000Z');

    it('creates one entry per day, titled after the habit', () => {
        const schedule = buildSchedule(start, 3, 'Read daily');

        expect(schedule).toHaveLength(3);
        expect(schedule.map(entry => entry.dayTitle)).toEqual([
            'Read daily',
            'Read daily',
            'Read daily',
        ]);
        expect(schedule.every(entry => !entry.completed)).toBe(true);
    });

    it('advances one day at a time from the start', () => {
        const schedule = buildSchedule(start, 3, 'Read');

        expect(schedule.map(entry => entry.date.toISOString())).toEqual([
            '2026-03-15T00:00:00.000Z',
            '2026-03-16T00:00:00.000Z',
            '2026-03-17T00:00:00.000Z',
        ]);
    });

    it('carries progress over when the plan is rescheduled', () => {
        const original = buildSchedule(start, 3, 'Read');
        original[1].completed = true;
        original[1].dayTitle = 'Read two chapters';

        const moved = buildSchedule(addUtcDays(start, 7), 3, 'Read', original);

        // Day two of the plan is still day two, with its progress intact.
        expect(moved[1].completed).toBe(true);
        expect(moved[1].dayTitle).toBe('Read two chapters');
        expect(moved[1].date.toISOString()).toBe('2026-03-23T00:00:00.000Z');
    });

    it('drops the tail when the plan is shortened', () => {
        const original = buildSchedule(start, 5, 'Read');
        original[4].completed = true;

        const shortened = buildSchedule(start, 2, 'Read', original);

        expect(shortened).toHaveLength(2);
    });

    it('adds empty days when the plan is lengthened', () => {
        const original = buildSchedule(start, 2, 'Read');
        original[0].completed = true;

        const lengthened = buildSchedule(start, 4, 'Read', original);

        expect(lengthened).toHaveLength(4);
        expect(lengthened[0].completed).toBe(true);
        expect(lengthened.slice(2).every(entry => !entry.completed)).toBe(true);
    });
});

describe('endOfSchedule', () => {
    it('is inclusive of the final day', () => {
        const start = startOfUtcDay('2026-03-15T00:00:00.000Z');

        expect(endOfSchedule(start, 1).toISOString()).toBe('2026-03-15T00:00:00.000Z');
        expect(endOfSchedule(start, 3).toISOString()).toBe('2026-03-17T00:00:00.000Z');
    });
});

describe('isPlanComplete', () => {
    it('is true only once every day is done', () => {
        expect(isPlanComplete([done(0), done(-1)], 3)).toBe(false);
        expect(isPlanComplete([done(0), done(-1), done(-2)], 3)).toBe(true);
    });
});
