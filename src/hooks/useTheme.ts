/**
 * Theme Hook - Provides dynamic theming functionality for React components
 */

import { useState, useEffect, useCallback } from 'react';
import { getStakeholderTheme, applyTheme, getCurrentSeason, STAKEHOLDER_THEMES, SEASONAL_THEMES, StakeholderTheme } from '@/lib/theme-config';

export interface UseThemeReturn {
  theme: StakeholderTheme;
  applyStakeholderTheme: (stakeholderType: string, includeSeasonal?: boolean) => void;
  toggleSeasonalTheme: () => void;
  seasonalEnabled: boolean;
  currentSeason: string;
  availableThemes: string[];
  availableSeasons: string[];
}

export const useTheme = (initialStakeholderType?: string): UseThemeReturn => {
  const [currentStakeholder, setCurrentStakeholder] = useState<string>(initialStakeholderType || 'Farmer');
  const [seasonalEnabled, setSeasonalEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<StakeholderTheme>(() =>
    getStakeholderTheme(currentStakeholder, seasonalEnabled)
  );

  // Apply theme to document and update state
  const applyStakeholderTheme = useCallback((stakeholderType: string, includeSeasonal: boolean = true) => {
    setCurrentStakeholder(stakeholderType);
    setSeasonalEnabled(includeSeasonal);

    const newTheme = getStakeholderTheme(stakeholderType, includeSeasonal);
    setTheme(newTheme);
    applyTheme(stakeholderType, includeSeasonal);
  }, []);

  // Toggle seasonal theme on/off
  const toggleSeasonalTheme = useCallback(() => {
    const newSeasonalEnabled = !seasonalEnabled;
    setSeasonalEnabled(newSeasonalEnabled);

    const newTheme = getStakeholderTheme(currentStakeholder, newSeasonalEnabled);
    setTheme(newTheme);
    applyTheme(currentStakeholder, newSeasonalEnabled);
  }, [currentStakeholder, seasonalEnabled]);

  // Apply initial theme on mount
  useEffect(() => {
    if (initialStakeholderType) {
      applyStakeholderTheme(initialStakeholderType, seasonalEnabled);
    }
  }, [initialStakeholderType, seasonalEnabled, applyStakeholderTheme]);

  // Update theme when seasonal preference changes
  useEffect(() => {
    const newTheme = getStakeholderTheme(currentStakeholder, seasonalEnabled);
    setTheme(newTheme);
  }, [currentStakeholder, seasonalEnabled]);

  const availableThemes = Object.keys(STAKEHOLDER_THEMES);
  const availableSeasons = Object.keys(SEASONAL_THEMES);
  const currentSeason = getCurrentSeason();

  return {
    theme,
    applyStakeholderTheme,
    toggleSeasonalTheme,
    seasonalEnabled,
    currentSeason,
    availableThemes,
    availableSeasons
  };
};

// Hook for theme-aware components
export const useThemeColors = () => {
  const { theme } = useTheme();

  return {
    colors: theme.colors,
    gradients: theme.gradients,
    shadows: theme.shadows,
    animations: theme.animations
  };
};

// Hook for applying theme classes
export const useThemeClasses = () => {
  const { theme } = useTheme();

  const getButtonClasses = (variant: 'primary' | 'secondary' | 'accent' = 'primary') => {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] focus:ring-[var(--color-primary)] shadow-[var(--shadow-light)]`;
      case 'secondary':
        return `${baseClasses} bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-background)] focus:ring-[var(--color-primary)]`;
      case 'accent':
        return `${baseClasses} bg-[var(--gradient-accent)] text-[var(--color-text)] hover:opacity-90 focus:ring-[var(--color-accent)]`;
      default:
        return baseClasses;
    }
  };

  const getCardClasses = (variant: 'default' | 'elevated' | 'bordered' = 'default') => {
    const baseClasses = 'rounded-xl transition-all duration-300';

    switch (variant) {
      case 'default':
        return `${baseClasses} bg-[var(--color-surface)] border border-[var(--color-border)]`;
      case 'elevated':
        return `${baseClasses} bg-[var(--color-surface)] shadow-[var(--shadow-medium)] border border-[var(--color-border)]`;
      case 'bordered':
        return `${baseClasses} bg-[var(--color-background)] border-2 border-[var(--color-primary)]`;
      default:
        return baseClasses;
    }
  };

  const getTextClasses = (variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
    switch (variant) {
      case 'primary':
        return 'text-[var(--color-text)]';
      case 'secondary':
        return 'text-[var(--color-textSecondary)]';
      case 'muted':
        return 'text-gray-500';
      default:
        return 'text-[var(--color-text)]';
    }
  };

  return {
    getButtonClasses,
    getCardClasses,
    getTextClasses,
    theme
  };
};