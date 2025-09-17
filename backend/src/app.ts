import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { configureSecurityMiddleware } from './middleware/security.middleware';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import connectDB from './config/database';
import { env } from './config/env.config';
import { swaggerSpec } from './config/swagger.config';

// Import routes
import authRoutes from './routes/auth.routes';

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Basic middleware
app.use(requestLogger); // Add request logging first to capture all requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Configure security middleware
configureSecurityMiddleware(app);

// Routes
app.use('/api/auth', authRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

export default app;