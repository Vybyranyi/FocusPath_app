import type { CookieOptions } from 'express';
import { logger } from '@config/logger';

const isProduction = process.env.NODE_ENV === 'production';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
/** Readable by scripts on purpose — the client has to echo it back in a header. */
export const CSRF_COOKIE = 'csrf_token';
export const CSRF_HEADER = 'x-csrf-token';

/** Short enough that a revoked session dies quickly, long enough to avoid churn. */
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const resolveSecret = (name: string): string => {
    const specific = process.env[name];
    if (specific) {
        return specific;
    }

    const shared = process.env.JWT_SECRET;
    if (!shared) {
        throw new Error(`${name} or JWT_SECRET must be set`);
    }

    if (isProduction) {
        throw new Error(`${name} must be set in production`);
    }

    // Safe in the sense that a token of one kind cannot be replayed as the
    // other — every token carries its type and verification checks it — but
    // separate secrets contain the blast radius, so say something.
    logger.warn(`${name} is not set; falling back to JWT_SECRET. Set it before deploying.`);
    return shared;
};

export const accessSecret = () => resolveSecret('JWT_ACCESS_SECRET');
export const refreshSecret = () => resolveSecret('JWT_REFRESH_SECRET');

/**
 * `sameSite` defaults to lax, which already blocks cross-site state-changing
 * requests when the browser app and API share a site. A deployment that splits
 * them across domains needs `none` — and then the CSRF token stops being
 * belt-and-braces and becomes the actual defence.
 */
const sameSite = (process.env.COOKIE_SAMESITE ?? 'lax') as CookieOptions['sameSite'];

const base: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
};

export const accessCookieOptions: CookieOptions = {
    ...base,
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_MS,
};

/**
 * Scoped to /auth so the refresh token is not attached to ordinary API calls;
 * it only travels when it is actually needed, including to logout so that
 * clearing it works.
 */
export const refreshCookieOptions: CookieOptions = {
    ...base,
    path: '/auth',
    maxAge: REFRESH_TOKEN_TTL_MS,
};

export const csrfCookieOptions: CookieOptions = {
    ...base,
    httpOnly: false,
    path: '/',
    maxAge: REFRESH_TOKEN_TTL_MS,
};
