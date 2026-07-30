export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Midnight UTC of the given day.
 *
 * The whole schedule is generated and compared at UTC day granularity, so every
 * date entering the domain passes through here first. Mixing normalised and
 * un-normalised dates is what makes day arithmetic go quietly wrong.
 */
export const startOfUtcDay = (value: Date | string | number): Date => {
    const date = new Date(value);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

export const addUtcDays = (value: Date | string | number, days: number): Date => {
    const date = startOfUtcDay(value);
    date.setUTCDate(date.getUTCDate() + days);
    return date;
};

/** Whole days between two instants, at UTC day granularity. */
export const daysBetween = (from: Date | string | number, to: Date | string | number): number =>
    Math.round((startOfUtcDay(to).getTime() - startOfUtcDay(from).getTime()) / MS_PER_DAY);
