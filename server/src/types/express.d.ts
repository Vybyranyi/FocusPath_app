declare global {
    namespace Express {
        interface Request {
            /** The authenticated user's id, set by verifyTokenMiddleware from the bearer token. */
            userId?: string;
        }
    }
}

export {};
