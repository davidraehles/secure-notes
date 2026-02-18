import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authenticateToken, AuthRequest, generateToken } from '../auth';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

describe('authenticateToken middleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 401 if no authorization header is present', () => {
    authenticateToken(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header is present but no token', () => {
    req.headers!['authorization'] = 'Bearer ';
    authenticateToken(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
  });

  it('should return 403 if token is invalid', () => {
    req.headers!['authorization'] = 'Bearer invalid-token';

    vi.spyOn(jwt, 'verify').mockImplementation((token, secret, callback: any) => {
      callback(new Error('Invalid token'), null);
    });

    authenticateToken(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token payload is invalid (missing userId)', () => {
    req.headers!['authorization'] = 'Bearer valid-token';

    vi.spyOn(jwt, 'verify').mockImplementation((token, secret, callback: any) => {
      callback(null, {});
    });

    authenticateToken(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token payload' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and set req.userId if token is valid', () => {
    req.headers!['authorization'] = 'Bearer valid-token';
    const userId = 'user-123';

    vi.spyOn(jwt, 'verify').mockImplementation((token, secret, callback: any) => {
      callback(null, { userId });
    });

    authenticateToken(req as AuthRequest, res as Response, next);

    expect(req.userId).toBe(userId);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should reject malformed authorization header without Bearer prefix', () => {
    req.headers = { authorization: 'some-token-without-bearer' };
    authenticateToken(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('generateToken', () => {
  it('should generate a token with userId and correct expiration', () => {
    const userId = 'user-123';
    const token = generateToken(userId);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = jwt.decode(token) as any;
    expect(decoded.userId).toBe(userId);
    expect(decoded.exp).toBeDefined();
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    expect(decoded.exp).toBeGreaterThanOrEqual(nowInSeconds + sevenDaysInSeconds - 10);
    expect(decoded.exp).toBeLessThanOrEqual(nowInSeconds + sevenDaysInSeconds + 10);
  });
});
