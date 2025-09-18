import mongoose from 'mongoose';
import { env } from './env.config';
import { logger } from '../utils/logger';

const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  const retryInterval = 5000; // 5 seconds
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      const conn = await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      
      // Handle connection events
      mongoose.connection.on('error', (err: Error) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected successfully');
      });

      // Handle process termination
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        process.exit(0);
      });

      break;
    } catch (error) {
      currentRetry++;
      logger.error(`MongoDB connection attempt ${currentRetry} failed:`, error);
      
      if (currentRetry === maxRetries) {
        logger.error('Failed to connect to MongoDB after maximum retries');
        logger.warn('Continuing without database connection');
        break;
      }
      
      logger.info(`Retrying in ${retryInterval/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
};

export default connectDB;