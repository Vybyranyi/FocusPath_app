import { Router } from 'express';
import { register, login, verifyToken, updateProfile, changePassword, deleteAccount } from '@controllers/authController';
import { verifyTokenMiddleware } from '@middlewares/auth';
import { authLimiter } from '@middlewares/rateLimit';
import { validate } from '@middlewares/validate';
import {
    changePasswordSchema,
    loginSchema,
    registerSchema,
    updateProfileSchema,
} from '@validation/authSchemas';

const router = Router();

router.post('/', authLimiter, validate({ body: registerSchema }), register);
router.post('/token', authLimiter, validate({ body: loginSchema }), login);
router.get('/token', verifyTokenMiddleware, verifyToken);
router.patch('/profile', verifyTokenMiddleware, validate({ body: updateProfileSchema }), updateProfile);
router.patch('/password', verifyTokenMiddleware, validate({ body: changePasswordSchema }), changePassword);
router.delete('/', verifyTokenMiddleware, deleteAccount);

export default router;
