/**
 * Leaderboard Widget - Social recognition and competitive rankings
 * Displays user rankings, points, and social comparison features
 * Single Responsibility: Leaderboard display and social engagement
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy, Medal, Award, Crown, TrendingUp,
  TrendingDown, Minus, Star, Users,
  ChevronRight, RefreshCw
} from 'lucide-react';
import { GamificationService, LeaderboardEntry } from "@/services/dashboard/GamificationService";
import { useAuth } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardWidgetProps {
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  limit?: number;
  showCurrentUser?: boolean;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  period = 'weekly',
  limit = 10,
  showCurrentUser = true
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const gamificationService = GamificationService.getInstance();

  const loadLeaderboard = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const leaderboardData = await gamificationService.getLeaderboard(period, limit);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [period, limit, gamificationService, toast]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-400';
  };

  const currentUserEntry = user ? leaderboard.find(entry => entry.userId === user.id) : null;
  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-indigo-800">
            <Trophy className="h-5 w-5 mr-2 text-indigo-600 animate-pulse" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-indigo-800">
            <Trophy className="h-5 w-5 mr-2 text-indigo-600" />
            Leaderboard
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadLeaderboard(true)}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-indigo-700 border-indigo-300">
            {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')}
          </Badge>
          <span className="text-sm text-indigo-600">
            Top performers this {period === 'all-time' ? 'period' : period}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {topThree.map((entry, index) => {
              const position = index + 1;
              const isCurrentUser = user && entry.userId === user.id;
              return (
                <div
                  key={entry.userId}
                  className={`text-center p-3 rounded-lg border-2 ${
                    isCurrentUser
                      ? 'bg-indigo-100 border-indigo-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    {getRankIcon(position)}
                  </div>
                  <Avatar className="w-10 h-10 mx-auto mb-2 border-2 border-white shadow-sm">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm">
                      {entry.displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs font-semibold text-gray-900 mb-1 truncate">
                    {entry.displayName}
                  </div>
                  <div className="text-sm font-bold text-indigo-600">
                    {entry.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">pts</div>
                  {entry.change !== 0 && (
                    <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${getChangeColor(entry.change)}`}>
                      {getChangeIcon(entry.change)}
                      {Math.abs(entry.change)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Rest of Leaderboard */}
        <div className="space-y-2">
          {restOfLeaderboard.map((entry) => {
            const isCurrentUser = user && entry.userId === user.id;
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isCurrentUser
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-gray-200'
                } hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank)}
                </div>

                <Avatar className="w-8 h-8 border border-gray-200">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                    {entry.displayName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${
                      isCurrentUser ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {entry.displayName}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Level {entry.level}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    isCurrentUser ? 'text-indigo-600' : 'text-gray-900'
                  }`}>
                    {entry.points.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {entry.change !== 0 && (
                      <>
                        <span className={getChangeColor(entry.change)}>
                          {entry.change > 0 ? '+' : ''}{entry.change}
                        </span>
                        {getChangeIcon(entry.change)}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current User Highlight (if not in top list) */}
        {showCurrentUser && currentUserEntry && currentUserEntry.rank > limit && (
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <div className="text-xs text-indigo-600 mb-2 font-medium">Your Ranking</div>
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-center w-8">
                <span className="text-sm font-bold text-indigo-600">#{currentUserEntry.rank}</span>
              </div>

              <Avatar className="w-8 h-8 border border-indigo-300">
                <AvatarImage src={currentUserEntry.avatar} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                  {currentUserEntry.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="text-sm font-medium text-indigo-900">
                  {currentUserEntry.displayName}
                </div>
                <div className="text-xs text-indigo-600">
                  Level {currentUserEntry.level}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-indigo-600">
                  {currentUserEntry.points.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {currentUserEntry.change !== 0 && (
                    <>
                      <span className={getChangeColor(currentUserEntry.change)}>
                        {currentUserEntry.change > 0 ? '+' : ''}{currentUserEntry.change}
                      </span>
                      {getChangeIcon(currentUserEntry.change)}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-indigo-200">
          <div className="flex items-center justify-between text-xs text-indigo-600">
            <span>{leaderboard.length} participants</span>
            <Button variant="ghost" size="sm" className="text-indigo-700 hover:text-indigo-900 p-0 h-auto">
              View full leaderboard <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};