import { Router } from 'express';
import { createHabit, getAllHabits, getHabitById } from '@controllers/habitController';
import { verifyTokenMiddleware } from '@middlewares/auth';

const router = Router();
router.post('/', verifyTokenMiddleware, createHabit);
router.get('/', verifyTokenMiddleware, getAllHabits);
router.get('/:id', verifyTokenMiddleware, getHabitById);

export default router;