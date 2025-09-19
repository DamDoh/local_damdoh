/**
 * Ecosystem Gamification Hook - Provides ecosystem-wide gamification functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-utils';
import {
  EcosystemGamificationService,
  EcosystemAchievement,
  EcosystemChallenge,
  LeaderboardEntry,
  EcosystemStats,
  CollaborationNetwork
} from '@/services/dashboard/EcosystemGamificationService';

export interface UseEcosystemGamificationReturn {
  // Achievements
  ecosystemAchievements: EcosystemAchievement[];
  unlockedEcosystemAchievements: EcosystemAchievement[];

  // Challenges
  activeChallenges: EcosystemChallenge[];
  upcomingChallenges: EcosystemChallenge[];
  joinChallenge: (challengeId: string) => Promise<void>;
  updateChallengeProgress: (challengeId: string, objectiveId: string, progress: number) => Promise<void>;

  // Leaderboards
  getLeaderboard: (category: string, timeframe: string, limit?: number) => Promise<LeaderboardEntry[]>;

  // Statistics
  ecosystemStats: EcosystemStats | null;
  getEcosystemStats: () => Promise<EcosystemStats>;

  // Network
  collaborationNetwork: CollaborationNetwork | null;
  updateCollaborationNetwork: () => Promise<void>;

  // Loading states
  loading: {
    achievements: boolean;
    challenges: boolean;
    leaderboards: boolean;
    stats: boolean;
    network: boolean;
  };
}

export const useEcosystemGamification = (): UseEcosystemGamificationReturn => {
  const { user } = useAuth();
  const ecosystemService = EcosystemGamificationService.getInstance();

  const [ecosystemAchievements, setEcosystemAchievements] = useState<EcosystemAchievement[]>([]);
  const [unlockedEcosystemAchievements, setUnlockedEcosystemAchievements] = useState<EcosystemAchievement[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<EcosystemChallenge[]>([]);
  const [upcomingChallenges, setUpcomingChallenges] = useState<EcosystemChallenge[]>([]);
  const [ecosystemStats, setEcosystemStats] = useState<EcosystemStats | null>(null);
  const [collaborationNetwork, setCollaborationNetwork] = useState<CollaborationNetwork | null>(null);
  const [loading, setLoading] = useState({
    achievements: false,
    challenges: false,
    leaderboards: false,
    stats: false,
    network: false
  });

  // Load ecosystem achievements
  const loadEcosystemAchievements = useCallback(async () => {
    setLoading(prev => ({ ...prev, achievements: true }));
    try {
      const achievements = ecosystemService.getEcosystemAchievements();
      setEcosystemAchievements(achievements);

      // Mock unlocked achievements - in real app, this would come from user data
      const unlocked = achievements.filter(a => a.unlockedAt);
      setUnlockedEcosystemAchievements(unlocked);
    } catch (error) {
      console.error('Failed to load ecosystem achievements:', error);
    } finally {
      setLoading(prev => ({ ...prev, achievements: false }));
    }
  }, []);

  // Load challenges
  const loadChallenges = useCallback(async () => {
    setLoading(prev => ({ ...prev, challenges: true }));
    try {
      const active = ecosystemService.getActiveChallenges();
      const upcoming = ecosystemService.getUpcomingChallenges();

      setActiveChallenges(active);
      setUpcomingChallenges(upcoming);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(prev => ({ ...prev, challenges: false }));
    }
  }, []);

  // Load ecosystem stats
  const getEcosystemStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const stats = await ecosystemService.getEcosystemStats();
      setEcosystemStats(stats);
      return stats;
    } catch (error) {
      console.error('Failed to load ecosystem stats:', error);
      return null as any;
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  // Update collaboration network
  const updateCollaborationNetwork = useCallback(async () => {
    setLoading(prev => ({ ...prev, network: true }));
    try {
      await ecosystemService.updateCollaborationNetwork();
      const network = ecosystemService.getCollaborationNetwork();
      setCollaborationNetwork(network);
    } catch (error) {
      console.error('Failed to update collaboration network:', error);
    } finally {
      setLoading(prev => ({ ...prev, network: false }));
    }
  }, []);

  // Challenge operations
  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!user?.id) return;

    try {
      await ecosystemService.joinChallenge(challengeId, user.id);
      await loadChallenges(); // Refresh challenges
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  }, [user?.id, loadChallenges]);

  const updateChallengeProgress = useCallback(async (challengeId: string, objectiveId: string, progress: number) => {
    if (!user?.id) return;

    try {
      await ecosystemService.updateChallengeProgress(challengeId, user.id, objectiveId, progress);
      await loadChallenges(); // Refresh challenges
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
    }
  }, [user?.id, loadChallenges]);

  // Leaderboard operations
  const getLeaderboard = useCallback(async (category: string, timeframe: string, limit: number = 10) => {
    setLoading(prev => ({ ...prev, leaderboards: true }));
    try {
      const entries = await ecosystemService.getLeaderboard(category, timeframe, limit);
      return entries;
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, leaderboards: false }));
    }
  }, []);

  // Initialize data
  useEffect(() => {
    loadEcosystemAchievements();
    loadChallenges();
    getEcosystemStats();
    updateCollaborationNetwork();
  }, [loadEcosystemAchievements, loadChallenges, getEcosystemStats, updateCollaborationNetwork]);

  return {
    ecosystemAchievements,
    unlockedEcosystemAchievements,
    activeChallenges,
    upcomingChallenges,
    joinChallenge,
    updateChallengeProgress,
    getLeaderboard,
    ecosystemStats,
    getEcosystemStats,
    collaborationNetwork,
    updateCollaborationNetwork,
    loading
  };
};

// Hook for ecosystem challenges
export const useEcosystemChallenges = () => {
  const {
    activeChallenges,
    upcomingChallenges,
    joinChallenge,
    updateChallengeProgress,
    loading
  } = useEcosystemGamification();

  const getUserChallengeProgress = useCallback((challengeId: string, userId: string) => {
    const challenge = activeChallenges.find(c => c.id === challengeId);
    if (!challenge) return null;

    const participant = challenge.participants.find(p => p.userId === userId);
    return participant || null;
  }, [activeChallenges]);

  const getChallengeCompletion = useCallback((challenge: EcosystemChallenge) => {
    const totalObjectives = challenge.objectives.length;
    const completedObjectives = challenge.objectives.filter(o => o.current >= o.target).length;
    return (completedObjectives / totalObjectives) * 100;
  }, []);

  return {
    activeChallenges,
    upcomingChallenges,
    joinChallenge,
    updateChallengeProgress,
    getUserChallengeProgress,
    getChallengeCompletion,
    loading: loading.challenges
  };
};

// Hook for ecosystem leaderboards
export const useEcosystemLeaderboards = () => {
  const { getLeaderboard, loading } = useEcosystemGamification();

  const [leaderboards, setLeaderboards] = useState<{
    [key: string]: LeaderboardEntry[];
  }>({});

  const loadLeaderboard = useCallback(async (
    category: string,
    timeframe: string,
    limit: number = 10
  ) => {
    const key = `${category}_${timeframe}`;
    const entries = await getLeaderboard(category, timeframe, limit);
    setLeaderboards(prev => ({ ...prev, [key]: entries }));
    return entries;
  }, [getLeaderboard]);

  const getCachedLeaderboard = useCallback((category: string, timeframe: string) => {
    const key = `${category}_${timeframe}`;
    return leaderboards[key] || [];
  }, [leaderboards]);

  return {
    loadLeaderboard,
    getCachedLeaderboard,
    loading: loading.leaderboards
  };
};

// Hook for collaboration network
export const useCollaborationNetwork = () => {
  const { collaborationNetwork, updateCollaborationNetwork, loading } = useEcosystemGamification();

  const getUserConnections = useCallback((userId: string) => {
    if (!collaborationNetwork) return [];

    return collaborationNetwork.edges
      .filter(edge => edge.source === userId || edge.target === userId)
      .map(edge => {
        const connectedId = edge.source === userId ? edge.target : edge.source;
        const connectedNode = collaborationNetwork.nodes.find(n => n.id === connectedId);
        return {
          ...edge,
          node: connectedNode
        };
      });
  }, [collaborationNetwork]);

  const getNetworkClusters = useCallback(() => {
    return collaborationNetwork?.clusters || [];
  }, [collaborationNetwork]);

  const findShortestPath = useCallback((startId: string, endId: string) => {
    // Simple BFS for finding connection paths
    if (!collaborationNetwork) return null;

    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[] }> = [
      { nodeId: startId, path: [startId] }
    ];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      if (nodeId === endId) {
        return path;
      }

      // Find connected nodes
      const connections = collaborationNetwork.edges
        .filter(edge => edge.source === nodeId || edge.target === nodeId)
        .map(edge => edge.source === nodeId ? edge.target : edge.source);

      for (const connectedId of connections) {
        if (!visited.has(connectedId)) {
          queue.push({
            nodeId: connectedId,
            path: [...path, connectedId]
          });
        }
      }
    }

    return null; // No path found
  }, [collaborationNetwork]);

  return {
    network: collaborationNetwork,
    updateNetwork: updateCollaborationNetwork,
    getUserConnections,
    getNetworkClusters,
    findShortestPath,
    loading: loading.network
  };
};