/**
 * Gamification Hook - Provides gamification functionality for React components
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-utils';
import { GamificationService, Achievement, UserProgress, GamificationEvent } from '@/services/dashboard/GamificationService';

export interface UseGamificationReturn {
  userProgress: UserProgress | null;
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  recentAchievements: Achievement[];
  trackAction: (actionType: string, metadata?: any) => Promise<void>;
  getLeaderboard: (limit?: number) => Promise<UserProgress[]>;
  celebrationData: {
    show: boolean;
    achievement: Achievement | null;
    message: string;
    animation: string;
    duration: number;
  };
  dismissCelebration: () => void;
}

export const useGamification = (): UseGamificationReturn => {
  const { user } = useAuth();
  const gamificationService = GamificationService.getInstance();

  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [celebrationData, setCelebrationData] = useState({
    show: false,
    achievement: null as Achievement | null,
    message: '',
    animation: '',
    duration: 0
  });

  // Load user data
  useEffect(() => {
    if (user?.id) {
      const progress = gamificationService.getUserProgress(user.id);
      setUserProgress(progress);

      // Get achievements for user's stakeholder type (assuming it's stored in user profile)
      // For now, default to Farmer - this should be dynamic based on user profile
      const userAchievements = gamificationService.getAchievements('Farmer');
      setAchievements(userAchievements);
    }
  }, [user]);

  // Listen for gamification events
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = gamificationService.onGamificationEvent((event: GamificationEvent) => {
      if (event.userId === user.id && event.type === 'achievement_unlocked') {
        const achievement = event.data.achievement;
        const celebration = gamificationService.getCelebrationData(achievement);

        setCelebrationData({
          show: true,
          achievement,
          message: celebration.message,
          animation: celebration.animation,
          duration: celebration.duration
        });

        // Update user progress
        const updatedProgress = gamificationService.getUserProgress(user.id);
        setUserProgress(updatedProgress);

        // Auto-dismiss celebration after duration
        setTimeout(() => {
          setCelebrationData(prev => ({ ...prev, show: false }));
        }, celebration.duration);
      }
    });

    return unsubscribe;
  }, [user?.id]);

  // Track user action
  const trackAction = useCallback(async (actionType: string, metadata?: any) => {
    if (!user?.id) return;

    // Assume stakeholder type - in real app, get from user profile
    const stakeholderType = 'Farmer'; // This should be dynamic

    await gamificationService.trackAction(user.id, actionType, stakeholderType, metadata);

    // Update local state
    const updatedProgress = gamificationService.getUserProgress(user.id);
    setUserProgress(updatedProgress);
  }, [user?.id]);

  // Get leaderboard
  const getLeaderboard = useCallback(async (limit: number = 10) => {
    // Assume stakeholder type
    const stakeholderType = 'Farmer';
    return await gamificationService.getLeaderboard(stakeholderType, limit);
  }, []);

  // Dismiss celebration manually
  const dismissCelebration = useCallback(() => {
    setCelebrationData(prev => ({ ...prev, show: false }));
  }, []);

  // Computed values
  const unlockedAchievements = userProgress?.achievements || [];
  const recentAchievements = unlockedAchievements
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 5);

  return {
    userProgress,
    achievements,
    unlockedAchievements,
    recentAchievements,
    trackAction,
    getLeaderboard,
    celebrationData,
    dismissCelebration
  };
};

// Hook for achievement progress bars
export const useAchievementProgress = (achievementId: string) => {
  const { achievements } = useGamification();
  const achievement = achievements.find(a => a.id === achievementId);

  return {
    achievement,
    progress: achievement?.progress || 0,
    isCompleted: achievement?.progress === 100,
    isUnlocked: !!achievement?.unlockedAt
  };
};

// Hook for level progression
export const useLevelProgress = () => {
  const { userProgress } = useGamification();

  if (!userProgress) {
    return {
      currentLevel: 1,
      currentPoints: 0,
      pointsToNextLevel: 100,
      progressPercentage: 0
    };
  }

  const pointsInCurrentLevel = userProgress.totalPoints % 100;
  const pointsToNextLevel = 100 - pointsInCurrentLevel;
  const progressPercentage = (pointsInCurrentLevel / 100) * 100;

  return {
    currentLevel: userProgress.level,
    currentPoints: userProgress.totalPoints,
    pointsToNextLevel,
    progressPercentage
  };
};