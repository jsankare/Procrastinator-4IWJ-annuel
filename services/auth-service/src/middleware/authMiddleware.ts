import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils/jwt.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = JWTUtils.extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authorization token is required',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const payload = JWTUtils.verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Attach user to request
  (req as any).user = payload;
  next();
};
