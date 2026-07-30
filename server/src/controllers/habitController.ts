import { Response, Request } from 'express';
import Habit from '@models/Habit';
import mongoose from 'mongoose';
import { created, ok } from '@utils/apiResponse';
import { BadRequestError, NotFoundError, UnauthorizedError } from '@errors/AppError';

// No try/catch anywhere below: Express 5 forwards a rejected promise to the
// error handler, which is the only place that turns a failure into a response.

interface HabitBody {
    title?: string;
    description?: string;
    category?: string;
    steps?: Array<{ title: string; completed?: boolean }>;
    startDate?: string;
    duration?: number | null;
    type?: 'build' | 'quit';
    color?: string;
    icon?: string;
    completed?: boolean;
    date?: string;
    dayTitle?: string;
}

/** Every handler here runs behind verifyTokenMiddleware, so this should always hold. */
const requireUserId = (req: Request): string => {
    if (!req.userId) {
        throw new UnauthorizedError();
    }
    return req.userId;
};

const requireObjectId = (value: string, label = 'habit ID'): string => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError(`Invalid ${label}`);
    }
    return value;
};

/** Midnight UTC of the given day, rejecting anything that is not a real date. */
const startOfUtcDay = (value: string | Date, label = 'date'): Date => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestError(`Invalid ${label} format`);
    }
    parsed.setUTCHours(0, 0, 0, 0);
    return parsed;
};

/** Last day the habit covers, inclusive. */
const endOfSchedule = (startDate: Date, duration: number): Date => {
    const end = new Date(startDate);
    end.setUTCDate(end.getUTCDate() + duration - 1);
    return end;
};

const findCompletionIndex = (
    completions: Array<{ date: Date }>,
    target: Date,
): number =>
    completions.findIndex(completion => {
        const day = new Date(completion.date);
        day.setUTCHours(0, 0, 0, 0);
        return day.getTime() === target.getTime();
    });

export const createHabit = async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const {
        title, description, category, steps, startDate, duration, type, color, icon,
    } = req.body as HabitBody;

    if (!title || !startDate || !duration || !type || !color || !icon) {
        throw new BadRequestError('All fields are required');
    }

    if (!['build', 'quit'].includes(type)) {
        throw new BadRequestError('Type must be either "build" or "quit"');
    }

    if (duration < 1 || duration > 365) {
        throw new BadRequestError('Duration must be between 1 and 365 days');
    }

    const parsedStartDate = startOfUtcDay(startDate, 'start date');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (parsedStartDate.getTime() < today.getTime()) {
        throw new BadRequestError('Start date cannot be in the past');
    }

    const dailyCompletions = Array.from({ length: duration }, (_unused, dayOffset) => {
        const completionDate = new Date(parsedStartDate);
        completionDate.setUTCDate(completionDate.getUTCDate() + dayOffset);
        return { dayTitle: title.trim(), date: completionDate, completed: false };
    });

    const newHabit = new Habit({
        title: title.trim(),
        description: description?.trim() || '',
        category: category?.trim() || '',
        steps: steps || [],
        startDate: parsedStartDate,
        duration,
        type,
        userId,
        color,
        icon,
        currentStreak: 0,
        isCompleted: false,
        dailyCompletions,
    });

    await newHabit.save();

    return created(res, { habit: newHabit });
};

export const getHabitsForDate = async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const { date } = req.query;

    const targetDate = startOfUtcDay(
        typeof date === 'string' && date ? date : new Date(),
    );

    const endDate = new Date(targetDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const habits = await Habit.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                startDate: { $lte: targetDate },
            },
        },
        {
            $addFields: {
                endDate: {
                    $dateAdd: {
                        startDate: '$startDate',
                        unit: 'day',
                        amount: { $subtract: ['$duration', 1] },
                    },
                },
            },
        },
        { $match: { endDate: { $gte: targetDate } } },
        {
            $addFields: {
                dayInfo: {
                    $first: {
                        $filter: {
                            input: '$dailyCompletions',
                            cond: {
                                $and: [
                                    { $gte: ['$$this.date', targetDate] },
                                    { $lte: ['$$this.date', endDate] },
                                ],
                            },
                        },
                    },
                },
            },
        },
        {
            $project: {
                title: 1,
                description: 1,
                category: 1,
                steps: 1,
                startDate: 1,
                type: 1,
                color: 1,
                icon: 1,
                currentStreak: 1,
                isCompleted: 1,
                dayInfo: 1,
                duration: 1,
                completedCount: {
                    $size: {
                        $filter: { input: '$dailyCompletions', cond: '$$this.completed' },
                    },
                },
            },
        },
    ]);

    return ok(res, { date: targetDate, habits });
};

