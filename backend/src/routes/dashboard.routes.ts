import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * GET /api/dashboard/layouts
 * Get all user dashboard layouts
 */
router.get('/layouts', async (req, res) => {
  try {
    // For now, return mock data. In production, this would fetch from database
    const mockLayouts = [
      {
        id: 'default-layout',
        name: 'My Dashboard',
        widgets: [
          {
            id: 'default-daily-ops',
            type: 'daily-operations',
            title: 'Daily Operations',
            position: { x: 0, y: 0 },
            size: { width: 2, height: 2 },
            visible: true
          },
          {
            id: 'default-analytics',
            type: 'business-analytics',
            title: 'Business Intelligence',
            position: { x: 2, y: 0 },
            size: { width: 2, height: 2 },
            visible: true
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: true
      }
    ];

    res.json({ layouts: mockLayouts });
  } catch (error) {
    console.error('Error fetching dashboard layouts:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard layouts' });
  }
});

/**
 * POST /api/dashboard/layouts
 * Save a new dashboard layout
 */
router.post('/layouts', async (req, res) => {
  try {
    const { name, widgets } = req.body;

    if (!name || !Array.isArray(widgets)) {
      return res.status(400).json({
        error: 'Missing required fields: name and widgets array'
      });
    }

    // Mock response - in production, save to database
    const newLayout = {
      id: `layout-${Date.now()}`,
      name,
      widgets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: false
    };

    res.status(201).json({ layout: newLayout });
  } catch (error) {
    console.error('Error saving dashboard layout:', error);
    res.status(500).json({ error: 'Failed to save dashboard layout' });
  }
});

/**
 * PUT /api/dashboard/layouts/:layoutId
 * Update an existing dashboard layout
 */
router.put('/layouts/:layoutId', async (req, res) => {
  try {
    const { layoutId } = req.params;
    const updates = req.body;

    // Mock response - in production, update in database
    const updatedLayout = {
      id: layoutId,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json({ layout: updatedLayout });
  } catch (error) {
    console.error('Error updating dashboard layout:', error);
    res.status(500).json({ error: 'Failed to update dashboard layout' });
  }
});

/**
 * DELETE /api/dashboard/layouts/:layoutId
 * Delete a dashboard layout
 */
router.delete('/layouts/:layoutId', async (req, res) => {
  try {
    const { layoutId } = req.params;

    // Mock response - in production, delete from database
    res.json({ success: true, message: 'Layout deleted successfully' });
  } catch (error) {
    console.error('Error deleting dashboard layout:', error);
    res.status(500).json({ error: 'Failed to delete dashboard layout' });
  }
});

/**
 * GET /api/dashboard/widgets
 * Get available widget definitions
 */
router.get('/widgets', async (req, res) => {
  try {
    const widgets = [
      // Farm Management Widgets
      {
        type: 'daily-operations',
        name: 'Daily Operations',
        description: 'Track daily farming activities and tasks',
        category: 'farm-management',
        defaultSize: { width: 2, height: 2 },
        icon: '🚜',
        preview: '/widget-previews/daily-operations.png'
      },
      {
        type: 'farm-resources',
        name: 'Farm Resources',
        description: 'Monitor equipment, inputs, and resource availability',
        category: 'farm-management',
        defaultSize: { width: 2, height: 1 },
        icon: '📦',
        preview: '/widget-previews/farm-resources.png'
      },
      {
        type: 'seasonal-calendar',
        name: 'Seasonal Calendar',
        description: 'Plan and track seasonal farming activities',
        category: 'farm-management',
        defaultSize: { width: 2, height: 2 },
        icon: '📅',
        preview: '/widget-previews/seasonal-calendar.png'
      },

      // Business Intelligence Widgets
      {
        type: 'business-analytics',
        name: 'Business Analytics',
        description: 'Key performance indicators and business insights',
        category: 'business-intelligence',
        defaultSize: { width: 2, height: 2 },
        icon: '📊',
        preview: '/widget-previews/business-analytics.png'
      },
      {
        type: 'quick-stats',
        name: 'Quick Stats',
        description: 'Essential metrics at a glance',
        category: 'business-intelligence',
        defaultSize: { width: 2, height: 1 },
        icon: '⚡',
        preview: '/widget-previews/quick-stats.png'
      },

      // Communication Widgets
      {
        type: 'connection-suggestions',
        name: 'Smart Connections',
        description: 'AI-powered networking recommendations',
        category: 'communication',
        defaultSize: { width: 2, height: 2 },
        icon: '🤝',
        preview: '/widget-previews/connection-suggestions.png'
      },

      // Social Widgets
      {
        type: 'achievement-badges',
        name: 'Achievements',
        description: 'Track your farming milestones and badges',
        category: 'social',
        defaultSize: { width: 2, height: 1 },
        icon: '🏆',
        preview: '/widget-previews/achievement-badges.png'
      }
    ];

    res.json({ widgets });
  } catch (error) {
    console.error('Error fetching widgets:', error);
    res.status(500).json({ error: 'Failed to fetch widgets' });
  }
});

export default router;