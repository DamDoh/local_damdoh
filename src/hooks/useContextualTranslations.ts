"use client";

import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth-utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMemo } from 'react';

export type UserContext = 'farmer' | 'buyer' | 'admin' | 'agronomist' | 'general';

export interface ContextualTranslationOptions {
  context?: UserContext;
  formality?: 'formal' | 'informal';
  region?: string;
  expertise?: 'beginner' | 'intermediate' | 'expert';
}

export interface ContextualTranslations {
  // Navigation & UI
  dashboard: {
    title: string;
    welcome: string;
    subtitle: string;
  };

  // Actions & Buttons
  actions: {
    create: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    submit: string;
    approve: string;
    reject: string;
    review: string;
  };

  // Agricultural Terms
  agriculture: {
    crops: string;
    livestock: string;
    equipment: string;
    inputs: string;
    harvest: string;
    planting: string;
    irrigation: string;
    fertilization: string;
  };

  // Business Terms
  business: {
    revenue: string;
    profit: string;
    cost: string;
    price: string;
    margin: string;
    yield: string;
    efficiency: string;
  };

  // Status Messages
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
    loading: string;
  };

  // Help & Support
  help: {
    tooltip: string;
    guide: string;
    tutorial: string;
    support: string;
    documentation: string;
  };
}

/**
 * Hook for context-aware translations
 * Provides translations tailored to user role, expertise level, and regional context
 */
export function useContextualTranslations(options: ContextualTranslationOptions = {}) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const baseTranslations = useTranslations();

  // Determine user context
  const userContext = useMemo((): UserContext => {
    if (options.context) return options.context;

    if (profile?.primaryRole) {
      switch (profile.primaryRole.toLowerCase()) {
        case 'farmer':
        case 'smallholder':
        case 'large-scale farmer':
          return 'farmer';
        case 'buyer':
        case 'retailer':
        case 'wholesaler':
        case 'exporter':
          return 'buyer';
        case 'admin':
        case 'administrator':
        case 'manager':
          return 'admin';
        case 'agronomist':
        case 'extension officer':
        case 'consultant':
          return 'agronomist';
        default:
          return 'general';
      }
    }

    return 'general';
  }, [profile?.primaryRole, options.context]);

  // Determine expertise level
  const expertiseLevel = useMemo((): 'beginner' | 'intermediate' | 'expert' => {
    if (options.expertise) return options.expertise;

    // Logic to determine expertise based on user activity, certifications, etc.
    // This would typically come from user analytics/profile data
    return 'intermediate'; // Default for now
  }, [options.expertise]);

  // Get contextual translations
  const contextualTranslations = useMemo((): ContextualTranslations => {
    const context = userContext;
    const expertise = expertiseLevel;

    return {
      dashboard: {
        title: getContextualTranslation('dashboard.title', context, expertise),
        welcome: getContextualTranslation('dashboard.welcome', context, expertise),
        subtitle: getContextualTranslation('dashboard.subtitle', context, expertise)
      },
      actions: {
        create: getContextualTranslation('actions.create', context, expertise),
        edit: getContextualTranslation('actions.edit', context, expertise),
        delete: getContextualTranslation('actions.delete', context, expertise),
        save: getContextualTranslation('actions.save', context, expertise),
        cancel: getContextualTranslation('actions.cancel', context, expertise),
        submit: getContextualTranslation('actions.submit', context, expertise),
        approve: getContextualTranslation('actions.approve', context, expertise),
        reject: getContextualTranslation('actions.reject', context, expertise),
        review: getContextualTranslation('actions.review', context, expertise)
      },
      agriculture: {
        crops: getContextualTranslation('agriculture.crops', context, expertise),
        livestock: getContextualTranslation('agriculture.livestock', context, expertise),
        equipment: getContextualTranslation('agriculture.equipment', context, expertise),
        inputs: getContextualTranslation('agriculture.inputs', context, expertise),
        harvest: getContextualTranslation('agriculture.harvest', context, expertise),
        planting: getContextualTranslation('agriculture.planting', context, expertise),
        irrigation: getContextualTranslation('agriculture.irrigation', context, expertise),
        fertilization: getContextualTranslation('agriculture.fertilization', context, expertise)
      },
      business: {
        revenue: getContextualTranslation('business.revenue', context, expertise),
        profit: getContextualTranslation('business.profit', context, expertise),
        cost: getContextualTranslation('business.cost', context, expertise),
        price: getContextualTranslation('business.price', context, expertise),
        margin: getContextualTranslation('business.margin', context, expertise),
        yield: getContextualTranslation('business.yield', context, expertise),
        efficiency: getContextualTranslation('business.efficiency', context, expertise)
      },
      status: {
        success: getContextualTranslation('status.success', context, expertise),
        error: getContextualTranslation('status.error', context, expertise),
        warning: getContextualTranslation('status.warning', context, expertise),
        info: getContextualTranslation('status.info', context, expertise),
        loading: getContextualTranslation('status.loading', context, expertise)
      },
      help: {
        tooltip: getContextualTranslation('help.tooltip', context, expertise),
        guide: getContextualTranslation('help.guide', context, expertise),
        tutorial: getContextualTranslation('help.tutorial', context, expertise),
        support: getContextualTranslation('help.support', context, expertise),
        documentation: getContextualTranslation('help.documentation', context, expertise)
      }
    };
  }, [userContext, expertiseLevel]);

  return {
    ...contextualTranslations,
    userContext,
    expertiseLevel,
    // Helper functions
    getContextualTranslation: (key: string, contextOverride?: UserContext) =>
      getContextualTranslation(key, contextOverride || userContext, expertiseLevel),
    // Raw translation function with context awareness
    t: (key: string, options?: any) => {
      try {
        return baseTranslations(key, options);
      } catch {
        // Fallback to context-aware translation
        return getContextualTranslation(key, userContext, expertiseLevel);
      }
    }
  };
}

