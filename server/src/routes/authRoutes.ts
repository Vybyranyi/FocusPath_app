import { Router } from 'express';
import {
    changePassword,
    deleteAccount,
    login,
    logout,
    me,
    refresh,
    register,
    updateProfile,
} from '@controllers/authController';
import { verifyTokenMiddleware } from '@middlewares/auth';
import { authLimiter } from '@middlewares/rateLimit';
import { validate } from '@middlewares/validate';
import {
    changePasswordSchema,
    deleteAccountSchema,
    loginSchema,
    registerSchema,
    updateProfileSchema,
} from '@validation/authSchemas';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);

// Reads the refresh cookie itself; there is no access token by the time this
// is called, which is the entire point of it.
router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/me', verifyTokenMiddleware, me);
router.patch('/profile', verifyTokenMiddleware, validate({ body: updateProfileSchema }), updateProfile);
router.patch('/password', verifyTokenMiddleware, validate({ body: changePasswordSchema }), changePassword);
router.delete('/account', verifyTokenMiddleware, validate({ body: deleteAccountSchema }), deleteAccount);

export default router;
