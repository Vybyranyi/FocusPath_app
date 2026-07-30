import { Response } from 'express';
import Habit from '@models/Habit';
import { generateHabitPlan } from '@services/openAiService';
import { created } from '@utils/apiResponse';
import { ServiceUnavailableError, UnauthorizedError } from '@errors/AppError';
import { logger } from '@config/logger';
import type { TypedRequest } from '@middlewares/validate';
import type { CreateAIHabitDto } from '@validation/habitSchemas';

export const createAIHabit = async (req: TypedRequest<CreateAIHabitDto>, res: Response) => {
    const { userId } = req;
    if (!userId) {
        throw new UnauthorizedError();
    }

    const { title, startDate, duration, type, color, icon } = req.body;

    const parsedStartDate = new Date(startDate);
    parsedStartDate.setUTCHours(0, 0, 0, 0);

    // Absent, null or zero all mean "let the model choose the length".
    const requestedDuration = duration && duration > 0 ? duration : undefined;

    let aiResponse;
    try {
        aiResponse = await generateHabitPlan(title, type, requestedDuration);
    } catch (error) {
        // The upstream failure is worth a log line, but the caller only needs to
        // know the AI is unavailable — not why, and not with our stack attached.
        logger.error({ err: error, title, type }, 'AI habit generation failed');
        throw new ServiceUnavailableError('AI service is temporarily unavailable');
    }

    const dailyCompletions = aiResponse.dailyTasks.map((task, index) => {
        const completionDate = new Date(parsedStartDate);
        completionDate.setUTCDate(completionDate.getUTCDate() + index);
        return { dayTitle: task.dayTitle, date: completionDate, completed: false };
    });

    const newHabit = new Habit({
        title,
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
