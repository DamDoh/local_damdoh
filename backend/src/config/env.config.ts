import { cleanEnv, str, port, url } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
    // Server
    NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
    PORT: port({ default: 8000 }),

    // MongoDB
    MONGO_ROOT_USERNAME: str(),
    MONGO_ROOT_PASSWORD: str(),
    MONGODB_URI: url(),

    // JWT
    JWT_SECRET: str(),
    JWT_EXPIRES_IN: str(),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: str({ default: '15m' }),
    RATE_LIMIT_MAX_REQUESTS: str({ default: '100' }),

    // Cors
    CORS_ORIGIN: str({ default: '*' }),

    // Logging
    LOG_LEVEL: str({ choices: ['error', 'warn', 'info', 'debug'], default: 'info' }),
});