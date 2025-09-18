/**
 * Gamification Service - Advanced engagement system with dynamic challenges and social recognition
 * Manages achievements, challenges, scoring, and leaderboards to increase user engagement
 * Single Responsibility: Gamification logic and user engagement tracking
 * Dependencies: Achievement system, user activity tracking, social features
 */

import { apiCall } from '@/lib/api-utils';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'farming' | 'business' | 'community' | 'innovation' | 'sustainability';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface AchievementRequirement {
  type: 'action' | 'metric' | 'streak' | 'milestone';
  target: string;
  value: number;
  currentValue?: number;
}

export interface AchievementReward {
  type: 'badge' | 'points' | 'title' | 'feature' | 'recognition';
  value: string | number;
  description: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'special';
  type: 'action' | 'metric' | 'social' | 'learning';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: number; // in days
  startDate: Date;
  endDate: Date;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  participants: number;
  isActive: boolean;
  progress?: number;
  completedAt?: Date;
}

export interface ChallengeRequirement {
  type: string;
  target: number;
  currentValue?: number;
  description: string;
}

export interface ChallengeReward {
  type: 'points' | 'badge' | 'title' | 'feature' | 'recognition' | 'discount';
  value: string | number;
  description: string;
}

export interface UserGamificationProfile {
  userId: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  leaderboardRank?: number;
  weeklyPoints: number;
  monthlyPoints: number;
  titles: UserTitle[];
  stats: GamificationStats;
}

export interface UserTitle {
  id: string;
  name: string;
  description: string;
  earnedAt: Date;
  isActive: boolean;
}

export interface GamificationStats {
  postsCreated: number;
  connectionsMade: number;
  cropsManaged: number;
  dealsCompleted: number;
  knowledgeShared: number;
  sustainablePractices: number;
  communityHelp: number;
  innovationsImplemented: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar?: string;
  points: number;
  level: number;
  rank: number;
  change: number; // position change from last period
}

export class GamificationService {
  private static instance: GamificationService;
  private readonly CACHE_KEY = 'gamification-data';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  /**
   * Get user's gamification profile
   */
  async getUserProfile(userId: string): Promise<UserGamificationProfile> {
    try {
      const result = await apiCall(`/api/gamification/profile/${userId}`) as { profile: UserGamificationProfile };
      return result.profile;
    } catch (error) {
      console.warn('API unavailable for gamification profile, using defaults');
      return this.getDefaultProfile(userId);
    }
  }

  /**
   * Get available achievements
   */
  async getAchievements(userId?: string): Promise<Achievement[]> {
    try {
      const url = userId ? `/api/gamification/achievements?userId=${userId}` : '/api/gamification/achievements';
      const result = await apiCall(url) as { achievements: Achievement[] };
      return result.achievements;
    } catch (error) {
      console.warn('API unavailable for achievements, using defaults');
      return this.getDefaultAchievements();
    }
  }

  /**
   * Get active challenges
   */
  async getActiveChallenges(userId?: string): Promise<Challenge[]> {
    try {
      const url = userId ? `/api/gamification/challenges/active?userId=${userId}` : '/api/gamification/challenges/active';
      const result = await apiCall(url) as { challenges: Challenge[] };
      return result.challenges;
    } catch (error) {
      console.warn('API unavailable for challenges, using defaults');
      return this.getDefaultChallenges();
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly', limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      const result = await apiCall(`/api/gamification/leaderboard?period=${period}&limit=${limit}`) as { leaderboard: LeaderboardEntry[] };
      return result.leaderboard;
    } catch (error) {
      console.warn('API unavailable for leaderboard, using mock data');
      return this.getMockLeaderboard(limit);
    }
  }

