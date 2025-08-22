import { Request as ExRequest, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET as string;

interface AuthRequest extends ExRequest {
  userId?: string;
}

export const verifyTokenMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    };

    const token = authHeader.split(" ")[1];

    jwt.verify(token, jwtSecret, (error, decoded: any) => {
        if (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.userId = decoded.id;
        next();
    });
};