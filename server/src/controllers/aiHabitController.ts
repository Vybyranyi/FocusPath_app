import { Response, Request } from 'express';
import Habit from '@models/Habit';
import { generateHabitPlan } from '@services/openAiService';
import { created } from '@utils/apiResponse';
import { BadRequestError, ServiceUnavailableError, UnauthorizedError } from '@errors/AppError';
import { logger } from '@config/logger';

interface AiHabitBody {
    title?: string;
    startDate?: string;
    duration?: number | null;
    type?: 'build' | 'quit';
    color?: string;
    icon?: string;
}

export const createAIHabit = async (req: Request, res: Response) => {
    const { userId } = req;
    if (!userId) {
        throw new UnauthorizedError();
    }

    const { title, startDate, duration, type, color, icon } = req.body as AiHabitBody;

    if (!title || !startDate || !type || !color || !icon) {
        throw new BadRequestError('Title, startDate, type, color and icon are required');
    }

    if (!['build', 'quit'].includes(type)) {
        throw new BadRequestError('Type must be either "build" or "quit"');
    }

    if (duration !== undefined && duration !== null && duration !== 0) {
        if (duration < 1 || duration > 365) {
            throw new BadRequestError('Duration must be between 1 and 365 days');
        }
    }

    const parsedStartDate = new Date(startDate);
    if (Number.isNaN(parsedStartDate.getTime())) {
        throw new BadRequestError('Invalid start date format');
    }
    parsedStartDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (parsedStartDate.getTime() < today.getTime()) {
        throw new BadRequestError('Start date cannot be in the past');
    }

    const useDuration = duration && duration > 0 ? duration : undefined;

    let aiResponse;
    try {
        aiResponse = await generateHabitPlan(title.trim(), type, useDuration);
    } catch (error) {
        // The upstream failure is worth a log line, but the caller only needs to
        // know the AI is unavailable — not why, and not with our stack attached.
        logger.error({ err: error, title: title.trim(), type }, 'AI habit generation failed');
        throw new ServiceUnavailableError('AI service is temporarily unavailable');
    }

    const dailyCompletions = aiResponse.dailyTasks.map((task, index) => {
        const completionDate = new Date(parsedStartDate);
        completionDate.setUTCDate(completionDate.getUTCDate() + index);
        return { dayTitle: task.dayTitle, date: completionDate, completed: false };
    });

    const newHabit = new Habit({
        title: title.trim(),
        startDate: parsedStartDate,
        duration: aiResponse.duration,
        type,
        userId,
        color,
        icon,
        currentStreak: 0,
        isCompleted: false,
        dailyCompletions,
    });

    await newHabit.save();

    return created(res, { habit: newHabit, aiGenerated: true });
};
