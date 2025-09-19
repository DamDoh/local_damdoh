/**
 * Ecosystem-Wide Gamification Service
 * Manages cross-team achievements, global leaderboards, and ecosystem challenges
 */

import { Achievement, UserProgress } from './GamificationService';

export interface EcosystemAchievement extends Achievement {
  ecosystemScope: 'global' | 'regional' | 'community';
  participatingStakeholders: string[];
  collaborationBonus: number;
  unlockConditions: {
    teams: number;
    stakeholders: number;
    actions: number;
  };
}

export interface EcosystemChallenge {
  id: string;
  title: string;
  description: string;
  category: 'sustainability' | 'innovation' | 'collaboration' | 'impact' | 'growth';
  duration: number; // days
  startDate: Date;
  endDate: Date;
  objectives: ChallengeObjective[];
  rewards: ChallengeReward[];
  participants: ChallengeParticipant[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  progress: number;
}

export interface ChallengeObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  stakeholderTypes: string[];
  weight: number; // contribution weight
}

export interface ChallengeReward {
  type: 'badge' | 'points' | 'title' | 'feature' | 'recognition';
  value: string | number;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ChallengeParticipant {
  userId: string;
  teamId?: string;
  stakeholderType: string;
  contributions: number;
  objectivesCompleted: number;
  joinedAt: Date;
}

export interface GlobalLeaderboard {
  id: string;
  name: string;
  category: 'points' | 'achievements' | 'collaboration' | 'impact' | 'sustainability';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    name: string;
    avatar?: string;
    stakeholderType: string;
    teamName?: string;
  };
  score: number;
  change: number; // rank change from previous period
  achievements: number;
  badges: string[];
}

export interface EcosystemStats {
  totalUsers: number;
  totalTeams: number;
  activeChallenges: number;
  completedChallenges: number;
  totalAchievements: number;
  ecosystemPoints: number;
  topCategories: {
    category: string;
    points: number;
    users: number;
  }[];
  regionalBreakdown: {
    region: string;
    users: number;
    points: number;
    topStakeholder: string;
  }[];
}

export interface CollaborationNetwork {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  clusters: NetworkCluster[];
}

export interface NetworkNode {
  id: string;
  type: 'user' | 'team' | 'organization';
  label: string;
  stakeholderType?: string;
  size: number; // based on activity/points
  color: string;
  position: { x: number; y: number };
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: 'collaboration' | 'mentorship' | 'trade' | 'shared_project';
  strength: number;
  lastActivity: Date;
}

export interface NetworkCluster {
  id: string;
  name: string;
  members: string[];
  center: { x: number; y: number };
  theme: string;
}

export class EcosystemGamificationService {
  private static instance: EcosystemGamificationService;
  private ecosystemAchievements: Map<string, EcosystemAchievement> = new Map();
  private activeChallenges: Map<string, EcosystemChallenge> = new Map();
  private globalLeaderboards: Map<string, GlobalLeaderboard> = new Map();
  private collaborationNetwork: CollaborationNetwork;

  private constructor() {
    this.collaborationNetwork = {
      nodes: [],
      edges: [],
      clusters: []
    };
    this.initializeEcosystemAchievements();
    this.initializeGlobalLeaderboards();
  }

  static getInstance(): EcosystemGamificationService {
    if (!EcosystemGamificationService.instance) {
      EcosystemGamificationService.instance = new EcosystemGamificationService();
    }
    return EcosystemGamificationService.instance;
  }

