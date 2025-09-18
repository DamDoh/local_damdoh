import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { logger } from './utils/logger';
import WebSocketService from './services/websocket.service';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import farmRoutes from './routes/farm.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import communityRoutes from './routes/community.routes';
import dashboardRoutes from './routes/dashboard.routes';
import networkRoutes from './routes/network.routes';
import recoveryRoutes from './routes/recovery.routes';
import couponRoutes from './routes/coupon.routes';
import agroTourismRoutes from './routes/agroTourism.routes';
import notificationRoutes from './routes/notification.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 8000;

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Server is running' });
});

// Debug logging
logger.info('Registering routes...');

// Routes
app.use('/api/auth', authRoutes);
logger.info('Registered /api/auth routes');
app.use('/api/recovery', recoveryRoutes);
logger.info('Registered /api/recovery routes');
app.use('/api/users', userRoutes);
logger.info('Registered /api/users routes');
app.use('/api/farms', farmRoutes);
logger.info('Registered /api/farms routes');
app.use('/api/marketplace', marketplaceRoutes);
logger.info('Registered /api/marketplace routes');
app.use('/api/community', communityRoutes);
logger.info('Registered /api/community routes');
app.use('/api/dashboard', dashboardRoutes);
logger.info('Registered /api/dashboard routes');
app.use('/api/notifications', notificationRoutes);
logger.info('Registered /api/notifications routes');
app.use('/api/community', communityRoutes);
logger.info('Registered /api/community routes');
app.use('/api/network', networkRoutes);
logger.info('Registered /api/network routes');
app.use('/api/coupons', couponRoutes);
logger.info('Registered /api/coupons routes');
app.use('/api/agro-tourism', agroTourismRoutes);
logger.info('Registered /api/agro-tourism routes');

// Error handling
app.use(errorHandler);

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    logger.info('MongoDB connected successfully');
  })
  .catch((error) => {
    logger.warn('Failed to connect to MongoDB, starting server without database:', error.message);
  })
  .finally(() => {
    server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`WebSocket service initialized`);
    });
  });