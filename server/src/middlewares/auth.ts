import type { NextFunction, Request, Response } from "express";
import { ACCESS_COOKIE } from "@config/auth";
import { UnauthorizedError } from "@errors/AppError";
import { verifyAccessToken } from "@utils/tokens";

/**
 * Reads the session from the httpOnly access cookie.
 *
 * Verification is synchronous and the throw is left to travel: Express routes
 * it to the error handler, which turns a bad signature into a 401 and an
 * expired token into its own code, so the client knows to refresh rather than
 * to send the user back to the sign-in screen.
 */
export const verifyTokenMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[ACCESS_COOKIE];

    if (!token) {
        throw new UnauthorizedError("Not authenticated");
    }

    req.userId = verifyAccessToken(token).userId;
    next();
};

/**
 * Recognises the caller if there is one, and lets everyone else through.
 *
 * The library is readable without an account, but what it shows depends on
 * whether someone is signed in — so these routes need to know about a session
 * without requiring one. A missing, forged or expired token is not an error
 * here; it simply means the reader is a guest, and the response narrows itself
 * accordingly.
 */
export const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[ACCESS_COOKIE];

    if (token) {
        try {
            req.userId = verifyAccessToken(token).userId;
        } catch {
            // Deliberately swallowed. Throwing would turn a stale cookie into a
            // 401 on a page that is meant to work with no cookie at all.
        }
    }

    next();
};
