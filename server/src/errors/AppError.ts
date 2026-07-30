/**
 * An error a handler raises on purpose, carrying everything the response needs.
 * Anything thrown that is *not* one of these is treated as a defect by the
 * error handler: logged in full, reported to the client as a bare 500.
 */
export class AppError extends Error {
    constructor(
        readonly statusCode: number,
        readonly code: string,
        message: string,
        readonly details?: Record<string, string[]>,
    ) {
        super(message);
        this.name = new.target.name;
        Error.captureStackTrace?.(this, new.target);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string, details?: Record<string, string[]>) {
        super(400, 'BAD_REQUEST', message, details);
    }
}

/** Input that failed a schema or field check. `details` is keyed by field path. */
export class ValidationError extends AppError {
    constructor(message = 'Validation failed', details?: Record<string, string[]>) {
        super(400, 'VALIDATION_ERROR', message, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(401, 'UNAUTHORIZED', message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'You do not have access to this resource') {
        super(403, 'FORBIDDEN', message);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Not found') {
        super(404, 'NOT_FOUND', message);
    }
}

/** State that clashes with what already exists — a taken email, say. */
export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, 'CONFLICT', message);
    }
}

export class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable') {
        super(503, 'SERVICE_UNAVAILABLE', message);
    }
}
