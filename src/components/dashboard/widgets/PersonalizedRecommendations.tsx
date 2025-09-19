/**
 * Personalized Recommendations Widget - AI-powered content suggestions
 * Shows tailored recommendations based on user behavior and preferences
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Lightbulb, TrendingUp, Users, Star, ExternalLink,
  ThumbsUp, MessageCircle, Share, Bookmark, RefreshCw
} from 'lucide-react';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';

interface PersonalizedRecommendationsProps {
  maxItems?: number;
  showRefresh?: boolean;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  maxItems = 5,
  showRefresh = true
}) => {
  const { recommendations, isLoading, refreshRecommendations } = useSmartRecommendations();
  const [dismissedItems, setDismissedItems] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissedItems(prev => new Set(prev).add(id));
  };

  const handleEngage = (id: string, type: string) => {
    // Track user engagement for better recommendations
    console.log(`User engaged with ${type} recommendation: ${id}`);
    // In real app, this would call trackInteraction
  };

  const filteredRecommendations = recommendations
    .filter(rec => !dismissedItems.has(rec.id))
    .slice(0, maxItems);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageCircle className="h-4 w-4" />;
      case 'profile': return <Users className="h-4 w-4" />;
      case 'project': return <Star className="h-4 w-4" />;
      case 'topic': return <TrendingUp className="h-4 w-4" />;
      case 'hashtag': return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'post': return 'border-blue-200 bg-blue-50';
      case 'profile': return 'border-green-200 bg-green-50';
      case 'project': return 'border-purple-200 bg-purple-50';
      case 'topic': return 'border-orange-200 bg-orange-50';
      case 'hashtag': return 'border-pink-200 bg-pink-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getRelevanceBadgeColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.8) return 'bg-blue-100 text-blue-800';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-indigo-800">
            <Lightbulb className="h-5 w-5 mr-2 text-indigo-600 animate-pulse" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-indigo-800">
            <Lightbulb className="h-5 w-5 mr-2 text-indigo-600" />
            Smart Recommendations
          </CardTitle>
          {showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshRecommendations}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-indigo-600">
          Personalized suggestions based on your interests and activity
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-6">
            <Lightbulb className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-indigo-600 text-sm">
              Keep engaging with content to get personalized recommendations!
            </p>
          </div>
        ) : (
          filteredRecommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getRecommendationColor(rec.type)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${rec.type === 'post' ? 'bg-blue-100' :
                    rec.type === 'profile' ? 'bg-green-100' :
                    rec.type === 'project' ? 'bg-purple-100' :
                    rec.type === 'topic' ? 'bg-orange-100' : 'bg-pink-100'}`}>
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{rec.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getRelevanceBadgeColor(rec.relevanceScore)}`}>
                    {Math.round(rec.relevanceScore * 100)}% match
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(rec.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </Button>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
                  {rec.reason}
                </p>
              </div>

              {rec.metadata && Object.keys(rec.metadata).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {Object.entries(rec.metadata).slice(0, 3).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEngage(rec.id, 'view')}
                    className="h-8 px-3 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEngage(rec.id, 'like')}
                    className="h-8 px-3 text-xs"
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEngage(rec.id, 'save')}
                    className="h-8 px-3 text-xs"
                  >
                    <Bookmark className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
                <div className="text-xs text-gray-500">
                  AI-powered suggestion
                </div>
              </div>
            </div>
          ))
        )}

        {filteredRecommendations.length > 0 && (
          <div className="pt-3 border-t border-indigo-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-700">
                {filteredRecommendations.length} personalized suggestions
              </span>
              <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-800 p-0 h-auto">
                View all recommendations →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};