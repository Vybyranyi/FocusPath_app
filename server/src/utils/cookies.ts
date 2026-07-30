import type { Response } from 'express';
import {
    ACCESS_COOKIE,
    CSRF_COOKIE,
    REFRESH_COOKIE,
    accessCookieOptions,
    csrfCookieOptions,
    refreshCookieOptions,
} from '@config/auth';
import { createCsrfToken, signAccessToken, signRefreshToken } from '@utils/tokens';

export interface SessionTokens {
    userId: string;
    tokenVersion: number;
    sessionId: string;
}

/**
 * Puts a session on the response.
 *
 * The tokens are httpOnly, so no script can read them and an XSS cannot walk
 * off with a session the way it could with localStorage. The CSRF value is
 * deliberately readable: the client has to echo it back in a header, which is
 * something a cross-site page cannot do.
 */
export const issueSession = (
    res: Response,
    { userId, tokenVersion, sessionId }: SessionTokens,
): void => {
    res.cookie(ACCESS_COOKIE, signAccessToken(userId), accessCookieOptions);
    res.cookie(
        REFRESH_COOKIE,
        signRefreshToken(userId, tokenVersion, sessionId),
        refreshCookieOptions,
    );
    res.cookie(CSRF_COOKIE, createCsrfToken(), csrfCookieOptions);
};

/** Options must match how each cookie was set, or the browser keeps it. */
export const clearSession = (res: Response): void => {
    res.clearCookie(ACCESS_COOKIE, { ...accessCookieOptions, maxAge: undefined });
    res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: undefined });
    res.clearCookie(CSRF_COOKIE, { ...csrfCookieOptions, maxAge: undefined });
};
