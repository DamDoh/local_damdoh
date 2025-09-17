import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

interface TokenPayload {
  userId: string;
  role?: string;
}

class TokenService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  static generateAccessToken(userId: string | Types.ObjectId, role?: string): string {
    const payload: TokenPayload = { userId: userId.toString() };
    if (role) payload.role = role;

    const options: SignOptions = {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    };

    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  static generateRefreshToken(userId: string | Types.ObjectId): string {
    const payload: TokenPayload = { userId: userId.toString() };
    
    const options: SignOptions = {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    };

    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static generateAuthTokens(userId: string | Types.ObjectId, role?: string) {
    const accessToken = this.generateAccessToken(userId, role);
    const refreshToken = this.generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
    };
  }
}

export default TokenService;