/**
 * The envelope every endpoint replies with, so the client has one shape to
 * branch on instead of guessing per route.
 */
export interface ApiSuccess<T> {
    success: true;
    data: T;
}

export interface ApiFailure {
    success: false;
    error: {
        /** Stable machine-readable code, e.g. `VALIDATION_ERROR`, `NOT_FOUND`. */
        code: string;
        /** Message safe to show a user. Never carries internal state or stack traces. */
        message: string;
        /** Field-level detail from schema validation, keyed by field path. */
        details?: Record<string, string[]>;
    };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
