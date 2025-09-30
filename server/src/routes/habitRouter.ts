import { Router } from 'express';
import { createHabit, getAllHabits, getHabitById, updateHabit } from '@controllers/habitController';
import { verifyTokenMiddleware } from '@middlewares/auth';

const router = Router();
router.post('/', verifyTokenMiddleware, createHabit);
router.get('/', verifyTokenMiddleware, getAllHabits);
router.get('/:id', verifyTokenMiddleware, getHabitById);
router.put('/:id', verifyTokenMiddleware, updateHabit);

export default router;