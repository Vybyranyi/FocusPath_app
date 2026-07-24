import { Router } from 'express';
import { register, login, verifyToken, updateProfile, changePassword, deleteAccount } from '@controllers/authController';
import { verifyTokenMiddleware } from '@middlewares/auth';

const router = Router();

router.post('/', register);
router.post('/token', login);
router.get('/token', verifyTokenMiddleware, verifyToken);
router.patch('/profile', verifyTokenMiddleware, updateProfile);
router.patch('/password', verifyTokenMiddleware, changePassword);
router.delete('/', verifyTokenMiddleware, deleteAccount);

export default router;