/**
 * Get contextual translation based on user context and expertise
 */
function getContextualTranslation(
  key: string,
  context: UserContext,
  expertise: 'beginner' | 'intermediate' | 'expert'
): string {
  // This would typically load from context-specific translation files
  // For now, we'll use a simple mapping with fallbacks

  const contextualMappings: Record<string, Record<UserContext, Record<string, string>>> = {
    'dashboard.title': {
      farmer: {
        beginner: 'My Farm Dashboard',
        intermediate: 'Farm Management Center',
        expert: 'Agricultural Command Center'
      },
      buyer: {
        beginner: 'My Purchase Dashboard',
        intermediate: 'Procurement Center',
        expert: 'Supply Chain Hub'
      },
      admin: {
        beginner: 'Admin Panel',
        intermediate: 'Management Console',
        expert: 'System Administration'
      },
      agronomist: {
        beginner: 'Advisory Dashboard',
        intermediate: 'Agricultural Consulting',
        expert: 'Agro-Technical Center'
      },
      general: {
        beginner: 'Dashboard',
        intermediate: 'Control Panel',
        expert: 'Command Center'
      }
    },
    'actions.create': {
      farmer: {
        beginner: 'Add New Item',
        intermediate: 'Create Record',
        expert: 'Add Entry'
      },
      buyer: {
        beginner: 'Start New Order',
        intermediate: 'Create Purchase',
        expert: 'Initiate Procurement'
      },
      admin: {
        beginner: 'Add New',
        intermediate: 'Create',
        expert: 'Add'
      },
      agronomist: {
        beginner: 'Create Recommendation',
        intermediate: 'Add Advisory',
        expert: 'Generate Report'
      },
      general: {
        beginner: 'Create',
        intermediate: 'Add',
        expert: 'New'
      }
    },
    'agriculture.crops': {
      farmer: {
        beginner: 'My Plants',
        intermediate: 'Crop Varieties',
        expert: 'Cultivar Portfolio'
      },
      buyer: {
        beginner: 'Available Crops',
        intermediate: 'Product Categories',
        expert: 'Commodity Range'
      },
      admin: {
        beginner: 'Crop Types',
        intermediate: 'Agricultural Products',
        expert: 'Crop Taxonomy'
      },
      agronomist: {
        beginner: 'Crop Species',
        intermediate: 'Cultivar Selection',
        expert: 'Genetic Resources'
      },
      general: {
        beginner: 'Crops',
        intermediate: 'Plants',
        expert: 'Cultivars'
      }
    }
  };

  // Try to get contextual translation
  const contextMapping = contextualMappings[key];
  if (contextMapping && contextMapping[context] && contextMapping[context][expertise]) {
    return contextMapping[context][expertise];
  }

  // Fallback to context with intermediate expertise
  if (contextMapping && contextMapping[context] && contextMapping[context].intermediate) {
    return contextMapping[context].intermediate;
  }

  // Final fallback to general context
  if (contextMapping && contextMapping.general && contextMapping.general[expertise]) {
    return contextMapping.general[expertise];
  }

  // Ultimate fallback - return a generic version
  return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').toLowerCase() || key;
}

