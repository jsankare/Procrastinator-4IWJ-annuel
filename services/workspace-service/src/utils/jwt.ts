import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class JWTUtils {
  /**
   * Verify JWT token and return payload
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET environment variable is not set');
        return null;
      }

      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.warn('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.warn('Invalid token');
      } else {
        console.error('Token verification error:', error);
      }
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = '1h'): string | null {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET environment variable is not set');
        return null;
      }

      const options: jwt.SignOptions = { expiresIn: expiresIn as any };
      return jwt.sign(payload, jwtSecret as string, options);
    } catch (error) {
      console.error('Token generation error:', error);
      return null;
    }
  }

  /**
   * Decode JWT token without verification
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }
}
