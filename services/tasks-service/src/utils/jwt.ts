// @ts-ignore: types resolved in container runtime
import jwt from 'jsonwebtoken'

// @ts-ignore: process types available at runtime
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-please'

export type JWTPayload = {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1] || null
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}
