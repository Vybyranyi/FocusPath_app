import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '@errors/AppError';

export interface RequestSchemas {
    body?: ZodType;
    query?: ZodType;
    params?: ZodType;
}

/** A request whose body and params have already been through a schema. */
export type TypedRequest<
    TBody = unknown,
    TParams extends Record<string, string> = Record<string, string>,
> = Request<TParams, unknown, TBody>;

/**
 * Validates the parts of a request a route declares, rejecting the whole
 * request if any part fails and reporting every problem at once, keyed by field.
 *
 * `body` and `params` are written back, so handlers receive coerced values —
 * dates arrive as Date objects, numbers as numbers, unknown keys stripped.
 *
 * `query` is checked but not written back. Express 5 exposes it through a
 * getter, and assigning to it is *silently discarded* rather than throwing, so
 * writing back would look like it worked while handlers kept reading the
 * original strings. Handlers therefore read req.query directly.
 */
export const validate =
    (schemas: RequestSchemas): RequestHandler =>
    (req: Request, _res: Response, next: NextFunction) => {
        const details: Record<string, string[]> = {};
        const formProblems: string[] = [];

        const parse = <T>(schema: ZodType<T>, value: unknown): T | undefined => {
            const result = schema.safeParse(value);
            if (result.success) {
                return result.data;
            }

            // Walked issue by issue rather than flattened: the path survives, so
            // a nested failure is reported as `steps.0.title` instead of `steps`.
            for (const issue of result.error.issues) {
                const field = issue.path.join('.');
                if (field) {
                    details[field] = [...(details[field] ?? []), issue.message];
                } else {
                    formProblems.push(issue.message);
                }
            }
            return undefined;
        };

        if (schemas.params) {
            const parsed = parse(schemas.params, req.params);
            if (parsed !== undefined) {
                req.params = parsed as typeof req.params;
            }
        }

        if (schemas.query) {
            parse(schemas.query, req.query);
        }

        if (schemas.body) {
            const parsed = parse(schemas.body, req.body);
            if (parsed !== undefined) {
                req.body = parsed;
            }
        }

        if (Object.keys(details).length > 0 || formProblems.length > 0) {
            const message = formProblems[0] ?? 'Validation failed';
            return next(new ValidationError(message, details));
        }

        next();
    };
