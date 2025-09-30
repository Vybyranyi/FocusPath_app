import { Router } from 'express';
import { createHabit, getAllHabits } from '@controllers/habitController';
import { verifyTokenMiddleware } from '@middlewares/auth';

const router = Router();
router.post('/', verifyTokenMiddleware, createHabit);
router.get('/', verifyTokenMiddleware, getAllHabits)

export default router;