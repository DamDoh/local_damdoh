/**
 * Achievement Badges Widget - Enhanced gamification component for user engagement
 * Displays earned badges, progress towards new achievements, and gamification stats
 * Single Responsibility: Achievement tracking and display with advanced gamification features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Trophy, Star, Target, Award, Medal, Crown,
  TrendingUp, Users, Heart, Leaf, Zap, Shield,
  ChevronRight, Sparkles
} from 'lucide-react';
import { GamificationService, Achievement, UserGamificationProfile } from "@/services/dashboard/GamificationService";
import { useAuth } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

interface AchievementBadgesProps {
  userRole?: string;
  compact?: boolean;
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  userRole = 'farmer',
  compact = false
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProfile, setUserProfile] = useState<UserGamificationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const gamificationService = GamificationService.getInstance();

  useEffect(() => {
    const loadGamificationData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const [achievementsData, profileData] = await Promise.all([
          gamificationService.getAchievements(user.id),
          gamificationService.getUserProfile(user.id)
        ]);

        setAchievements(achievementsData);
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error loading gamification data:', error);
        toast({
          title: "Error",
          description: "Failed to load achievements data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGamificationData();
  }, [user?.id, gamificationService, toast]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return Crown;
      case 'epic': return Star;
      case 'rare': return Medal;
      default: return Award;
    }
  };

  const earnedAchievements = achievements.filter(a => a.unlockedAt);
  const inProgressAchievements = achievements.filter(a => !a.unlockedAt && a.progress > 0);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-yellow-800">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600 animate-pulse" />
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

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <Trophy className="h-5 w-5 text-yellow-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-yellow-900">
            {earnedAchievements.length} Achievements
          </div>
          <div className="text-xs text-yellow-700">
            Level {userProfile?.level || 1} • {userProfile?.totalPoints || 0} points
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-yellow-600" />
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-yellow-800">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
            Achievements
          </CardTitle>
          {userProfile && (
            <div className="text-right">
              <div className="text-sm font-bold text-yellow-900">Level {userProfile.level}</div>
              <div className="text-xs text-yellow-700">{userProfile.totalPoints} points</div>
            </div>
          )}
        </div>
        <div className="text-sm text-yellow-700">
          {earnedAchievements.length} of {achievements.length} achievements unlocked
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Progress */}
        {userProfile && (
          <div className="p-3 bg-white rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Level Progress</span>
              <span className="text-xs text-gray-600">
                {userProfile.totalPoints - gamificationService.getPointsForNextLevel(userProfile.level - 1)} /
                {gamificationService.getPointsForNextLevel(userProfile.level) - gamificationService.getPointsForNextLevel(userProfile.level - 1)}
              </span>
            </div>
            <Progress
              value={((userProfile.totalPoints - gamificationService.getPointsForNextLevel(userProfile.level - 1)) /
                     (gamificationService.getPointsForNextLevel(userProfile.level) - gamificationService.getPointsForNextLevel(userProfile.level - 1))) * 100}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Level {userProfile.level}</span>
              <span>Level {userProfile.level + 1}</span>
            </div>
          </div>
        )}

        {/* Earned Badges */}
        {earnedAchievements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Earned Badges ({earnedAchievements.length})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {earnedAchievements.slice(0, 6).map((achievement) => {
                const RarityIcon = getRarityIcon(achievement.rarity);
                return (
                  <div key={achievement.id} className="relative p-3 bg-white rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{achievement.icon}</span>
                      <RarityIcon className="h-3 w-3 text-yellow-600" />
                    </div>
                    <div className="text-xs font-semibold text-gray-900 mb-1">{achievement.title}</div>
                    <Badge className={`text-xs ${gamificationService.getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </Badge>
                    {achievement.unlockedAt && (
                      <div className="absolute top-1 right-1">
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {earnedAchievements.length > 6 && (
              <Button variant="ghost" size="sm" className="w-full mt-2 text-yellow-700 hover:text-yellow-900">
                View all achievements <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* In Progress */}
        {inProgressAchievements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              In Progress ({inProgressAchievements.length})
            </h4>
            <div className="space-y-3">
              {inProgressAchievements.slice(0, 2).map((achievement) => (
                <div key={achievement.id} className="p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{achievement.title}</div>
                      <div className="text-xs text-gray-600">{achievement.description}</div>
                    </div>
                    <Badge className={`text-xs ${gamificationService.getRarityColor(achievement.rarity)}`}>
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
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-white rounded border border-yellow-200">
              <div className="text-lg font-bold text-yellow-600">{earnedAchievements.length}</div>
              <div className="text-xs text-yellow-700">Badges</div>
            </div>
            <div className="p-2 bg-white rounded border border-yellow-200">
              <div className="text-lg font-bold text-yellow-600">{userProfile?.currentStreak || 0}</div>
              <div className="text-xs text-yellow-700">Day Streak</div>
            </div>
            <div className="p-2 bg-white rounded border border-yellow-200">
              <div className="text-lg font-bold text-yellow-600">
                {Math.round((earnedAchievements.length / achievements.length) * 100)}%
              </div>
              <div className="text-xs text-yellow-700">Complete</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};