import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { User, StakeholderRole } from '../models/user.model';
import TokenService from '../services/token.service';
import { logger } from '../utils/logger';

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  role: StakeholderRole;
  phoneNumber?: string;
  location?: {
    coordinates: [number, number];
  };
}

interface LoginBody {
  email: string;
  password: string;
}

export class AuthController {
  static async register(req: Request<{}, {}, RegisterBody>, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, role, phoneNumber, location } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const user = new User({
        email,
        password,
        name,
        role,
        phoneNumber,
        ...(location && location.coordinates ? {
          location: {
            type: 'Point',
            coordinates: location.coordinates,
          },
        } : {}),
      });

      await user.save();

      const tokens = TokenService.generateAuthTokens(user._id, user.role);

      res.status(201).json({
        message: 'User registered successfully',
        ...tokens,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber,
          location: user.location,
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  static async login(req: Request<{}, {}, LoginBody>, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const tokens = TokenService.generateAuthTokens(user._id, user.role);

      res.json({
        ...tokens,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber,
          location: user.location,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    // The tokens are already generated in the middleware
    const { tokens } = res.locals;
    res.json(tokens);
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
}