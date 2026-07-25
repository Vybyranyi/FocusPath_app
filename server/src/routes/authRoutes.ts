import { Router } from 'express';
import { register, login, verifyToken, updateProfile, changePassword, deleteAccount } from '@controllers/authController';
import { verifyTokenMiddleware } from '@middlewares/auth';
import { authLimiter } from '@middlewares/rateLimit';

const router = Router();

router.post('/', authLimiter, register);
router.post('/token', authLimiter, login);
router.get('/token', verifyTokenMiddleware, verifyToken);
router.patch('/profile', verifyTokenMiddleware, updateProfile);
router.patch('/password', verifyTokenMiddleware, changePassword);
router.delete('/', verifyTokenMiddleware, deleteAccount);

export default router;