  private initializeEcosystemAchievements(): void {
    const achievements: EcosystemAchievement[] = [
      {
        id: 'ecosystem_pioneer',
        title: 'Ecosystem Pioneer',
        description: 'First to complete a cross-stakeholder collaboration',
        icon: '🌟',
        category: 'community',
        stakeholderType: 'All',
        rarity: 'legendary',
        points: 1000,
        requirements: { type: 'action', target: 1, current: 0 },
        rewards: { badge: 'Ecosystem Pioneer', title: 'Trailblazer' },
        progress: 0,
        ecosystemScope: 'global',
        participatingStakeholders: ['Farmer', 'Buyer', 'AgriTech Innovator'],
        collaborationBonus: 50,
        unlockConditions: {
          teams: 2,
          stakeholders: 3,
          actions: 10
        }
      },
      {
        id: 'sustainability_champion',
        title: 'Sustainability Champion',
        description: 'Lead 5 teams in achieving sustainability milestones',
        icon: '🌍',
        category: 'sustainability',
        stakeholderType: 'All',
        rarity: 'epic',
        points: 750,
        requirements: { type: 'milestone', target: 5, current: 0 },
        rewards: { badge: 'Green Guardian', feature: 'Sustainability Dashboard' },
        progress: 0,
        ecosystemScope: 'global',
        participatingStakeholders: ['Farmer', 'Agronomist', 'Cooperative'],
        collaborationBonus: 30,
        unlockConditions: {
          teams: 3,
          stakeholders: 4,
          actions: 25
        }
      },
      {
        id: 'innovation_ecosystem',
        title: 'Innovation Ecosystem Builder',
        description: 'Connect 10+ stakeholders in an innovation network',
        icon: '🚀',
        category: 'productivity',
        stakeholderType: 'All',
        rarity: 'epic',
        points: 800,
        requirements: { type: 'social', target: 10, current: 0 },
        rewards: { title: 'Innovation Catalyst', feature: 'Advanced Analytics' },
        progress: 0,
        ecosystemScope: 'regional',
        participatingStakeholders: ['AgriTech Innovator', 'Researcher', 'Financial Institution'],
        collaborationBonus: 40,
        unlockConditions: {
          teams: 4,
          stakeholders: 5,
          actions: 50
        }
      },
      {
        id: 'impact_multiplier',
        title: 'Impact Multiplier',
        description: 'Amplify community impact through collaborative projects',
        icon: '📈',
        category: 'engagement',
        stakeholderType: 'All',
        rarity: 'rare',
        points: 500,
        requirements: { type: 'milestone', target: 100, current: 0 },
        rewards: { badge: 'Impact Driver', feature: 'Impact Analytics' },
        progress: 0,
        ecosystemScope: 'community',
        participatingStakeholders: ['All'],
        collaborationBonus: 25,
        unlockConditions: {
          teams: 5,
          stakeholders: 6,
          actions: 100
        }
      }
    ];

    achievements.forEach(achievement => {
      this.ecosystemAchievements.set(achievement.id, achievement);
    });
  }

