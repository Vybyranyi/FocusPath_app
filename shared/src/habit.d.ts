export type HabitType = "build" | "quit";

export interface HabitStep {
    _id: string;
    title: string;
    completed: boolean;
}

/** One scheduled day of a habit. The schedule is generated up front, one entry per day of `duration`. */
export interface DailyCompletion {
    _id: string;
    dayTitle: string;
    /** ISO 8601 date string, normalised to midnight UTC. */
    date: string;
    completed: boolean;
}

/** A habit in full, as returned by `GET /habits` and `GET /habits/:id`. */
export interface Habit {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    steps?: HabitStep[];
    /** ISO 8601 date string, normalised to midnight UTC. */
    startDate: string;
    /** Number of days the habit runs for. Always equals `dailyCompletions.length`. */
    duration: number;
    type: HabitType;
    color: string;
    icon: string;
    currentStreak: number;
    isCompleted: boolean;
    dailyCompletions: DailyCompletion[];
    createdAt: string;
    updatedAt: string;
}

/**
 * A habit narrowed to a single day, as returned by `GET /habits/daily`.
 *
 * The aggregation swaps the full schedule for just that day's entry plus a
 * precomputed total, so listing a day never ships every other day with it.
 */
export interface HabitSummary
    extends Omit<Habit, "dailyCompletions" | "createdAt" | "updatedAt"> {
    dayInfo: DailyCompletion;
    /** How many days of the whole habit are done, across the entire schedule. */
    completedCount: number;
}
