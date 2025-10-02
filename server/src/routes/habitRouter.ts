import { Router } from 'express';
import { createHabit, getAllHabits, getHabitById, updateHabit, deleteHabit, markHabitCompletion } from '@controllers/habitController';
import { verifyTokenMiddleware } from '@middlewares/auth';

const router = Router();
router.post('/', verifyTokenMiddleware, createHabit);
router.get('/', verifyTokenMiddleware, getAllHabits);
router.get('/:id', verifyTokenMiddleware, getHabitById);
router.put('/:id', verifyTokenMiddleware, updateHabit);
router.delete('/:id', verifyTokenMiddleware, deleteHabit);
router.patch('/:id/complete', verifyTokenMiddleware, markHabitCompletion);

export default router;