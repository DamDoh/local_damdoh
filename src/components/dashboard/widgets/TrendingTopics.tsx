/**
 * Trending Topics Widget - AI-powered trending agricultural topics
 * Shows popular hashtags, topics, and discussions in real-time
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrendingUp, Hash, Users, MessageCircle, Flame,
  ArrowUp, RefreshCw, Filter, Clock
} from 'lucide-react';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';

interface TrendingTopicsProps {
  maxTopics?: number;
  showFilters?: boolean;
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({
  maxTopics = 6,
  showFilters = true
}) => {
  const { trendingTopics, isLoading, refreshRecommendations } = useSmartRecommendations();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const categories = ['all', 'farming', 'finance', 'technology', 'market', 'community'];

  const filteredTopics = trendingTopics
    .filter(topic => selectedCategory === 'all' || topic.category === selectedCategory)
    .slice(0, maxTopics);

  const getGrowthIcon = (growth: number) => {
    if (growth >= 100) return <Flame className="h-4 w-4 text-red-500" />;
    if (growth >= 50) return <ArrowUp className="h-4 w-4 text-orange-500" />;
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 100) return 'text-red-600 bg-red-50';
    if (growth >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      farming: 'bg-green-100 text-green-800',
      finance: 'bg-blue-100 text-blue-800',
      technology: 'bg-purple-100 text-purple-800',
      market: 'bg-yellow-100 text-yellow-800',
      community: 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-orange-800">
            <TrendingUp className="h-5 w-5 mr-2 text-orange-600 animate-pulse" />
            <Flame className="h-4 w-4 mr-1" /> Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
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
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-orange-800">
            <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
            <Flame className="h-4 w-4 mr-1" /> Trending Topics
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshRecommendations}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-orange-600">
          What's hot in the agricultural community right now
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-orange-200">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Category:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="h-7 px-3 text-xs capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-700">Time range:</span>
            <div className="flex gap-1">
              {(['24h', '7d', '30d'] as const).map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="h-7 px-2 text-xs"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Topics List */}
        {filteredTopics.length === 0 ? (
          <div className="text-center py-6">
            <TrendingUp className="h-12 w-12 text-orange-300 mx-auto mb-3" />
            <p className="text-orange-600 text-sm">
              No trending topics in this category right now.
            </p>
            <p className="text-orange-500 text-xs mt-1">
              Check back later or try a different category!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTopics.map((topic, index) => (
              <div
                key={topic.id}
                className="p-4 bg-white rounded-lg border border-orange-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full text-orange-600 font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm hover:text-orange-600 cursor-pointer">
                        {topic.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getCategoryColor(topic.category)}`}>
                          {topic.category}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {topic.postCount} posts
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getGrowthColor(topic.growth)}`}>
                    {getGrowthIcon(topic.growth)}
                    <span className="text-xs font-semibold">+{topic.growth}%</span>
                  </div>
                </div>

                {/* Top Contributors */}
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">Top contributors:</p>
                  <div className="flex items-center space-x-1">
                    {topic.topContributors.slice(0, 3).map((contributor, idx) => (
                      <Avatar key={idx} className="w-6 h-6 border border-white">
                        <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                          {contributor.substring(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {topic.topContributors.length > 3 && (
                      <span className="text-xs text-gray-500 ml-1">
                        +{topic.topContributors.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                      <Hash className="h-3 w-3 mr-1" />
                      Follow
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Discuss
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {timeRange} trend
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {filteredTopics.length > 0 && (
          <div className="pt-3 border-t border-orange-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-700">
                {filteredTopics.length} trending topics
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-gray-600">Hot</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-gray-600">Growing</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};