import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    // In a real implementation, you would verify the token with your JWT secret
    const decoded = jwt.verify(token, 'your-jwt-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};