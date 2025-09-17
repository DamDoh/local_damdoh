import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import { Express } from 'express';

/**
 * Configures security middleware for the Express application
 * @param app Express application instance
 */
export const configureSecurityMiddleware = (app: Express): void => {
  // Basic security headers with helmet
  app.use(helmet());

  // Rate limiting to prevent brute-force attacks
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
  });
  app.use(limiter);

  // Stricter rate limits for authentication routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 login requests per hour
    message: 'Too many login attempts, please try again later',
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Compress responses
  app.use(compression());

  // Sanitize data to prevent MongoDB injection
  app.use(mongoSanitize());
};