export const getAllHabits = async (req: Request, res: Response) => {
    const userId = requireUserId(req);

    const habits = await Habit.find({ userId }).select('-userId').sort({ createdAt: -1 });

    return ok(res, { habits });
};

export const getHabitById = async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const id = requireObjectId(req.params.id);

    const habit = await Habit.findOne({ _id: id, userId }).select('-userId');
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    return ok(res, { habit });
};

export const updateHabit = async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const id = requireObjectId(req.params.id);
    const {
        title, description, category, steps, startDate, duration, type, color, icon,
    } = req.body as HabitBody;

    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    if (type && !['build', 'quit'].includes(type)) {
        throw new BadRequestError('Type must be either "build" or "quit"');
    }

    if (duration != null && (duration < 1 || duration > 365)) {
        throw new BadRequestError('Duration must be between 1 and 365 days');
    }

    if (startDate) {
        habit.startDate = startOfUtcDay(startDate, 'start date');
    }

    if (title) habit.title = title.trim();
    if (description !== undefined) habit.description = description.trim();
    if (category !== undefined) habit.category = category.trim();
    if (steps) habit.steps = steps.map(step => ({ ...step, completed: step.completed ?? false }));
    if (duration != null) habit.duration = duration;
    if (type) habit.type = type;
    if (color) habit.color = color;
    if (icon) habit.icon = icon;
    habit.updatedAt = new Date();

    await habit.save();

    return ok(res, { habit: habit });
};

export const deleteHabit = async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const id = requireObjectId(req.params.id);

    const habit = await Habit.findOneAndDelete({ _id: id, userId });
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    return ok(res, { habitId: id });
};

export const updateDayTitle = async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const id = requireObjectId(req.params.id);
    const { date, dayTitle } = req.body as HabitBody;

    if (!date || !dayTitle) {
        throw new BadRequestError('Date and dayTitle are required');
    }

    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    const targetDate = startOfUtcDay(date);
    const startDate = startOfUtcDay(habit.startDate);

    if (targetDate < startDate || targetDate > endOfSchedule(startDate, habit.duration)) {
        throw new BadRequestError('Date is outside habit duration');
    }

    const index = findCompletionIndex(habit.dailyCompletions, targetDate);
    if (index === -1) {
        throw new BadRequestError('Date not found in habit schedule');
    }

    habit.dailyCompletions[index].dayTitle = dayTitle.trim();
    habit.updatedAt = new Date();
    await habit.save();

    return ok(res, { habit: habit });
};

export const markHabitCompletion = async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const id = requireObjectId(req.params.id);
    const { date, completed } = req.body as HabitBody;

    if (completed === undefined) {
        throw new BadRequestError('Completed status is required');
    }

    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    const completionDate = startOfUtcDay(date ?? new Date());
    const startDate = startOfUtcDay(habit.startDate);

    if (completionDate < startDate || completionDate > endOfSchedule(startDate, habit.duration)) {
        throw new BadRequestError('Date is outside habit duration');
    }

    const index = findCompletionIndex(habit.dailyCompletions, completionDate);
    if (index === -1) {
        throw new BadRequestError('Date not found in habit schedule');
    }

    habit.dailyCompletions[index].completed = completed;

    // Оновлення поточної серії
    const sortedCompletions = habit.dailyCompletions
        .filter(dc => dc.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentStreak = 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = sortedCompletions.length - 1; i >= 0; i--) {
        const compDate = new Date(sortedCompletions[i].date);
        compDate.setUTCHours(0, 0, 0, 0);
        const expectedDate = new Date(today);
        expectedDate.setUTCDate(expectedDate.getUTCDate() - currentStreak);

        if (compDate.getTime() === expectedDate.getTime()) {
            currentStreak++;
        } else {
            break;
        }
    }

    habit.currentStreak = currentStreak;

    const completedDays = habit.dailyCompletions.filter(dc => dc.completed).length;
    if (completedDays >= habit.duration) {
        habit.isCompleted = true;
    }

    habit.updatedAt = new Date();
    await habit.save();

    return ok(res, { habit: habit });
};

export const toggleStep = async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const id = requireObjectId(req.params.id);
    const stepId = requireObjectId(req.params.stepId, 'step ID');

    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    const step = habit.steps?.find(candidate => candidate._id?.toString() === stepId);
    if (!step) {
        throw new NotFoundError('Step not found');
    }

    step.completed = !step.completed;
    habit.updatedAt = new Date();
    await habit.save();

    return ok(res, {
        stepId,
        completed: step.completed,
        habit: habit,
    });
};
