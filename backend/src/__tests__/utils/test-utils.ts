import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.config';
import { User } from '../../models/user.model';

export interface TestUser {
  email: string;
  password: string;
  name: string;
  role: string;
}

export const createTestUser = async (userData: Partial<TestUser> = {}): Promise<TestUser & { _id: string }> => {
  const defaultUser: TestUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    role: 'FARMER',
    ...userData,
  };

  const user = await User.create(defaultUser);
  return {
    ...defaultUser,
    _id: user._id.toString()
  };
};

export const generateTestToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: '1h' }; // Fixed expiration for tests
  return jwt.sign({ id: userId }, env.JWT_SECRET || 'test-secret', options);
};

export const testUserData = {
  valid: {
    email: 'farmer@example.com',
    password: 'securepass123',
    name: 'John Farmer',
    role: 'FARMER',
  },
  invalid: {
    email: 'invalid-email',
    password: '123', // Too short
    name: '',
    role: 'INVALID_ROLE',
  },
};