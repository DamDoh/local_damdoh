/**
 * Dashboard Hubs - Index file for stakeholder-specific dashboard components
 *
 * This index file provides centralized exports for all dashboard hub components,
 * making imports cleaner and more maintainable.
 */

// Individual stakeholder dashboards
export { FarmerDashboard } from './FarmerDashboard';
export { BuyerDashboard } from './BuyerDashboard';
export { AgriTechInnovatorDashboard } from './AgriTechInnovatorDashboard';

// Generic configurable dashboard
export { StakeholderDashboard } from './StakeholderDashboard';

// Sidebar components
export { FiLeftSidebar } from './FiLeftSidebar';
export { FiRightSidebar } from './FiRightSidebar';

// Other hub components
export { DashboardRightSidebar } from './DashboardRightSidebar';
export { TrustScoreWidget } from './TrustScoreWidget';