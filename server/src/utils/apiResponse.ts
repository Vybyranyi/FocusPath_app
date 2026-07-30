import type { Response } from 'express';
import type { ApiFailure, ApiSuccess } from '@shared/index';

/**
 * Sends the success half of the envelope. Every endpoint replies through this,
 * so the client has one shape to branch on rather than a different one per route.
 */
export const ok = <T>(res: Response, data: T, statusCode = 200): Response =>
    res.status(statusCode).json({ success: true, data } satisfies ApiSuccess<T>);

/** 201 with the created resource. */
export const created = <T>(res: Response, data: T): Response => ok(res, data, 201);

/** Sends the failure half. Used by the error handler; handlers themselves throw. */
export const fail = (
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, string[]>,
): Response =>
    res.status(statusCode).json({
        success: false,
        error: { code, message, ...(details ? { details } : {}) },
    } satisfies ApiFailure);
