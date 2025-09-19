/**
 * Dashboard Configuration Service - Manages user dashboard layouts and widget configurations
 * Enables personalized dashboard experiences with drag-and-drop widget management
 * Single Responsibility: Dashboard layout persistence and configuration management
 * Dependencies: localStorage for client-side persistence, API for server-side sync
 */

import { apiCall } from '@/lib/api-utils';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings?: Record<string, any>;
  visible: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface WidgetDefinition {
  type: string;
  name: string;
  description: string;
  category: 'farm-management' | 'business-intelligence' | 'communication' | 'analytics' | 'social';
  defaultSize: { width: number; height: number };
  icon: string;
  preview: string;
}

export class DashboardConfigService {
  private static instance: DashboardConfigService;
  private readonly STORAGE_KEY = 'damdoh-dashboard-configs';
  private readonly CURRENT_LAYOUT_KEY = 'damdoh-current-layout';

  static getInstance(): DashboardConfigService {
    if (!DashboardConfigService.instance) {
      DashboardConfigService.instance = new DashboardConfigService();
    }
    return DashboardConfigService.instance;
  }

  /**
   * Get all available widget definitions
   */
  getAvailableWidgets(): WidgetDefinition[] {
    return [
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
      {
        type: 'performance-analytics',
        name: 'Performance Analytics',
        description: 'Detailed performance metrics and trends',
        category: 'analytics',
        defaultSize: { width: 2, height: 2 },
        icon: '📈',
        preview: '/widget-previews/performance-analytics.png'
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
      {
        type: 'achievement-badges',
        name: 'Achievements',
        description: 'Track your farming milestones and badges',
        category: 'social',
        defaultSize: { width: 2, height: 1 },
        icon: '🏆',
        preview: '/widget-previews/achievement-badges.png'
      },

      // Weather and External Data
      {
        type: 'weather-widget',
        name: 'Weather Forecast',
        description: 'Local weather conditions and forecasts',
        category: 'analytics',
        defaultSize: { width: 1, height: 1 },
        icon: '🌤️',
        preview: '/widget-previews/weather.png'
      },
      {
        type: 'market-intelligence',
        name: 'Market Intelligence',
        description: 'Real-time market prices and trends',
        category: 'business-intelligence',
        defaultSize: { width: 2, height: 1 },
        icon: '💰',
        preview: '/widget-previews/market-intelligence.png'
      }
    ];
  }

  /**
   * Get user's saved dashboard layouts
   */
  async getUserLayouts(): Promise<DashboardLayout[]> {
    try {
      // Try to get from API first
      const result = await apiCall('/api/dashboard/layouts') as { layouts?: DashboardLayout[] };
      return result.layouts || [];
    } catch (error) {
      // Fallback to localStorage
      console.warn('API unavailable, using localStorage for dashboard layouts');
      return this.getLocalLayouts();
    }
  }

  /**
   * Get current active layout
   */
  async getCurrentLayout(): Promise<DashboardLayout | null> {
    try {
      const layouts = await this.getUserLayouts();
      const currentLayoutId = localStorage.getItem(this.CURRENT_LAYOUT_KEY);

      if (currentLayoutId) {
        return layouts.find(layout => layout.id === currentLayoutId) || null;
      }

      // Return default layout or first available
      return layouts.find(layout => layout.isDefault) || layouts[0] || null;
    } catch (error) {
      console.error('Error getting current layout:', error);
      return null;
    }
  }

  /**
   * Save a dashboard layout
   */
  async saveLayout(layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>): Promise<DashboardLayout> {
    try {
      const layoutData = {
        ...layout,
        updatedAt: new Date()
      };

      const result = await apiCall('/api/dashboard/layouts', {
        method: 'POST',
        body: JSON.stringify(layoutData),
      }) as { layout: DashboardLayout };

      // Update current layout reference
      localStorage.setItem(this.CURRENT_LAYOUT_KEY, result.layout.id);

      return result.layout;
    } catch (error) {
      // Fallback to localStorage
      console.warn('API unavailable, saving to localStorage');
      return this.saveLocalLayout(layout);
    }
  }

  /**
   * Update an existing layout
   */
  async updateLayout(layoutId: string, updates: Partial<DashboardLayout>): Promise<DashboardLayout> {
    try {
      const result = await apiCall(`/api/dashboard/layouts/${layoutId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updates, updatedAt: new Date() }),
      }) as { layout: DashboardLayout };

      return result.layout;
    } catch (error) {
      // Fallback to localStorage
      console.warn('API unavailable, updating localStorage');
      return this.updateLocalLayout(layoutId, updates);
    }
  }

  /**
   * Delete a layout
   */
  async deleteLayout(layoutId: string): Promise<void> {
    try {
      await apiCall(`/api/dashboard/layouts/${layoutId}`, {
        method: 'DELETE',
      });

      // Clear current layout if it was deleted
      const currentLayoutId = localStorage.getItem(this.CURRENT_LAYOUT_KEY);
      if (currentLayoutId === layoutId) {
        localStorage.removeItem(this.CURRENT_LAYOUT_KEY);
      }
    } catch (error) {
      // Fallback to localStorage
      console.warn('API unavailable, deleting from localStorage');
      this.deleteLocalLayout(layoutId);
    }
  }

  /**
   * Set active layout
   */
  setCurrentLayout(layoutId: string): void {
    localStorage.setItem(this.CURRENT_LAYOUT_KEY, layoutId);
  }

  /**
   * Create default layout for new users
   */
  createDefaultLayout(): DashboardLayout {
    const defaultWidgets: WidgetConfig[] = [
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
      },
      {
        id: 'default-connections',
        type: 'connection-suggestions',
        title: 'Smart Connections',
        position: { x: 0, y: 2 },
        size: { width: 2, height: 2 },
        visible: true
      },
      {
        id: 'default-achievements',
        type: 'achievement-badges',
        title: 'Achievements',
        position: { x: 2, y: 2 },
        size: { width: 2, height: 1 },
        visible: true
      }
    ];

    return {
      id: 'default-layout',
      name: 'My Dashboard',
      widgets: defaultWidgets,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true
    };
  }

  // Local storage fallback methods
  private getLocalLayouts(): DashboardLayout[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const layouts = JSON.parse(stored);
        return layouts.map((layout: any) => ({
          ...layout,
          createdAt: new Date(layout.createdAt),
          updatedAt: new Date(layout.updatedAt)
        }));
      }
    } catch (error) {
      console.warn('Error reading layouts from localStorage:', error);
    }
    return [this.createDefaultLayout()];
  }

  private saveLocalLayout(layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>): DashboardLayout {
    const newLayout: DashboardLayout = {
      ...layout,
      id: `layout-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const layouts = this.getLocalLayouts();
    layouts.push(newLayout);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layouts));

    return newLayout;
  }

  private updateLocalLayout(layoutId: string, updates: Partial<DashboardLayout>): DashboardLayout {
    const layouts = this.getLocalLayouts();
    const index = layouts.findIndex(layout => layout.id === layoutId);

    if (index !== -1) {
      layouts[index] = { ...layouts[index], ...updates, updatedAt: new Date() };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layouts));
      return layouts[index];
    }

    throw new Error('Layout not found');
  }

  private deleteLocalLayout(layoutId: string): void {
    const layouts = this.getLocalLayouts();
    const filteredLayouts = layouts.filter(layout => layout.id !== layoutId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredLayouts));
  }
}