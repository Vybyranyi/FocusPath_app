import { randomBytes } from 'crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import {
    ACCESS_TOKEN_TTL_MS,
    REFRESH_TOKEN_TTL_MS,
    accessSecret,
    refreshSecret,
} from '@config/auth';
import { UnauthorizedError } from '@errors/AppError';

interface BasePayload extends JwtPayload {
    sub: string;
    /** Checked on verification, so a refresh token can never stand in for an access token. */
    type: 'access' | 'refresh';
}

interface RefreshPayload extends BasePayload {
    type: 'refresh';
    /** Matched against the user's current version, so a bump invalidates every issued refresh token. */
    version: number;
    /** Identifies this one session, so it can be rotated or revoked on its own. */
    jti: string;
}

export const signAccessToken = (userId: string): string =>
    jwt.sign({ sub: userId, type: 'access' }, accessSecret(), {
        expiresIn: ACCESS_TOKEN_TTL_MS / 1000,
    });

/** A session id. Random rather than derived: two tokens minted in the same second must still differ. */
export const createSessionId = (): string => randomBytes(16).toString('hex');

export const signRefreshToken = (userId: string, version: number, sessionId: string): string =>
    jwt.sign({ sub: userId, type: 'refresh', version, jti: sessionId }, refreshSecret(), {
        expiresIn: REFRESH_TOKEN_TTL_MS / 1000,
    });

const decode = (token: string, secret: string): JwtPayload => {
    const payload = jwt.verify(token, secret);
    if (typeof payload === 'string') {
        throw new UnauthorizedError('Invalid token');
    }
    return payload;
};

export const verifyAccessToken = (token: string): { userId: string } => {
    const payload = decode(token, accessSecret());

    if (payload.type !== 'access' || typeof payload.sub !== 'string') {
        throw new UnauthorizedError('Invalid token');
    }

    return { userId: payload.sub };
};

export const verifyRefreshToken = (
    token: string,
): { userId: string; version: number; sessionId: string } => {
    const payload = decode(token, refreshSecret()) as RefreshPayload;

    if (
        payload.type !== 'refresh' ||
        typeof payload.sub !== 'string' ||
        typeof payload.version !== 'number' ||
        typeof payload.jti !== 'string'
    ) {
        throw new UnauthorizedError('Invalid token');
    }

    return { userId: payload.sub, version: payload.version, sessionId: payload.jti };
};

/** Unguessable value for the double-submit CSRF pair. */
export const createCsrfToken = (): string => randomBytes(32).toString('hex');