  /**
   * Record user action for gamification tracking
   */
  async recordAction(userId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await apiCall('/api/gamification/actions', {
        method: 'POST',
        body: JSON.stringify({ userId, action, metadata, timestamp: new Date() })
      });
    } catch (error) {
      console.warn('Failed to record action:', error);
      // Store locally for later sync
      this.storeActionLocally(userId, action, metadata);
    }
  }

  /**
   * Check and unlock achievements
   */
  async checkAchievements(userId: string): Promise<Achievement[]> {
    try {
      const result = await apiCall(`/api/gamification/achievements/check/${userId}`, {
        method: 'POST'
      }) as { unlockedAchievements?: Achievement[] };
      return result.unlockedAchievements || [];
    } catch (error) {
      console.warn('Failed to check achievements:', error);
      return [];
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(userId: string, challengeId: string): Promise<boolean> {
    try {
      await apiCall('/api/gamification/challenges/join', {
        method: 'POST',
        body: JSON.stringify({ userId, challengeId })
      });
      return true;
    } catch (error) {
      console.warn('Failed to join challenge:', error);
      return false;
    }
  }

  /**
   * Calculate user level from points
   */
  calculateLevel(points: number): number {
    // Level calculation: level = floor(sqrt(points / 100)) + 1
    return Math.floor(Math.sqrt(points / 100)) + 1;
  }

  /**
   * Calculate points needed for next level
   */
  getPointsForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100;
  }

  /**
   * Get achievement rarity color
   */
  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get difficulty color
   */
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  // Default data methods
  private getDefaultProfile(userId: string): UserGamificationProfile {
    return {
      userId,
      level: 1,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievements: [],
      activeChallenges: [],
      completedChallenges: [],
      weeklyPoints: 0,
      monthlyPoints: 0,
      titles: [],
      stats: {
        postsCreated: 0,
        connectionsMade: 0,
        cropsManaged: 0,
        dealsCompleted: 0,
        knowledgeShared: 0,
        sustainablePractices: 0,
        communityHelp: 0,
        innovationsImplemented: 0
      }
    };
  }

  private getDefaultAchievements(): Achievement[] {
    return [
      {
        id: 'first-post',
        title: 'First Post',
        description: 'Create your first community post',
        icon: '📝',
        category: 'community',
        rarity: 'common',
        points: 10,
        requirements: [{ type: 'action', target: 'post_created', value: 1 }],
        rewards: [{ type: 'badge', value: 'Community Member', description: 'Community Member badge' }],
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'farm-manager',
        title: 'Farm Manager',
        description: 'Manage 5 different crops',
        icon: '🌾',
        category: 'farming',
        rarity: 'rare',
        points: 50,
        requirements: [{ type: 'metric', target: 'crops_managed', value: 5 }],
        rewards: [{ type: 'badge', value: 'Farm Manager', description: 'Farm Manager badge' }],
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'deal-maker',
        title: 'Deal Maker',
        description: 'Complete 10 successful deals',
        icon: '🤝',
        category: 'business',
        rarity: 'epic',
        points: 100,
        requirements: [{ type: 'metric', target: 'deals_completed', value: 10 }],
        rewards: [{ type: 'title', value: 'Deal Maker', description: 'Deal Maker title' }],
        progress: 0,
        maxProgress: 10
      }
    ];
  }

  private getDefaultChallenges(): Challenge[] {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'weekly-posts',
        title: 'Community Contributor',
        description: 'Create 5 posts this week to share your farming knowledge',
        category: 'weekly',
        type: 'action',
        difficulty: 'easy',
        duration: 7,
        startDate: now,
        endDate: weekFromNow,
        requirements: [
          { type: 'posts_created', target: 5, currentValue: 0, description: 'Create 5 community posts' }
        ],
        rewards: [
          { type: 'points', value: 25, description: '25 bonus points' },
          { type: 'badge', value: 'Community Contributor', description: 'Special contributor badge' }
        ],
        participants: 0,
        isActive: true
      },
      {
        id: 'sustainability-drive',
        title: 'Sustainability Champion',
        description: 'Implement 3 sustainable farming practices this month',
        category: 'monthly',
        type: 'action',
        difficulty: 'medium',
        duration: 30,
        startDate: now,
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        requirements: [
          { type: 'sustainable_practices', target: 3, currentValue: 0, description: 'Implement sustainable practices' }
        ],
        rewards: [
          { type: 'points', value: 75, description: '75 bonus points' },
          { type: 'title', value: 'Sustainability Champion', description: 'Earn the champion title' }
        ],
        participants: 0,
        isActive: true
      }
    ];
  }

  private getMockLeaderboard(limit: number): LeaderboardEntry[] {
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      userId: `user-${i + 1}`,
      displayName: `Farmer ${i + 1}`,
      points: Math.max(100 - (i * 10), 10),
      level: Math.max(5 - i, 1),
      rank: i + 1,
      change: Math.floor(Math.random() * 5) - 2 // -2 to +2
    }));
  }

  private storeActionLocally(userId: string, action: string, metadata?: Record<string, any>): void {
    try {
      const actions = JSON.parse(localStorage.getItem('gamification-actions') || '[]');
      actions.push({ userId, action, metadata, timestamp: new Date(), synced: false });
      localStorage.setItem('gamification-actions', JSON.stringify(actions));
    } catch (error) {
      console.warn('Failed to store action locally:', error);
    }
  }
}