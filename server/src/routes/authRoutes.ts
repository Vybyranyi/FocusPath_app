import { Router } from 'express';
import { register, login, verifyToken } from '@controllers/authController';
import { verifyTokenMiddleware } from '@middlewares/auth';

const router = Router();

router.post('/', register);
router.post('/token', login);
router.get('/token', verifyTokenMiddleware, verifyToken);

export default router;
