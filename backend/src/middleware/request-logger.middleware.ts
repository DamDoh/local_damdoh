import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Get the start time
  const start = Date.now();

  // Log the incoming request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Process the request
  res.on('finish', () => {
    // Calculate processing time
    const duration = Date.now() - start;

    // Log the response
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    logger[logLevel]('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    });
  });

  next();
};