import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError, NotFoundError } from '@errors/AppError';
import { logger } from '@config/logger';
import { fail } from '@utils/apiResponse';

/** Collapses a Mongoose validation error into field -> messages, dropping the rest. */
const fieldMessages = (
    error: mongoose.Error.ValidationError,
): Record<string, string[]> =>
    Object.entries(error.errors).reduce<Record<string, string[]>>(
        (accumulator, [path, detail]) => {
            accumulator[path] = [detail.message];
            return accumulator;
        },
        {},
    );

/** Body-parser tags its own failures; they arrive as generic errors otherwise. */
const bodyParserType = (error: unknown): string | undefined =>
    typeof error === 'object' && error !== null && 'type' in error
        ? String((error as { type: unknown }).type)
        : undefined;

const duplicateKeyField = (error: unknown): string | undefined => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: unknown }).code === 11000 &&
        'keyPattern' in error
    ) {
        return Object.keys((error as { keyPattern: Record<string, unknown> }).keyPattern)[0];
    }
    return undefined;
};

/** Anything that falls through the routing table. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
};

/**
 * The single place a failure becomes a response.
 *
 * Express 5 forwards rejected promises here on its own, so handlers throw and
 * never catch. Deliberate failures (AppError) are reported as written; known
 * library errors are translated; anything else is a defect and is reported as a
 * bare 500 with the detail kept in the log rather than sent to the caller.
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const context = { method: req.method, path: req.path, err: error };

    if (error instanceof AppError) {
        // 5xx means we broke something even when raised deliberately.
        if (error.statusCode >= 500) {
            logger.error(context, error.message);
        } else {
            logger.warn({ method: req.method, path: req.path }, error.message);
        }
        return fail(res, error.statusCode, error.code, error.message, error.details);
    }

    if (error instanceof mongoose.Error.ValidationError) {
        return fail(res, 400, 'VALIDATION_ERROR', 'Validation failed', fieldMessages(error));
    }

    if (error instanceof mongoose.Error.CastError) {
        return fail(res, 400, 'BAD_REQUEST', `Invalid value for '${error.path}'`);
    }

    const duplicated = duplicateKeyField(error);
    if (duplicated) {
        return fail(res, 409, 'CONFLICT', `That ${duplicated} is already taken`);
    }

    if (error instanceof TokenExpiredError) {
        return fail(res, 401, 'TOKEN_EXPIRED', 'Session expired, please sign in again');
    }

    if (error instanceof JsonWebTokenError) {
        return fail(res, 401, 'UNAUTHORIZED', 'Invalid token');
    }

    switch (bodyParserType(error)) {
        case 'entity.too.large':
            return fail(res, 413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
        case 'entity.parse.failed':
            return fail(res, 400, 'BAD_REQUEST', 'Request body is not valid JSON');
    }

    // Unrecognised: a defect. The client learns nothing beyond "we broke".
    logger.error(context, 'Unhandled error');
    return fail(res, 500, 'INTERNAL_ERROR', 'Something went wrong on our side');
};
