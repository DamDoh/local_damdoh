import { NextFunction, Request, Response } from 'express';
import TokenService from '../services/token.service';
import { TokenPayload } from '../types/token.types';
import mongoose from 'mongoose';

export const requireAuth = (roles?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = TokenService.verifyToken(token);

      // Add decoded user info to request
      req.user = decoded;

      // If roles are specified, check if user has required role
      if (roles && roles.length > 0) {
        if (!decoded.role || !roles.includes(decoded.role)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      next();
    } catch (error) {
      res.status(401).json({ error: 'Request is not authorized' });
    }
  };
};

export const refreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = TokenService.verifyToken(refreshToken) as TokenPayload;
    const tokens = TokenService.generateAuthTokens(
      decoded.userId.toString(),
      decoded.role
    );

    // Add tokens to response
    res.locals.tokens = tokens;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};