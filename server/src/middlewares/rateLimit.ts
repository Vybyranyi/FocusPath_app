import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

/**
 * Throttling is off under test. The suite deliberately registers and logs in
 * far more often than any real client, so leaving limits on would only measure
 * the limiter. Every other environment, development included, gets real limits.
 */
const skip = () => process.env.NODE_ENV === 'test';

const headers = { standardHeaders: true, legacyHeaders: false } as const;

/** Blanket ceiling, so no single client can flood the API. */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    ...headers,
    skip,
    message: { message: 'Too many requests, please try again later' },
});

/**
 * Credential endpoints. Successful calls are not counted, so someone signing in
 * legitimately is never affected while brute force is capped at ten misses.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    ...headers,
    skip,
    message: { message: 'Too many authentication attempts, please try again later' },
});

/**
 * Habit generation spends real money at OpenAI on every call, so it is keyed by
 * user rather than by address: sharing an office network should not let one
 * person burn everyone's quota, and rotating addresses should not multiply it.
 */
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    keyGenerator: req => req.userId ?? ipKeyGenerator(req.ip ?? ''),
    ...headers,
    skip,
    message: { message: 'AI habit generation is limited to 5 requests per hour' },
});
