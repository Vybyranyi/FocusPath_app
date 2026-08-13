import { timingSafeEqual } from 'crypto';
import type { RequestHandler } from 'express';
import {
    ACCESS_COOKIE,
    CSRF_COOKIE,
    CSRF_HEADER,
    LEGACY_CSRF_COOKIE,
    REFRESH_COOKIE,
} from '@config/auth';
import { ForbiddenError } from '@errors/AppError';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const matches = (a: string, b: string): boolean => {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    // timingSafeEqual throws on a length mismatch, which is itself an answer.
    return left.length === right.length && timingSafeEqual(left, right);
};

/**
 * Double-submit CSRF check.
 *
 * A cross-site page can make the browser send cookies, but it cannot read them,
 * so it cannot reproduce the value in a header. Requiring both to match proves
 * the request came from a page that could read our cookie — which is only ours.
 *
 * Requests carrying no session cookie are let through: there is no session to
 * ride, which is also what exempts login and registration without needing a
 * list of paths that someone would eventually forget to update.
 */
export const csrfProtection: RequestHandler = (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    const hasSession = Boolean(req.cookies?.[ACCESS_COOKIE] || req.cookies?.[REFRESH_COOKIE]);
    if (!hasSession) {
        return next();
    }

    // The unprefixed name is a fallback, not an alternative: a session issued
    // before the `__Host-` prefix carries only that one, and it is accepted
    // until that session next refreshes. Outside production both names are the
    // same string and this reads one cookie.
    const cookieToken = req.cookies?.[CSRF_COOKIE] ?? req.cookies?.[LEGACY_CSRF_COOKIE];
    const headerToken = req.header(CSRF_HEADER);

    if (!cookieToken || !headerToken || !matches(cookieToken, headerToken)) {
        throw new ForbiddenError('CSRF token missing or invalid');
    }

    next();
};
