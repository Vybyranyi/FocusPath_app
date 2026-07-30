import { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "@errors/AppError";

const jwtSecret = process.env.JWT_SECRET as string;

const BEARER_PREFIX = "Bearer ";

interface AccessTokenPayload extends JwtPayload {
    id: string;
}

/**
 * Verifies synchronously and lets the throw travel: Express routes it to the
 * error handler, which turns a bad signature into a 401 and an expired token
 * into its own code so the client knows to refresh rather than to sign in again.
 */
export const verifyTokenMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith(BEARER_PREFIX)) {
        throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.slice(BEARER_PREFIX.length).trim();
    if (!token) {
        throw new UnauthorizedError("No token provided");
    }

    const decoded = jwt.verify(token, jwtSecret) as AccessTokenPayload;
    if (!decoded.id) {
        throw new UnauthorizedError("Invalid token");
    }

    req.userId = decoded.id;
    next();
};
