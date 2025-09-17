import { ObjectId } from 'mongoose';

export interface TokenPayload {
  userId: string | ObjectId;
  role?: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}