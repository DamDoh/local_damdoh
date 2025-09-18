/**
 * Achievement Badges Widget - Gamification component for user engagement
 * Displays earned badges and progress towards new achievements
 * Single Responsibility: Achievement tracking and display
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Star, Target, Award, Medal, Crown,
  TrendingUp, Users, Heart, Leaf, Zap, Shield
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  earned: boolean;
  progress: number;
  maxProgress: number;
  category: 'farming' | 'investment' | 'community' | 'impact';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementBadgesProps {
  userRole?: string;
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ userRole = 'farmer' }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch achievements
    const fetchAchievements = async () => {
      setIsLoading(true);
      try {
        // Mock achievements data - in real app, this would come from API
        const mockAchievements: Achievement[] = [
          {
            id: 'first-harvest',
            title: 'First Harvest',
            description: 'Complete your first crop harvest',
            icon: Leaf,
            earned: true,
            progress: 1,
            maxProgress: 1,
            category: 'farming',
            rarity: 'common'
          },
          {
            id: 'yield-champion',
            title: 'Yield Champion',
            description: 'Achieve above-average yields for 3 consecutive seasons',
            icon: TrendingUp,
            earned: false,
            progress: 2,
            maxProgress: 3,
            category: 'farming',
            rarity: 'rare'
          },
          {
            id: 'community-helper',
            title: 'Community Helper',
            description: 'Help 10 fellow farmers with advice or resources',
            icon: Users,
            earned: true,
            progress: 10,
            maxProgress: 10,
            category: 'community',
            rarity: 'common'
          },
          {
            id: 'impact-investor',
            title: 'Impact Investor',
            description: 'Fund 5 agricultural projects',
            icon: Heart,
            earned: false,
            progress: 3,
            maxProgress: 5,
            category: 'investment',
            rarity: 'epic'
          },
          {
            id: 'sustainability-pioneer',
            title: 'Sustainability Pioneer',
            description: 'Implement 5 sustainable farming practices',
            icon: Shield,
            earned: false,
            progress: 2,
            maxProgress: 5,
            category: 'impact',
            rarity: 'legendary'
          }
        ];

        // Filter achievements based on user role
        const filteredAchievements = mockAchievements.filter(achievement => {
          if (userRole === 'farmer') return achievement.category !== 'investment';
          if (userRole === 'crowdfunder') return achievement.category === 'investment' || achievement.category === 'community';
          return true; // FI can see all
        });

        setAchievements(filteredAchievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [userRole]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const inProgressAchievements = achievements.filter(a => !a.earned && a.progress > 0);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-yellow-800">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-yellow-800">
          <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
          Achievements ({earnedAchievements.length}/{achievements.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Earned Badges */}
        {earnedAchievements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Earned Badges</h4>
            <div className="grid grid-cols-2 gap-2">
              {earnedAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-yellow-200">
                  <achievement.icon className="h-6 w-6 text-yellow-600" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-900">{achievement.title}</div>
                    <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress */}
        {inProgressAchievements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">In Progress</h4>
            <div className="space-y-3">
              {inProgressAchievements.slice(0, 2).map((achievement) => (
                <div key={achievement.id} className="p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <achievement.icon className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{achievement.title}</div>
                      <div className="text-xs text-gray-600">{achievement.description}</div>
                    </div>
                    <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress
                      value={(achievement.progress / achievement.maxProgress) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-3 border-t border-yellow-200">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 bg-white rounded border border-yellow-200">
              <div className="text-lg font-bold text-yellow-600">{earnedAchievements.length}</div>
              <div className="text-xs text-yellow-700">Badges Earned</div>
            </div>
            <div className="p-2 bg-white rounded border border-yellow-200">
              <div className="text-lg font-bold text-yellow-600">
                {Math.round((earnedAchievements.length / achievements.length) * 100)}%
              </div>
              <div className="text-xs text-yellow-700">Completion</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};