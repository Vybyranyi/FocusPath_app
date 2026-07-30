import { Request, Response } from 'express';
import Habit from '@models/Habit';
import mongoose from 'mongoose';
import { created, ok } from '@utils/apiResponse';
import { BadRequestError, NotFoundError, UnauthorizedError } from '@errors/AppError';
import type { TypedRequest } from '@middlewares/validate';
import type {
    CreateHabitDto,
    HabitParams,
    MarkCompletionDto,
    StepParams,
    UpdateDayTitleDto,
    UpdateHabitDto,
} from '@validation/habitSchemas';

// Shape, ranges and id formats are enforced by the schemas on the routes.
// What remains here is the part a schema cannot know: whether the habit exists,
// whether it belongs to this user, and whether a date falls inside its schedule.
//
// No try/catch — Express 5 forwards a rejected promise to the error handler.

/** Every handler here runs behind verifyTokenMiddleware, so this should always hold. */
const requireUserId = (req: Request): string => {
    if (!req.userId) {
        throw new UnauthorizedError();
    }
    return req.userId;
};

/** Midnight UTC of the given day, matching how the schedule is generated. */
const startOfUtcDay = (value: string | Date): Date => {
    const parsed = new Date(value);
    parsed.setUTCHours(0, 0, 0, 0);
    return parsed;
};

/** Last day the habit covers, inclusive. */
const endOfSchedule = (startDate: Date, duration: number): Date => {
    const end = new Date(startDate);
    end.setUTCDate(end.getUTCDate() + duration - 1);
    return end;
};

/** The scheduled entry for a day, or a refusal naming why there is none. */
const requireScheduledDay = (
    habit: { startDate: Date; duration: number; dailyCompletions: Array<{ date: Date }> },
    day: Date,
): number => {
    const start = startOfUtcDay(habit.startDate);

    if (day < start || day > endOfSchedule(start, habit.duration)) {
        throw new BadRequestError('Date is outside habit duration');
    }

    const index = habit.dailyCompletions.findIndex(completion => {
        const scheduled = new Date(completion.date);
        scheduled.setUTCHours(0, 0, 0, 0);
        return scheduled.getTime() === day.getTime();
    });

    if (index === -1) {
        throw new BadRequestError('Date not found in habit schedule');
    }

    return index;
};

export const createHabit = async (req: TypedRequest<CreateHabitDto>, res: Response) => {
    const userId = requireUserId(req);
    const { title, description, category, steps, startDate, duration, type, color, icon } = req.body;

    const parsedStartDate = startOfUtcDay(startDate);

    const dailyCompletions = Array.from({ length: duration }, (_unused, dayOffset) => {
        const completionDate = new Date(parsedStartDate);
        completionDate.setUTCDate(completionDate.getUTCDate() + dayOffset);
        return { dayTitle: title, date: completionDate, completed: false };
    });

    const newHabit = new Habit({
        title,
        description: description ?? '',
        category: category ?? '',
        steps: steps ?? [],
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

    // Read from req.query rather than a validated copy: Express 5 silently
    // discards an assignment to it, so the schema checks and the handler parses.
    const { date } = req.query;
    const targetDate = startOfUtcDay(typeof date === 'string' && date ? date : new Date());

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

export const getHabitById = async (
    req: TypedRequest<unknown, HabitParams>,
    res: Response,
) => {
    const userId = requireUserId(req);

    const habit = await Habit.findOne({ _id: req.params.id, userId }).select('-userId');
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    return ok(res, { habit });
};

export const updateHabit = async (
    req: TypedRequest<UpdateHabitDto, HabitParams>,
    res: Response,
) => {
    const userId = requireUserId(req);
    const { title, description, category, steps, startDate, duration, type, color, icon } = req.body;

    const habit = await Habit.findOne({ _id: req.params.id, userId });
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    if (startDate) habit.startDate = startOfUtcDay(startDate);
    if (title) habit.title = title;
    if (description !== undefined) habit.description = description;
    if (category !== undefined) habit.category = category;
    if (steps) habit.steps = steps;
    if (duration !== undefined) habit.duration = duration;
    if (type) habit.type = type;
    if (color) habit.color = color;
    if (icon) habit.icon = icon;
    habit.updatedAt = new Date();

    await habit.save();

    return ok(res, { habit });
};

export const deleteHabit = async (
    req: TypedRequest<unknown, HabitParams>,
    res: Response,
) => {
    const userId = requireUserId(req);
    const { id } = req.params;

    const habit = await Habit.findOneAndDelete({ _id: id, userId });
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    return ok(res, { habitId: id });
};

export const updateDayTitle = async (
    req: TypedRequest<UpdateDayTitleDto, HabitParams>,
    res: Response,
) => {
    const userId = requireUserId(req);
    const { date, dayTitle } = req.body;

    const habit = await Habit.findOne({ _id: req.params.id, userId });
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    const index = requireScheduledDay(habit, startOfUtcDay(date));

    habit.dailyCompletions[index].dayTitle = dayTitle;
    habit.updatedAt = new Date();
    await habit.save();

    return ok(res, { habit });
};

export const markHabitCompletion = async (
    req: TypedRequest<MarkCompletionDto, HabitParams>,
    res: Response,
) => {
    const userId = requireUserId(req);
    const { date, completed } = req.body;

    const habit = await Habit.findOne({ _id: req.params.id, userId });
    if (!habit) {
        throw new NotFoundError('Habit not found');
    }

    const index = requireScheduledDay(habit, startOfUtcDay(date ?? new Date()));
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

    return ok(res, { habit });
};

export const toggleStep = async (
    req: TypedRequest<unknown, StepParams>,
    res: Response,
) => {
    const userId = requireUserId(req);
    const { id, stepId } = req.params;

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

    return ok(res, { stepId, completed: step.completed, habit });
};
