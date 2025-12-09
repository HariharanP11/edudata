// edudata-backend/src/middleware/auth.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * This file wraps the existing JS middleware (auth.js / auth.middleware.js) and re-exports
 * typed functions for use in other TypeScript files.
 *
 * It tries to import common export shapes (named or default) to be resilient.
 */
const rawAuthModule = require('./auth.js') || require('./auth.middleware.js') || {};

type AuthHandler = (req: Request, res: Response, next: NextFunction) => any;

/** typed wrapper for auth middleware */
export const auth: AuthHandler = (req, res, next) => {
  const fn: AuthHandler = rawAuthModule.auth || rawAuthModule.default?.auth || rawAuthModule.authMiddleware || rawAuthModule;
  return fn(req, res, next);
};

/** typed wrapper for requireRole(role) -> middleware */
export const requireRole = (role: string): RequestHandler => {
  const factory = rawAuthModule.requireRole || rawAuthModule.hasRole || rawAuthModule.require_role;
  if (typeof factory === 'function') {
    return (req: Request, res: Response, next: NextFunction) =>
      (factory(role) as RequestHandler)(req, res, next);
  }
  // fallback: simple checker (if raw factory not present)
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore - try to use user attached by auth
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    if (user.role === role || user.role === 'admin') return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
};
