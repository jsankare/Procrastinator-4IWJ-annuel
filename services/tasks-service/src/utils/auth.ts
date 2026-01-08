import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production_please';

/**
 * Middleware to verify JWT token and extract user information
 */
export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'No token provided',
            timestamp: new Date().toISOString(),
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Invalid token',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Error verifying token',
            timestamp: new Date().toISOString(),
        });
    }
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
        });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Admin access required',
            timestamp: new Date().toISOString(),
        });
        return;
    }

    next();
};
