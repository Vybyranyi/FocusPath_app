import { Router } from 'express';
import {
    getPlan,
    listMyPlans,
    listPlans,
    publishPlan,
    reportPlan,
    unpublishPlan,
    updatePlan,
} from '@controllers/planController';
import { optionalAuthMiddleware, verifyTokenMiddleware } from '@middlewares/auth';
import { publishLimiter } from '@middlewares/rateLimit';
import { validate } from '@middlewares/validate';
import {
    planParamsSchema,
    plansQuerySchema,
    publishPlanSchema,
    reportPlanSchema,
    updatePlanSchema,
} from '@validation/planSchemas';

const router = Router();

// Кабінет автора — строго перед GET /:id, інакше "mine" розбирається як
// ObjectId і валідація відповідає 400. Той самий випадок, що з /habits/daily.
router.get('/mine', verifyTokenMiddleware, listMyPlans);

// Публікація. Ліміт після авторизації — ключ рахується по користувачу.
router.post('/', verifyTokenMiddleware, publishLimiter, validate({ body: publishPlanSchema }), publishPlan);

// Читання доступне без сесії, але знає про неї: анонім бачить лише тизер.
router.get('/', optionalAuthMiddleware, validate({ query: plansQuerySchema }), listPlans);
router.get('/:id', optionalAuthMiddleware, validate({ params: planParamsSchema }), getPlan);

// Обгортка редагується, зміст заморожений; зняття з публікації — м'яке.
router.patch('/:id', verifyTokenMiddleware, validate({ params: planParamsSchema, body: updatePlanSchema }), updatePlan);
router.delete('/:id', verifyTokenMiddleware, validate({ params: planParamsSchema }), unpublishPlan);

// Скарга: пише документ у чергу, яку розбирають скриптами.
router.post('/:id/report', verifyTokenMiddleware, validate({ params: planParamsSchema, body: reportPlanSchema }), reportPlan);

export default router;
