import request from 'supertest';
import { Express } from 'express';
import app from '../../app';
import { testUserData } from '../utils/test-utils';
import { User } from '../../models/user.model';

describe('Auth Routes', () => {
  let testApp: Express;

  beforeAll(() => {
    testApp = app;
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    const registerUser = async (userData: any) => {
      const response = await request(testApp)
        .post('/api/auth/register')
        .send(userData);
      return response;
    };

    it('should register a new user successfully', async () => {
      const response = await registerUser(testUserData.valid);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUserData.valid.email);
      expect(response.body.user).toHaveProperty('name', testUserData.valid.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return validation error for invalid data', async () => {
      const response = await registerUser(testUserData.invalid);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBeTruthy();
    });

    it('should not allow duplicate email registration', async () => {
      await registerUser(testUserData.valid);
      const response = await registerUser(testUserData.valid);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toContain('email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    const loginUser = async (credentials: { email: string; password: string }) => {
      const response = await request(testApp)
        .post('/api/auth/login')
        .send(credentials);
      return response;
    };

    beforeEach(async () => {
      await request(testApp)
        .post('/api/auth/register')
        .send(testUserData.valid);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await loginUser({
        email: testUserData.valid.email,
        password: testUserData.valid.password
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUserData.valid.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail with invalid password', async () => {
      const response = await loginUser({
        email: testUserData.valid.email,
        password: 'wrongpassword'
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const response = await loginUser({
        email: 'nonexistent@example.com',
        password: testUserData.valid.password
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let authToken: string;

    const refreshToken = async (token: string) => {
      const response = await request(testApp)
        .post('/api/auth/refresh-token')
        .set('Authorization', `Bearer ${token}`);
      return response;
    };

    beforeEach(async () => {
      const registerResponse = await request(testApp)
        .post('/api/auth/register')
        .send(testUserData.valid);

      authToken = registerResponse.body.token;
    });

    it('should refresh token successfully', async () => {
      const response = await refreshToken(authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(authToken);
    });

    it('should fail with invalid token', async () => {
      const response = await refreshToken('invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'fail');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    const requestPasswordReset = async (email: string) => {
      const response = await request(testApp)
        .post('/api/auth/forgot-password')
        .send({ email });
      return response;
    };

    beforeEach(async () => {
      await request(testApp)
        .post('/api/auth/register')
        .send(testUserData.valid);
    });

    it('should send reset password email for valid user', async () => {
      const response = await requestPasswordReset(testUserData.valid.email);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toContain('reset instructions sent');
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await requestPasswordReset('nonexistent@example.com');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toContain('reset instructions sent');
    });
  });
});