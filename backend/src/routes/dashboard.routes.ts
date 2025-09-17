import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { DashboardController } from '../controllers/dashboard.controller';

const router = express.Router();
const dashboardController = new DashboardController();

// Get farmer dashboard data
router.get('/farmer',
  requireAuth(),
  dashboardController.getFarmerDashboardData.bind(dashboardController)
);

// Get buyer dashboard data
router.get('/buyer',
  requireAuth(),
  dashboardController.getBuyerDashboardData.bind(dashboardController)
);

// Get user engagement stats
router.get('/engagement-stats',
  requireAuth(),
  dashboardController.getUserEngagementStats.bind(dashboardController)
);

// Get trust score
router.get('/trust-score',
  requireAuth(),
  dashboardController.getTrustScore.bind(dashboardController)
);

export default router;