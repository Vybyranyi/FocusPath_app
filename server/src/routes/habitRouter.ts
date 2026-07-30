import { Router } from 'express';
import {
    createHabit,
    getAllHabits,
    getHabitById,
    updateHabit,
    updateDayTitle,
    deleteHabit,
    markHabitCompletion,
    getHabitsForDate,
    toggleStep,
} from '@controllers/habitController';
import { createAIHabit } from '@controllers/aiHabitController';
import { verifyTokenMiddleware } from '@middlewares/auth';
import { aiLimiter } from '@middlewares/rateLimit';
import { validate } from '@middlewares/validate';
import {
    createAIHabitSchema,
    createHabitSchema,
    habitParamsSchema,
    habitsForDateQuerySchema,
    markCompletionSchema,
    stepParamsSchema,
    updateDayTitleSchema,
    updateHabitSchema,
} from '@validation/habitSchemas';

const router = Router();

// Створення звички вручну
router.post('/', verifyTokenMiddleware, validate({ body: createHabitSchema }), createHabit);

// Створення звички через AI (ліміт після авторизації — ключ рахується по користувачу)
router.post('/ai', verifyTokenMiddleware, aiLimiter, validate({ body: createAIHabitSchema }), createAIHabit);

// Отримання звичок на конкретну дату (основний ендпоінт для щоденного відображення)
router.get('/daily', verifyTokenMiddleware, validate({ query: habitsForDateQuerySchema }), getHabitsForDate);

// Отримання всіх звичок (залишаємо для загального огляду)
router.get('/', verifyTokenMiddleware, getAllHabits);

// Операції з конкретною звичкою
router.get('/:id', verifyTokenMiddleware, validate({ params: habitParamsSchema }), getHabitById);
router.put('/:id', verifyTokenMiddleware, validate({ params: habitParamsSchema, body: updateHabitSchema }), updateHabit);
router.delete('/:id', verifyTokenMiddleware, validate({ params: habitParamsSchema }), deleteHabit);

// Оновлення дня
router.patch('/:id/day', verifyTokenMiddleware, validate({ params: habitParamsSchema, body: updateDayTitleSchema }), updateDayTitle);

// Відмітка виконання
router.patch('/:id/complete', verifyTokenMiddleware, validate({ params: habitParamsSchema, body: markCompletionSchema }), markHabitCompletion);

// Оновлення кроку (переключення статусу)
router.patch('/:id/steps/:stepId', verifyTokenMiddleware, validate({ params: stepParamsSchema }), toggleStep);

export default router;
