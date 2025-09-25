import { Router } from 'express';
import { createHabit } from '@controllers/habitController';
import { verifyTokenMiddleware } from '@middlewares/auth';

const router = Router();
router.post('/create', verifyTokenMiddleware, createHabit);

export default router;