/**
 * Hook for role-specific translations
 */
export function useRoleTranslations() {
  const { userContext } = useContextualTranslations();

  const roleSpecificTranslations = useMemo(() => {
    switch (userContext) {
      case 'farmer':
        return {
          primaryAction: 'Manage Farm',
          secondaryAction: 'View Market',
          mainEntity: 'Farm',
          keyMetrics: ['Yield', 'Revenue', 'Efficiency'],
          quickActions: ['Add Crop', 'Schedule Task', 'Check Weather']
        };
      case 'buyer':
        return {
          primaryAction: 'Browse Products',
          secondaryAction: 'View Orders',
          mainEntity: 'Procurement',
          keyMetrics: ['Orders', 'Savings', 'Quality Score'],
          quickActions: ['Place Order', 'Compare Prices', 'Contact Sellers']
        };
      case 'admin':
        return {
          primaryAction: 'System Overview',
          secondaryAction: 'User Management',
          mainEntity: 'Platform',
          keyMetrics: ['Users', 'Transactions', 'Uptime'],
          quickActions: ['Add User', 'View Reports', 'System Settings']
        };
      case 'agronomist':
        return {
          primaryAction: 'Provide Advice',
          secondaryAction: 'Field Visits',
          mainEntity: 'Consulting',
          keyMetrics: ['Clients', 'Recommendations', 'Success Rate'],
          quickActions: ['New Consultation', 'Field Assessment', 'Research Update']
        };
      default:
        return {
          primaryAction: 'Get Started',
          secondaryAction: 'Explore',
          mainEntity: 'Account',
          keyMetrics: ['Activity', 'Connections', 'Achievements'],
          quickActions: ['Browse', 'Connect', 'Learn']
        };
    }
  }, [userContext]);

  return roleSpecificTranslations;
}

/**
 * Hook for expertise-level content adaptation
 */
export function useExpertiseAdaptation() {
  const { expertiseLevel } = useContextualTranslations();

  const adaptationHelpers = useMemo(() => {
    const getComplexityLevel = () => {
      switch (expertiseLevel) {
        case 'beginner':
          return {
            showSimplifiedUI: true,
            showAdvancedFeatures: false,
            useSimpleLanguage: true,
            showTooltips: true,
            showTutorials: true
          };
        case 'intermediate':
          return {
            showSimplifiedUI: false,
            showAdvancedFeatures: true,
            useSimpleLanguage: false,
            showTooltips: true,
            showTutorials: false
          };
        case 'expert':
          return {
            showSimplifiedUI: false,
            showAdvancedFeatures: true,
            useSimpleLanguage: false,
            showTooltips: false,
            showTutorials: false
          };
      }
    };

    const adaptContent = (content: string, type: 'explanation' | 'instruction' | 'warning') => {
      switch (expertiseLevel) {
        case 'beginner':
          return type === 'explanation' ? `Simply put: ${content}` :
                 type === 'instruction' ? `To get started: ${content}` :
                 `Important note: ${content}`;
        case 'intermediate':
          return content;
        case 'expert':
          return content.length > 100 ? content.substring(0, 100) + '...' : content;
      }
    };

    return {
      complexityLevel: getComplexityLevel(),
      adaptContent,
      isBeginner: expertiseLevel === 'beginner',
      isExpert: expertiseLevel === 'expert',
      showAdvancedOptions: expertiseLevel !== 'beginner'
    };
  }, [expertiseLevel]);

  return adaptationHelpers;
}