/**
 * Dynamic Theme Configuration System
 * Provides stakeholder-specific theming with seasonal and cultural adaptations
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface StakeholderTheme {
  colors: ThemeColors;
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  shadows: {
    light: string;
    medium: string;
    heavy: string;
  };
  animations: {
    duration: string;
    easing: string;
  };
}

export interface SeasonalTheme {
  name: string;
  colors: Partial<ThemeColors>;
  icons: string[];
  backgroundPattern?: string;
}

// Stakeholder-specific themes
export const STAKEHOLDER_THEMES: Record<string, StakeholderTheme> = {
  Farmer: {
    colors: {
      primary: '#22c55e', // Green
      secondary: '#16a34a',
      accent: '#84cc16',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#14532d',
      textSecondary: '#374151',
      border: '#d1fae5',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      secondary: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
      accent: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
    },
    shadows: {
      light: '0 1px 3px rgba(34, 197, 94, 0.1)',
      medium: '0 4px 6px rgba(34, 197, 94, 0.15)',
      heavy: '0 10px 15px rgba(34, 197, 94, 0.2)'
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  Buyer: {
    colors: {
      primary: '#3b82f6', // Blue
      secondary: '#2563eb',
      accent: '#60a5fa',
      background: '#eff6ff',
      surface: '#ffffff',
      text: '#1e40af',
      textSecondary: '#374151',
      border: '#dbeafe',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      secondary: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      accent: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
    },
    shadows: {
      light: '0 1px 3px rgba(59, 130, 246, 0.1)',
      medium: '0 4px 6px rgba(59, 130, 246, 0.15)',
      heavy: '0 10px 15px rgba(59, 130, 246, 0.2)'
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  'AgriTech Innovator': {
    colors: {
      primary: '#8b5cf6', // Purple
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#581c87',
      textSecondary: '#374151',
      border: '#e9d5ff',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      secondary: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
      accent: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
    },
    shadows: {
      light: '0 1px 3px rgba(139, 92, 246, 0.1)',
      medium: '0 4px 6px rgba(139, 92, 246, 0.15)',
      heavy: '0 10px 15px rgba(139, 92, 246, 0.2)'
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  'Financial Institution': {
    colors: {
      primary: '#f59e0b', // Amber
      secondary: '#d97706',
      accent: '#fbbf24',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#92400e',
      textSecondary: '#374151',
      border: '#fef3c7',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      secondary: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      accent: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
    },
    shadows: {
      light: '0 1px 3px rgba(245, 158, 11, 0.1)',
      medium: '0 4px 6px rgba(245, 158, 11, 0.15)',
      heavy: '0 10px 15px rgba(245, 158, 11, 0.2)'
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  Agronomist: {
    colors: {
      primary: '#10b981', // Emerald
      secondary: '#059669',
      accent: '#34d399',
      background: '#ecfdf5',
      surface: '#ffffff',
      text: '#064e3b',
      textSecondary: '#374151',
      border: '#d1fae5',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      secondary: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      accent: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
    },
    shadows: {
      light: '0 1px 3px rgba(16, 185, 129, 0.1)',
      medium: '0 4px 6px rgba(16, 185, 129, 0.15)',
      heavy: '0 10px 15px rgba(16, 185, 129, 0.2)'
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  Cooperative: {
    colors: {
      primary: '#f97316', // Orange
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#9a3412',
      textSecondary: '#374151',
      border: '#fed7aa',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      secondary: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
      accent: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)'
    },
    shadows: {
      light: '0 1px 3px rgba(249, 115, 22, 0.1)',
      medium: '0 4px 6px rgba(249, 115, 22, 0.15)',
      heavy: '0 10px 15px rgba(249, 115, 22, 0.2)'
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

// Seasonal themes
export const SEASONAL_THEMES: Record<string, SeasonalTheme> = {
  spring: {
    name: 'Spring Growth',
    colors: {
      primary: '#22c55e',
      accent: '#84cc16',
      background: '#f0fdf4'
    },
    icons: ['🌱', '🌸', '🌷', '🌺']
  },
  summer: {
    name: 'Summer Harvest',
    colors: {
      primary: '#f59e0b',
      accent: '#fbbf24',
      background: '#fffbeb'
    },
    icons: ['☀️', '🌽', '🍅', '🥕']
  },
  autumn: {
    name: 'Autumn Abundance',
    colors: {
      primary: '#f97316',
      accent: '#fb923c',
      background: '#fff7ed'
    },
    icons: ['🍂', '🎃', '🍎', '🥔']
  },
  winter: {
    name: 'Winter Planning',
    colors: {
      primary: '#3b82f6',
      accent: '#60a5fa',
      background: '#eff6ff'
    },
    icons: ['❄️', '🌾', '📅', '🧾']
  }
};

// Get current season based on date
export const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1; // getMonth() returns 0-11
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

// Get theme for stakeholder with seasonal adaptation
export const getStakeholderTheme = (stakeholderType: string, includeSeasonal: boolean = true): StakeholderTheme => {
  const baseTheme = STAKEHOLDER_THEMES[stakeholderType] || STAKEHOLDER_THEMES.Farmer;

  if (!includeSeasonal) return baseTheme;

  const season = getCurrentSeason();
  const seasonalTheme = SEASONAL_THEMES[season];

  // Merge seasonal colors with base theme
  const mergedColors: ThemeColors = {
    ...baseTheme.colors,
    ...seasonalTheme.colors
  };

  return {
    ...baseTheme,
    colors: mergedColors
  };
};

// Generate CSS custom properties for theme
export const generateThemeCSS = (theme: StakeholderTheme): string => {
  const cssVars: string[] = [];

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssVars.push(`--color-${key}: ${value};`);
  });

  // Gradients
  Object.entries(theme.gradients).forEach(([key, value]) => {
    cssVars.push(`--gradient-${key}: ${value};`);
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    cssVars.push(`--shadow-${key}: ${value};`);
  });

  // Animations
  cssVars.push(`--animation-duration: ${theme.animations.duration};`);
  cssVars.push(`--animation-easing: ${theme.animations.easing};`);

  return `:root {\n  ${cssVars.join('\n  ')}\n}`;
};

// Apply theme to document
export const applyTheme = (stakeholderType: string, includeSeasonal: boolean = true): void => {
  const theme = getStakeholderTheme(stakeholderType, includeSeasonal);
  const css = generateThemeCSS(theme);

  // Remove existing theme
  const existingStyle = document.getElementById('dynamic-theme');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Add new theme
  const style = document.createElement('style');
  style.id = 'dynamic-theme';
  style.textContent = css;
  document.head.appendChild(style);
};