  private initializeGlobalLeaderboards(): void {
    const categories = ['points', 'achievements', 'collaboration', 'impact', 'sustainability'];
    const timeframes = ['daily', 'weekly', 'monthly', 'all_time'];

    categories.forEach(category => {
      timeframes.forEach(timeframe => {
        const leaderboardId = `${category}_${timeframe}`;
        this.globalLeaderboards.set(leaderboardId, {
          id: leaderboardId,
          name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${timeframe.replace('_', ' ')}`,
          category: category as any,
          timeframe: timeframe as any,
          entries: [],
          lastUpdated: new Date()
        });
      });
    });
  }

  // Challenge management
  async createChallenge(challengeData: Omit<EcosystemChallenge, 'id' | 'participants' | 'progress' | 'status'>): Promise<EcosystemChallenge> {
    const challenge: EcosystemChallenge = {
      ...challengeData,
      id: `challenge_${Date.now()}`,
      participants: [],
      progress: 0,
      status: 'upcoming'
    };

    this.activeChallenges.set(challenge.id, challenge);
    return challenge;
  }

  async joinChallenge(challengeId: string, userId: string, teamId?: string): Promise<void> {
    const challenge = this.activeChallenges.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const participant: ChallengeParticipant = {
      userId,
      teamId,
      stakeholderType: 'Farmer', // Should be dynamic
      contributions: 0,
      objectivesCompleted: 0,
      joinedAt: new Date()
    };

    challenge.participants.push(participant);
  }

  async updateChallengeProgress(challengeId: string, userId: string, objectiveId: string, progress: number): Promise<void> {
    const challenge = this.activeChallenges.get(challengeId);
    if (!challenge) return;

    const participant = challenge.participants.find(p => p.userId === userId);
    if (!participant) return;

    const objective = challenge.objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    objective.current = Math.min(objective.current + progress, objective.target);

    // Update participant progress
    participant.contributions += progress;
    if (objective.current >= objective.target) {
      participant.objectivesCompleted++;
    }

    // Update overall challenge progress
    const totalObjectives = challenge.objectives.length * challenge.participants.length;
    const completedObjectives = challenge.participants.reduce((sum, p) => sum + p.objectivesCompleted, 0);
    challenge.progress = (completedObjectives / totalObjectives) * 100;

    // Check if challenge is completed
    if (challenge.progress >= 100) {
      challenge.status = 'completed';
      await this.distributeChallengeRewards(challenge);
    }
  }

  private async distributeChallengeRewards(challenge: EcosystemChallenge): Promise<void> {
    // Sort participants by contributions
    const sortedParticipants = challenge.participants.sort((a, b) => b.contributions - a.contributions);

    sortedParticipants.forEach((participant, index) => {
      const rank = index + 1;
      const rewardMultiplier = Math.max(0.1, 1 - (rank - 1) * 0.1); // Top contributor gets 100%, decreasing by 10% each rank

      challenge.rewards.forEach(reward => {
        // Apply rewards based on type
        switch (reward.type) {
          case 'points':
            // Add points to user
            console.log(`Awarding ${reward.value} points to user ${participant.userId}`);
            break;
          case 'badge':
            // Award badge
            console.log(`Awarding badge "${reward.value}" to user ${participant.userId}`);
            break;
          case 'title':
            // Award title
            console.log(`Awarding title "${reward.value}" to user ${participant.userId}`);
            break;
        }
      });
    });
  }

  // Leaderboard management
  async updateLeaderboard(category: string, timeframe: string): Promise<void> {
    const leaderboardId = `${category}_${timeframe}`;
    const leaderboard = this.globalLeaderboards.get(leaderboardId);
    if (!leaderboard) return;

    // In a real implementation, this would fetch data from the backend
    // For now, we'll simulate leaderboard data
    const mockEntries: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: 'user_1',
        user: { name: 'Alice Johnson', stakeholderType: 'Farmer', teamName: 'Green Valley Farms' },
        score: 2500,
        change: 2,
        achievements: 15,
        badges: ['Pioneer', 'Champion']
      },
      {
        rank: 2,
        userId: 'user_2',
        user: { name: 'Bob Smith', stakeholderType: 'Buyer', teamName: 'Fresh Market Co' },
        score: 2350,
        change: -1,
        achievements: 12,
        badges: ['Trader', 'Networker']
      },
      {
        rank: 3,
        userId: 'user_3',
        user: { name: 'Carol Davis', stakeholderType: 'AgriTech Innovator', teamName: 'TechFarm Solutions' },
        score: 2200,
        change: 1,
        achievements: 18,
        badges: ['Innovator', 'Mentor']
      }
    ];

    leaderboard.entries = mockEntries;
    leaderboard.lastUpdated = new Date();
  }

  async getLeaderboard(category: string, timeframe: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const leaderboardId = `${category}_${timeframe}`;
    const leaderboard = this.globalLeaderboards.get(leaderboardId);

    if (!leaderboard) return [];

    // Update if stale (more than 5 minutes old)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (leaderboard.lastUpdated < fiveMinutesAgo) {
      await this.updateLeaderboard(category, timeframe);
    }

    return leaderboard.entries.slice(0, limit);
  }

  // Ecosystem statistics
  async getEcosystemStats(): Promise<EcosystemStats> {
    // Mock ecosystem statistics
    return {
      totalUsers: 15420,
      totalTeams: 2340,
      activeChallenges: 12,
      completedChallenges: 89,
      totalAchievements: 56780,
      ecosystemPoints: 2345670,
      topCategories: [
        { category: 'sustainability', points: 450000, users: 5200 },
        { category: 'innovation', points: 380000, users: 4800 },
        { category: 'collaboration', points: 320000, users: 6100 },
        { category: 'impact', points: 290000, users: 4200 },
        { category: 'growth', points: 260000, users: 3800 }
      ],
      regionalBreakdown: [
        { region: 'North America', users: 5200, points: 850000, topStakeholder: 'Farmer' },
        { region: 'Europe', users: 4800, points: 720000, topStakeholder: 'Buyer' },
        { region: 'Asia Pacific', users: 6100, points: 980000, topStakeholder: 'AgriTech Innovator' },
        { region: 'Africa', users: 3200, points: 420000, topStakeholder: 'Cooperative' },
        { region: 'South America', users: 2900, points: 380000, topStakeholder: 'Agronomist' }
      ]
    };
  }

  // Collaboration network
  async updateCollaborationNetwork(): Promise<void> {
    // In a real implementation, this would analyze user interactions,
    // team collaborations, and project participations to build the network

    // Mock network data
    this.collaborationNetwork = {
      nodes: [
        {
          id: 'user_1',
          type: 'user',
          label: 'Alice Johnson',
          stakeholderType: 'Farmer',
          size: 100,
          color: '#22c55e',
          position: { x: 100, y: 100 }
        },
        {
          id: 'user_2',
          type: 'user',
          label: 'Bob Smith',
          stakeholderType: 'Buyer',
          size: 80,
          color: '#3b82f6',
          position: { x: 200, y: 150 }
        },
        {
          id: 'team_1',
          type: 'team',
          label: 'Green Valley Collective',
          size: 120,
          color: '#f59e0b',
          position: { x: 150, y: 200 }
        }
      ],
      edges: [
        {
          source: 'user_1',
          target: 'team_1',
          type: 'collaboration',
          strength: 0.8,
          lastActivity: new Date()
        },
        {
          source: 'user_2',
          target: 'team_1',
          type: 'trade',
          strength: 0.6,
          lastActivity: new Date(Date.now() - 86400000) // 1 day ago
        }
      ],
      clusters: [
        {
          id: 'sustainability_cluster',
          name: 'Sustainability Leaders',
          members: ['user_1', 'team_1'],
          center: { x: 125, y: 150 },
          theme: 'green'
        }
      ]
    };
  }

  getCollaborationNetwork(): CollaborationNetwork {
    return this.collaborationNetwork;
  }

  // Achievement checking
  async checkEcosystemAchievements(userId: string, action: string, context: any): Promise<EcosystemAchievement[]> {
    const unlockedAchievements: EcosystemAchievement[] = [];

    for (const achievement of this.ecosystemAchievements.values()) {
      if (this.shouldUnlockEcosystemAchievement(achievement, userId, action, context)) {
        achievement.unlockedAt = new Date();
        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  private shouldUnlockEcosystemAchievement(
    achievement: EcosystemAchievement,
    userId: string,
    action: string,
    context: any
  ): boolean {
    // Logic to determine if ecosystem achievement should be unlocked
    // This would involve checking cross-team collaborations, multi-stakeholder interactions, etc.

    switch (achievement.id) {
      case 'ecosystem_pioneer':
        return context.collaboratingTeams >= 2 && context.stakeholderTypes >= 3;
      case 'sustainability_champion':
        return context.ledTeams >= 5 && context.sustainabilityMilestones >= 25;
      case 'innovation_ecosystem':
        return context.connectedStakeholders >= 10 && context.innovationProjects >= 3;
      case 'impact_multiplier':
        return context.collaborativeProjects >= 10 && context.impactScore >= 100;
      default:
        return false;
    }
  }

  // Getters
  getEcosystemAchievements(): EcosystemAchievement[] {
    return Array.from(this.ecosystemAchievements.values());
  }

  getActiveChallenges(): EcosystemChallenge[] {
    return Array.from(this.activeChallenges.values()).filter(c => c.status === 'active');
  }

  getUpcomingChallenges(): EcosystemChallenge[] {
    return Array.from(this.activeChallenges.values()).filter(c => c.status === 'upcoming');
  }

  getChallenge(challengeId: string): EcosystemChallenge | undefined {
    return this.activeChallenges.get(challengeId);
  }
}