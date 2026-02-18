/**
 * JWT authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

// Require JWT_SECRET in all environments — no hardcoded fallback
const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const JWT_SECRET: string = secret;

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Try to get token from cookie if not in header
  if (!token && req.cookies) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
      req.userId = decoded.userId as string;
      next();
    } else {
      return res.status(403).json({ message: 'Invalid token payload' });
    }
  });
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
