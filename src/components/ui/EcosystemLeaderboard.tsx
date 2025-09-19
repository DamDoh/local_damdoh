/**
 * Ecosystem Leaderboard Component - Shows global rankings and ecosystem challenges
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Target, Users, TrendingUp, Crown, Star } from 'lucide-react';
import { useEcosystemGamification, useEcosystemChallenges, useEcosystemLeaderboards } from '@/hooks/useEcosystemGamification';
import { LeaderboardEntry, EcosystemChallenge } from '@/services/dashboard/EcosystemGamificationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EcosystemLeaderboardProps {
  compact?: boolean;
  showChallenges?: boolean;
  className?: string;
}

const EcosystemLeaderboard: React.FC<EcosystemLeaderboardProps> = ({
  compact = false,
  showChallenges = true,
  className = ''
}) => {
  const {
    ecosystemStats,
    getEcosystemStats,
    loading: ecosystemLoading
  } = useEcosystemGamification();

  const {
    activeChallenges,
    upcomingChallenges,
    joinChallenge,
    getChallengeCompletion,
    loading: challengesLoading
  } = useEcosystemChallenges();

  const {
    loadLeaderboard,
    getCachedLeaderboard,
    loading: leaderboardLoading
  } = useEcosystemLeaderboards();

  const [selectedCategory, setSelectedCategory] = useState('points');
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Load leaderboard data
  useEffect(() => {
    const loadData = async () => {
      const entries = await loadLeaderboard(selectedCategory, selectedTimeframe, compact ? 5 : 10);
      setLeaderboard(entries);
    };

    loadData();
  }, [selectedCategory, selectedTimeframe, loadLeaderboard, compact]);

  // Load ecosystem stats
  useEffect(() => {
    getEcosystemStats();
  }, [getEcosystemStats]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'points':
        return <Star className="h-4 w-4" />;
      case 'achievements':
        return <Trophy className="h-4 w-4" />;
      case 'collaboration':
        return <Users className="h-4 w-4" />;
      case 'impact':
        return <Target className="h-4 w-4" />;
      case 'sustainability':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border overflow-hidden ${className}`}
           style={{ borderColor: 'var(--color-border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              Global Leaderboard
            </h3>
            <Trophy className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>

        <div className="p-4">
          {/* Category selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {['points', 'achievements', 'collaboration'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="flex items-center gap-1 whitespace-nowrap"
              >
                {getCategoryIcon(category)}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Top 3 */}
          <div className="space-y-3">
            {leaderboard.slice(0, 3).map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-3 p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {entry.user.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    {entry.user.stakeholderType}
                    {entry.user.teamName && ` • ${entry.user.teamName}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: 'var(--color-primary)' }}>
                    {entry.score.toLocaleString()}
                  </div>
                  {entry.change !== 0 && (
                    <div className={`text-xs ${entry.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.change > 0 ? '+' : ''}{entry.change}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Ecosystem stats */}
          {ecosystemStats && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                    {ecosystemStats.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    Active Users
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                    {ecosystemStats.ecosystemPoints.toLocaleString()}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    Total Points
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border overflow-hidden ${className}`}
         style={{ borderColor: 'var(--color-border)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Ecosystem Leaderboard
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
              Compete with stakeholders worldwide
            </p>
          </div>
          <Trophy className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>

      <div className="p-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-lg px-3 py-2"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <option value="points">Total Points</option>
              <option value="achievements">Achievements</option>
              <option value="collaboration">Collaboration</option>
              <option value="impact">Impact Score</option>
              <option value="sustainability">Sustainability</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Timeframe
            </label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border rounded-lg px-3 py-2"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3 mb-6">
          {leaderboardLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-4 p-4 rounded-lg border"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: entry.rank <= 3 ? 'var(--color-background)' : 'var(--color-surface)'
                }}
              >
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {entry.user.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {entry.user.stakeholderType}
                    </Badge>
                    {entry.user.teamName && (
                      <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                        • {entry.user.teamName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      {entry.achievements} achievements
                    </span>
                    {entry.badges.length > 0 && (
                      <div className="flex gap-1">
                        {entry.badges.slice(0, 3).map((badge, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    {entry.score.toLocaleString()}
                  </div>
                  {entry.change !== 0 && (
                    <div className={`text-sm flex items-center gap-1 ${
                      entry.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {entry.change > 0 ? '+' : ''}{entry.change}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Active Challenges */}
        {showChallenges && activeChallenges.length > 0 && (
          <div className="border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Active Challenges
            </h3>

            <div className="space-y-4">
              {activeChallenges.slice(0, 3).map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {challenge.title}
                    </h4>
                    <Badge variant="secondary">
                      {Math.round(getChallengeCompletion(challenge))}% Complete
                    </Badge>
                  </div>

                  <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                    {challenge.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {challenge.rewards.slice(0, 2).map((reward, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reward.type}: {typeof reward.value === 'number' ? reward.value : reward.value}
                        </Badge>
                      ))}
                    </div>

                    <Button size="sm" onClick={() => joinChallenge(challenge.id)}>
                      Join Challenge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ecosystem Stats */}
        {ecosystemStats && (
          <div className="border-t pt-6 mt-6" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Ecosystem Overview
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {ecosystemStats.totalUsers.toLocaleString()}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  Active Users
                </div>
              </div>

              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {ecosystemStats.totalTeams.toLocaleString()}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  Teams
                </div>
              </div>

              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {ecosystemStats.activeChallenges}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  Active Challenges
                </div>
              </div>

              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {ecosystemStats.ecosystemPoints.toLocaleString()}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  Total Points
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EcosystemLeaderboard;