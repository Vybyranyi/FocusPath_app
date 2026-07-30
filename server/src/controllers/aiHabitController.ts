import { Response } from 'express';
import * as habitService from '@services/habitService';
import { created } from '@utils/apiResponse';
import { UnauthorizedError } from '@errors/AppError';
import type { TypedRequest } from '@middlewares/validate';
import type { CreateAIHabitDto } from '@validation/habitSchemas';

export const createAIHabit = async (req: TypedRequest<CreateAIHabitDto>, res: Response) => {
    if (!req.userId) {
        throw new UnauthorizedError();
    }

    const habit = await habitService.createAIHabit(req.userId, req.body);

    return created(res, { habit, aiGenerated: true });
};
