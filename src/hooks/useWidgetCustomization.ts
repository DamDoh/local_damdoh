/**
 * Widget Customization Hook - Advanced dashboard personalization
 * Enables drag-and-drop, hide/show, resize, and layout persistence
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-utils'

export interface WidgetConfig {
  id: string
  component: string
  title: string
  visible: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  category: 'left' | 'center' | 'right' | 'top' | 'bottom'
  priority: number // For ordering within category
}

export interface LayoutConfig {
  stakeholderType: string
  widgets: WidgetConfig[]
  lastModified: string
  version: string
}

const STORAGE_KEY = 'damdoh-dashboard-layouts'
const LAYOUT_VERSION = '1.0.0'

// Default widget configurations for each stakeholder type
const getDefaultWidgets = (stakeholderType: string): WidgetConfig[] => {
  const baseWidgets: WidgetConfig[] = [
    {
      id: 'stories',
      component: 'StoriesWidget',
      title: 'Stories',
      visible: true,
      position: { x: 0, y: 0 },
      size: { width: 2, height: 1 },
      category: 'top',
      priority: 1
    }
  ]

  switch (stakeholderType) {
    case 'Farmer':
      return [
        ...baseWidgets,
        {
          id: 'weather',
          component: 'WeatherWidget',
          title: 'Weather',
          visible: true,
          position: { x: 2, y: 0 },
          size: { width: 1, height: 1 },
          category: 'top',
          priority: 2
        },
        {
          id: 'daily-operations',
          component: 'DailyOperationsWidget',
          title: 'Daily Operations',
          visible: true,
          position: { x: 0, y: 1 },
          size: { width: 1, height: 2 },
          category: 'left',
          priority: 1
        },
        {
          id: 'farm-resources',
          component: 'FarmResourcesWidget',
          title: 'Farm Resources',
          visible: true,
          position: { x: 0, y: 3 },
          size: { width: 1, height: 2 },
          category: 'left',
          priority: 2
        },
        {
          id: 'market-intelligence',
          component: 'MarketIntelligenceWidget',
          title: 'Market Intelligence',
          visible: true,
          position: { x: 0, y: 1 },
          size: { width: 1, height: 1 },
          category: 'right',
          priority: 1
        },
        {
          id: 'seasonal-calendar',
          component: 'SeasonalCalendarWidget',
          title: 'Seasonal Calendar',
          visible: true,
          position: { x: 0, y: 0 },
          size: { width: 1, height: 1 },
          category: 'bottom',
          priority: 1
        }
      ]

    case 'Buyer':
      return [
        ...baseWidgets,
        {
          id: 'supplier-discovery',
          component: 'SupplierDiscoveryWidget',
          title: 'Supplier Discovery',
          visible: true,
          position: { x: 0, y: 1 },
          size: { width: 1, height: 2 },
          category: 'left',
          priority: 1
        },
        {
          id: 'order-management',
          component: 'OrderManagementWidget',
          title: 'Order Management',
          visible: true,
          position: { x: 0, y: 3 },
          size: { width: 1, height: 2 },
          category: 'left',
          priority: 2
        },
        {
          id: 'logistics',
          component: 'LogisticsWidget',
          title: 'Logistics',
          visible: true,
          position: { x: 0, y: 1 },
          size: { width: 1, height: 1 },
          category: 'right',
          priority: 1
        }
      ]

    case 'Financial Institution':
      return [
        ...baseWidgets,
        {
          id: 'loan-portfolio',
          component: 'LoanPortfolioWidget',
          title: 'Loan Portfolio',
          visible: true,
          position: { x: 0, y: 1 },
          size: { width: 1, height: 2 },
          category: 'left',
          priority: 1
        },
        {
          id: 'risk-assessment',
          component: 'RiskAssessmentWidget',
          title: 'Risk Assessment',
          visible: true,
          position: { x: 0, y: 3 },
          size: { width: 1, height: 2 },
          category: 'left',
          priority: 2
        },
        {
          id: 'client-relationship',
          component: 'ClientRelationshipWidget',
          title: 'Client Relationships',
          visible: true,
          position: { x: 0, y: 1 },
          size: { width: 1, height: 1 },
          category: 'right',
          priority: 1
        }
      ]

    default:
      return baseWidgets
  }
}

export const useWidgetCustomization = (stakeholderType: string) => {
  const { user } = useAuth()
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load saved layout or use defaults
  useEffect(() => {
    const loadLayout = () => {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY}-${user?.id}-${stakeholderType}`)
        if (saved) {
          const layout: LayoutConfig = JSON.parse(saved)
          if (layout.version === LAYOUT_VERSION) {
            setWidgets(layout.widgets)
            setIsLoading(false)
            return
          }
        }
        // Use defaults if no saved layout or version mismatch
        setWidgets(getDefaultWidgets(stakeholderType))
      } catch (error) {
        console.warn('Failed to load dashboard layout:', error)
        setWidgets(getDefaultWidgets(stakeholderType))
      }
      setIsLoading(false)
    }

    if (user?.id) {
      loadLayout()
    }
  }, [user?.id, stakeholderType])

  // Save layout to localStorage
  const saveLayout = useCallback(() => {
    if (!user?.id) return

    try {
      const layout: LayoutConfig = {
        stakeholderType,
        widgets,
        lastModified: new Date().toISOString(),
        version: LAYOUT_VERSION
      }
      localStorage.setItem(`${STORAGE_KEY}-${user.id}-${stakeholderType}`, JSON.stringify(layout))
    } catch (error) {
      console.warn('Failed to save dashboard layout:', error)
    }
  }, [widgets, stakeholderType, user?.id])

  // Auto-save when widgets change (debounced)
  useEffect(() => {
    if (!isLoading && widgets.length > 0) {
      const timeoutId = setTimeout(saveLayout, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [widgets, isLoading, saveLayout])

  // Update widget configuration
  const updateWidget = useCallback((widgetId: string, updates: Partial<WidgetConfig>) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    ))
  }, [])

  // Move widget to new position
  const moveWidget = useCallback((widgetId: string, newPosition: { x: number; y: number }, newCategory?: WidgetConfig['category']) => {
    setWidgets(prev => prev.map(widget => {
      if (widget.id === widgetId) {
        return {
          ...widget,
          position: newPosition,
          category: newCategory || widget.category
        }
      }
      return widget
    }))
  }, [])

  // Toggle widget visibility
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    ))
  }, [])

  // Reset to default layout
  const resetToDefault = useCallback(() => {
    setWidgets(getDefaultWidgets(stakeholderType))
  }, [stakeholderType])

  // Get widgets by category
  const getWidgetsByCategory = useCallback((category: string) => {
    return widgets
      .filter(widget => widget.category === category && widget.visible)
      .sort((a, b) => a.priority - b.priority)
  }, [widgets])

  // Export layout for sharing
  const exportLayout = useCallback(() => {
    const layout: LayoutConfig = {
      stakeholderType,
      widgets,
      lastModified: new Date().toISOString(),
      version: LAYOUT_VERSION
    }
    return JSON.stringify(layout, null, 2)
  }, [widgets, stakeholderType])

  // Import layout from JSON
  const importLayout = useCallback((layoutJson: string) => {
    try {
      const layout: LayoutConfig = JSON.parse(layoutJson)
      if (layout.version === LAYOUT_VERSION && layout.stakeholderType === stakeholderType) {
        setWidgets(layout.widgets)
        return true
      }
      return false
    } catch (error) {
      console.warn('Failed to import layout:', error)
      return false
    }
  }, [stakeholderType])

  return {
    widgets,
    isEditMode,
    setIsEditMode,
    isLoading,
    updateWidget,
    moveWidget,
    toggleWidgetVisibility,
    resetToDefault,
    getWidgetsByCategory,
    exportLayout,
    importLayout,
    saveLayout
  }
}