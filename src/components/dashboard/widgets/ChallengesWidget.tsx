/**
 * Challenges Widget - Dynamic gamification challenges for user engagement
 * Displays active challenges, progress tracking, and participation incentives
 * Single Responsibility: Challenge display and interaction
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Target, Trophy, Users, Clock, Star,
  Zap, Award, Calendar, CheckCircle,
  ChevronRight, Flame
} from 'lucide-react';
import { GamificationService, Challenge } from "@/services/dashboard/GamificationService";
import { useAuth } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

interface ChallengesWidgetProps {
  maxChallenges?: number;
  showCompleted?: boolean;
}

export const ChallengesWidget: React.FC<ChallengesWidgetProps> = ({
  maxChallenges = 3,
  showCompleted = false
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const gamificationService = GamificationService.getInstance();

  useEffect(() => {
    const loadChallenges = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const challengesData = await gamificationService.getActiveChallenges(user.id);
        setChallenges(challengesData);
      } catch (error) {
        console.error('Error loading challenges:', error);
        toast({
          title: "Error",
          description: "Failed to load challenges.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenges();
  }, [user?.id, gamificationService, toast]);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    setJoiningChallenge(challengeId);
    try {
      const success = await gamificationService.joinChallenge(user.id, challengeId);
      if (success) {
        toast({
          title: "Challenge Joined!",
          description: "You've successfully joined this challenge.",
        });
        // Refresh challenges
        const challengesData = await gamificationService.getActiveChallenges(user.id);
        setChallenges(challengesData);
      } else {
        toast({
          title: "Error",
          description: "Failed to join challenge. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge.",
        variant: "destructive"
      });
    } finally {
      setJoiningChallenge(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d left` : 'Ending soon';
  };

  const activeChallenges = challenges.filter(c => c.isActive && !c.completedAt);
  const displayChallenges = showCompleted
    ? challenges.slice(0, maxChallenges)
    : activeChallenges.slice(0, maxChallenges);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-purple-800">
            <Target className="h-5 w-5 mr-2 text-purple-600 animate-pulse" />
            Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-purple-800">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Challenges
          </CardTitle>
          <Badge variant="secondary" className="text-purple-700">
            {activeChallenges.length} Active
          </Badge>
        </div>
        <p className="text-sm text-purple-600">
          Complete challenges to earn points and unlock achievements
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayChallenges.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-purple-600 text-sm">
              No active challenges available right now.
            </p>
            <p className="text-purple-500 text-xs mt-1">
              Check back soon for new challenges!
            </p>
          </div>
        ) : (
          displayChallenges.map((challenge) => (
            <div key={challenge.id} className="p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{challenge.title}</h4>
                    <Badge className={`text-xs ${gamificationService.getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{challenge.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {challenge.participants}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(challenge.endDate)}
                    </div>
                  </div>
                </div>

                {challenge.progress !== undefined && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-600">
                      {challenge.progress}/{challenge.requirements[0]?.target || 0}
                    </div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {challenge.progress !== undefined && (
                <div className="mb-3">
                  <Progress
                    value={(challenge.progress / (challenge.requirements[0]?.target || 1)) * 100}
                    className="h-2"
                  />
                </div>
              )}

              {/* Requirements */}
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-700 mb-1">Requirements:</div>
                <div className="space-y-1">
                  {challenge.requirements.slice(0, 2).map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      {req.description}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <div className="text-xs text-gray-600">
                    {challenge.rewards.map(r => `${r.value} ${r.type}`).join(', ')}
                  </div>
                </div>

                {challenge.completedAt ? (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleJoinChallenge(challenge.id)}
                    disabled={joiningChallenge === challenge.id}
                    className="text-xs"
                  >
                    {joiningChallenge === challenge.id ? (
                      'Joining...'
                    ) : (
                      <>
                        <Flame className="h-3 w-3 mr-1" />
                        Join Challenge
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}

        {displayChallenges.length > 0 && (
          <div className="pt-3 border-t border-purple-200">
            <Button variant="ghost" size="sm" className="w-full text-purple-700 hover:text-purple-900">
              View all challenges <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};