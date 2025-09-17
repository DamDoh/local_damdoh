import winston from 'winston';
import { env } from '../config/env.config';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom log format for development
const devLogFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const meta = Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : '';
  return `${timestamp} [${level}]: ${message} ${meta}`;
});

// Configure logger based on environment
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp(),
    env.NODE_ENV === 'development' ? devLogFormat : json()
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        devLogFormat
      ),
    }),
  ],
});