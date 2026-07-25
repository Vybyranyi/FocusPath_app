import express from 'express';
import request from 'supertest';
import { aiLimiter, authLimiter } from '@middlewares/rateLimit';

/**
 * The limiters skip themselves under NODE_ENV=test, so the suite is not
 * throttled by its own fixtures. These cases lift that skip deliberately —
 * otherwise the most expensive protection in the app would be entirely unproven.
 */
const withLimitsEnabled = (build: (app: express.Express) => void) => {
    const app = express();
    build(app);
    app.get('/', (_req, res) => {
        res.json({ ok: true });
    });
    return app;
};

describe('rate limiting', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    describe('AI habit generation', () => {
        const app = withLimitsEnabled(app => {
            // Stands in for verifyTokenMiddleware, which runs before the limiter
            // on the real route so the key can be the user rather than the address.
            app.use((req, _res, next) => {
                req.userId = req.header('x-test-user');
                next();
            });
            app.use(aiLimiter);
        });

        afterEach(() => {
            aiLimiter.resetKey('user-a');
            aiLimiter.resetKey('user-b');
        });

        it('allows five requests an hour and refuses the sixth', async () => {
            for (let attempt = 0; attempt < 5; attempt++) {
                await request(app).get('/').set('x-test-user', 'user-a').expect(200);
            }

            const response = await request(app)
                .get('/')
                .set('x-test-user', 'user-a')
                .expect(429);

            expect(response.body.message).toBe(
                'AI habit generation is limited to 5 requests per hour',
            );
        });

        it('counts per user, so one account cannot exhaust another', async () => {
            for (let attempt = 0; attempt < 6; attempt++) {
                await request(app).get('/').set('x-test-user', 'user-a');
            }

            // Same address, different account: quota is untouched.
            await request(app).get('/').set('x-test-user', 'user-b').expect(200);
        });
    });

    describe('credential endpoints', () => {
        const app = withLimitsEnabled(app => {
            app.use(authLimiter);
            app.post('/fail', (_req, res) => {
                res.status(400).json({ message: 'nope' });
            });
        });

        afterEach(() => {
            aiLimiter.resetKey('::ffff:127.0.0.1');
            authLimiter.resetKey('::ffff:127.0.0.1');
            authLimiter.resetKey('127.0.0.1');
        });

        it('caps failed attempts at ten', async () => {
            for (let attempt = 0; attempt < 10; attempt++) {
                await request(app).post('/fail').expect(400);
            }

            const response = await request(app).post('/fail').expect(429);

            expect(response.body.message).toBe(
                'Too many authentication attempts, please try again later',
            );
        });

        it('does not count successful requests against the cap', async () => {
            for (let attempt = 0; attempt < 15; attempt++) {
                await request(app).get('/').expect(200);
            }
        });
    });
});
