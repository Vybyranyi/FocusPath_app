import { Router } from 'express';
import { register, login, verifyToken } from '@controllers/authController';
import { verifyTokenMiddleware } from '@middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-token' , verifyTokenMiddleware, verifyToken);

export default router;