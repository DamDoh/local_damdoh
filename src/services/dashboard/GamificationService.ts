/**
 * Gamification Service - Manages achievements, progress tracking, and rewards
 * Provides gamified experiences across the DamDoh platform
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'engagement' | 'productivity' | 'community' | 'learning' | 'sustainability';
  stakeholderType: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: {
    type: 'action' | 'milestone' | 'streak' | 'social';
    target: number;
    current: number;
  };
  rewards: {
    badge?: string;
    title?: string;
    feature?: string;
  };
  unlockedAt?: Date;
  progress: number; // 0-100
}

export interface UserProgress {
  userId: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  weeklyProgress: {
    week: string;
    points: number;
    actions: number;
  }[];
  leaderboardPosition?: number;
}

export interface GamificationEvent {
  type: 'achievement_unlocked' | 'level_up' | 'streak_milestone' | 'daily_goal' | 'social_engagement';
  userId: string;
  data: any;
  timestamp: Date;
}

export class GamificationService {
  private static instance: GamificationService;
  private achievements: Map<string, Achievement[]> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private eventListeners: ((event: GamificationEvent) => void)[] = [];

  private constructor() {
    this.initializeAchievements();
  }

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  private initializeAchievements(): void {
    // Farmer Achievements
    this.achievements.set('Farmer', [
      {
        id: 'first_crop_logged',
        title: 'First Harvest',
        description: 'Log your first crop in the system',
        icon: '🌱',
        category: 'productivity',
        stakeholderType: 'Farmer',
        rarity: 'common',
        points: 10,
        requirements: { type: 'action', target: 1, current: 0 },
        rewards: { badge: 'Seedling' },
        progress: 0
      },
      {
        id: 'yield_master',
        title: 'Yield Master',
        description: 'Achieve above-average yields for 5 consecutive seasons',
        icon: '🏆',
        category: 'productivity',
        stakeholderType: 'Farmer',
        rarity: 'epic',
        points: 500,
        requirements: { type: 'streak', target: 5, current: 0 },
        rewards: { title: 'Yield Champion', feature: 'Advanced Analytics' },
        progress: 0
      },
      {
        id: 'community_helper',
        title: 'Community Helper',
        description: 'Help 10 fellow farmers with advice or resources',
        icon: '🤝',
        category: 'community',
        stakeholderType: 'Farmer',
        rarity: 'rare',
        points: 200,
        requirements: { type: 'social', target: 10, current: 0 },
        rewards: { badge: 'Community Champion' },
        progress: 0
      },
      {
        id: 'sustainability_pioneer',
        title: 'Sustainability Pioneer',
        description: 'Implement 3 sustainable farming practices',
        icon: '🌍',
        category: 'sustainability',
        stakeholderType: 'Farmer',
        rarity: 'uncommon',
        points: 100,
        requirements: { type: 'milestone', target: 3, current: 0 },
        rewards: { badge: 'Green Farmer' },
        progress: 0
      }
    ]);

    // Buyer Achievements
    this.achievements.set('Buyer', [
      {
        id: 'first_purchase',
        title: 'First Deal',
        description: 'Complete your first purchase on the platform',
        icon: '💰',
        category: 'productivity',
        stakeholderType: 'Buyer',
        rarity: 'common',
        points: 15,
        requirements: { type: 'action', target: 1, current: 0 },
        rewards: { badge: 'Deal Maker' },
        progress: 0
      },
      {
        id: 'bulk_buyer',
        title: 'Bulk Buyer',
        description: 'Purchase over 100 tons of produce in a month',
        icon: '📦',
        category: 'productivity',
        stakeholderType: 'Buyer',
        rarity: 'rare',
        points: 300,
        requirements: { type: 'milestone', target: 100, current: 0 },
        rewards: { title: 'Volume Champion', feature: 'Priority Support' },
        progress: 0
      }
    ]);

    // AgriTech Innovator Achievements
    this.achievements.set('AgriTech Innovator', [
      {
        id: 'first_solution',
        title: 'Innovation Starter',
        description: 'Deploy your first agricultural solution',
        icon: '🚀',
        category: 'productivity',
        stakeholderType: 'AgriTech Innovator',
        rarity: 'common',
        points: 20,
        requirements: { type: 'action', target: 1, current: 0 },
        rewards: { badge: 'Innovator' },
        progress: 0
      },
      {
        id: 'solution_adopted',
        title: 'Widely Adopted',
        description: 'Have your solution adopted by 50+ farmers',
        icon: '🌟',
        category: 'community',
        stakeholderType: 'AgriTech Innovator',
        rarity: 'epic',
        points: 1000,
        requirements: { type: 'social', target: 50, current: 0 },
        rewards: { title: 'Impact Maker', feature: 'Featured Showcase' },
        progress: 0
      }
    ]);

    // Add achievements for other stakeholder types...
    // (Similar structure for Financial Institution, Agronomist, Cooperative)
  }

  // Get achievements for a stakeholder type
  getAchievements(stakeholderType: string): Achievement[] {
    return this.achievements.get(stakeholderType) || [];
  }

  // Get user progress
  getUserProgress(userId: string): UserProgress {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        userId,
        level: 1,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
        weeklyProgress: []
      });
    }
    return this.userProgress.get(userId)!;
  }

  // Track user action and update progress
  async trackAction(userId: string, actionType: string, stakeholderType: string, metadata?: any): Promise<void> {
    const progress = this.getUserProgress(userId);
    const achievements = this.getAchievements(stakeholderType);

    // Update achievement progress based on action type
    achievements.forEach(achievement => {
      if (this.shouldUpdateAchievement(achievement, actionType, metadata)) {
        achievement.requirements.current += 1;
        achievement.progress = Math.min(
          (achievement.requirements.current / achievement.requirements.target) * 100,
          100
        );

        // Check if achievement is unlocked
        if (achievement.progress >= 100 && !achievement.unlockedAt) {
          achievement.unlockedAt = new Date();
          progress.achievements.push(achievement);
          progress.totalPoints += achievement.points;

          // Emit achievement unlocked event
          this.emitEvent({
            type: 'achievement_unlocked',
            userId,
            data: { achievement },
            timestamp: new Date()
          });
        }
      }
    });

    // Update level based on total points
    const newLevel = Math.floor(progress.totalPoints / 100) + 1;
    if (newLevel > progress.level) {
      progress.level = newLevel;
      this.emitEvent({
        type: 'level_up',
        userId,
        data: { newLevel, points: progress.totalPoints },
        timestamp: new Date()
      });
    }

    // Update streaks and weekly progress
    this.updateStreaks(progress);
    this.updateWeeklyProgress(progress);
  }

  private shouldUpdateAchievement(achievement: Achievement, actionType: string, metadata?: any): boolean {
    // Logic to determine if this action should update this achievement
    switch (achievement.id) {
      case 'first_crop_logged':
        return actionType === 'crop_logged';
      case 'yield_master':
        return actionType === 'high_yield_season';
      case 'community_helper':
        return actionType === 'helped_farmer';
      case 'sustainability_pioneer':
        return actionType === 'sustainable_practice';
      case 'first_purchase':
        return actionType === 'purchase_completed';
      case 'bulk_buyer':
        return actionType === 'bulk_purchase' && metadata?.quantity >= 100;
      case 'first_solution':
        return actionType === 'solution_deployed';
      case 'solution_adopted':
        return actionType === 'farmer_adopted_solution';
      default:
        return false;
    }
  }

  private updateStreaks(progress: UserProgress): void {
    // Simple streak logic - reset if no activity for 24 hours
    const now = new Date();
    const lastActivity = progress.weeklyProgress[progress.weeklyProgress.length - 1]?.week;

    if (lastActivity) {
      const daysSinceLastActivity = Math.floor(
        (now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastActivity <= 1) {
        progress.currentStreak += 1;
        progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
      } else {
        progress.currentStreak = 1;
      }
    } else {
      progress.currentStreak = 1;
      progress.longestStreak = Math.max(progress.longestStreak, 1);
    }
  }

  private updateWeeklyProgress(progress: UserProgress): void {
    const now = new Date();
    const weekKey = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;

    const existingWeek = progress.weeklyProgress.find(w => w.week === weekKey);
    if (existingWeek) {
      existingWeek.points += 10; // Assume 10 points per action
      existingWeek.actions += 1;
    } else {
      progress.weeklyProgress.push({
        week: weekKey,
        points: 10,
        actions: 1
      });
    }

    // Keep only last 12 weeks
    if (progress.weeklyProgress.length > 12) {
      progress.weeklyProgress.shift();
    }
  }

  // Event system for real-time updates
  onGamificationEvent(callback: (event: GamificationEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  private emitEvent(event: GamificationEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }

  // Get leaderboard (simplified - in real app, this would be from backend)
  async getLeaderboard(stakeholderType: string, limit: number = 10): Promise<UserProgress[]> {
    // Mock leaderboard data
    return Array.from(this.userProgress.values())
      .filter(p => p.achievements.some(a => a.stakeholderType === stakeholderType))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map((p, index) => ({ ...p, leaderboardPosition: index + 1 }));
  }

  // Get celebration data for UI
  getCelebrationData(achievement: Achievement): {
    message: string;
    animation: string;
    sound?: string;
    duration: number;
  } {
    const rarityConfig = {
      common: { message: 'Achievement Unlocked!', animation: 'confetti', duration: 3000 },
      uncommon: { message: 'Great Achievement!', animation: 'sparkles', duration: 4000 },
      rare: { message: 'Rare Achievement!', animation: 'fireworks', duration: 5000 },
      epic: { message: 'Epic Achievement!', animation: 'trophy', duration: 6000 },
      legendary: { message: 'Legendary Achievement!', animation: 'champions', duration: 8000 }
    };

    return {
      message: `${rarityConfig[achievement.rarity].message} ${achievement.title}`,
      animation: rarityConfig[achievement.rarity].animation,
      duration: rarityConfig[achievement.rarity].duration
    };
  }
}