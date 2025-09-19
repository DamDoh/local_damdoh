/**
 * Connection Suggestions Widget - AI-powered networking recommendations
 * Suggests relevant farmers, investors, and experts to connect with
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users, UserPlus, MessageCircle, MapPin, Star,
  RefreshCw, ChevronRight, Check, X, Heart,
  Wheat, DollarSign, Microscope, Handshake, User
} from 'lucide-react';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';

interface ConnectionSuggestionsProps {
  maxSuggestions?: number;
  showCompatibility?: boolean;
}

export const ConnectionSuggestions: React.FC<ConnectionSuggestionsProps> = ({
  maxSuggestions = 4,
  showCompatibility = true
}) => {
  const { connections, isLoading, refreshRecommendations } = useSmartRecommendations();
  const [connectingUsers, setConnectingUsers] = useState<Set<string>>(new Set());
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());

  const handleConnect = async (userId: string) => {
    setConnectingUsers(prev => new Set(prev).add(userId));

    // Simulate API call
    setTimeout(() => {
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setConnectedUsers(prev => new Set(prev).add(userId));
    }, 1500);
  };

  const handleMessage = (userId: string) => {
    // In real app, this would open a chat or messaging interface
    console.log(`Starting conversation with user: ${userId}`);
  };

  const filteredConnections = connections.slice(0, maxSuggestions);

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.8) return 'bg-blue-500';
    if (score >= 0.7) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getRoleIcon = (role: string) => {
    if (role.toLowerCase().includes('farmer')) return <Wheat className="h-3 w-3" />;
    if (role.toLowerCase().includes('investor') || role.toLowerCase().includes('financial')) return <DollarSign className="h-3 w-3" />;
    if (role.toLowerCase().includes('expert') || role.toLowerCase().includes('agronomist')) return <Microscope className="h-3 w-3" />;
    if (role.toLowerCase().includes('cooperative')) return <Handshake className="h-3 w-3" />;
    return <User className="h-3 w-3" />;
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-teal-800">
            <Users className="h-5 w-5 mr-2 text-teal-600 animate-pulse" />
            <Handshake className="h-5 w-5 mr-2 text-teal-600" />
            Connection Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
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
    <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-teal-800">
            <Users className="h-5 w-5 mr-2 text-teal-600" />
            <Handshake className="h-5 w-5 mr-2 text-teal-600" />
            Smart Connections
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
        <p className="text-sm text-teal-600">
          People you should connect with based on your interests
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredConnections.length === 0 ? (
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-teal-300 mx-auto mb-3" />
            <p className="text-teal-600 text-sm">
              No connection suggestions available right now.
            </p>
            <p className="text-teal-500 text-xs mt-1">
              Keep engaging with the community to get personalized suggestions!
            </p>
          </div>
        ) : (
          filteredConnections.map((connection) => (
            <div
              key={connection.id}
              className="p-4 bg-white rounded-lg border border-teal-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-teal-200">
                      <AvatarImage src={connection.avatar} />
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {connection.name.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-sm">{getRoleIcon(connection.role)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{connection.name}</h4>
                    <p className="text-xs text-gray-600 mb-1">{connection.role}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-teal-600" />
                        <span className="text-xs text-teal-700">
                          {connection.mutualConnections} mutual connection{connection.mutualConnections !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {showCompatibility && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="text-xs font-semibold text-gray-700">
                        {Math.round(connection.compatibilityScore * 100)}% match
                      </span>
                    </div>
                    <div className="w-16">
                      <Progress
                        value={connection.compatibilityScore * 100}
                        className="h-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Reasons for suggestion */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {connection.reasons.slice(0, 2).map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                      {reason}
                    </Badge>
                  ))}
                  {connection.reasons.length > 2 && (
                    <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                      +{connection.reasons.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {connectedUsers.has(connection.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs bg-green-50 border-green-200 text-green-700"
                      disabled
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Connected
                    </Button>
                  ) : connectingUsers.has(connection.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      disabled
                    >
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-600 mr-1"></div>
                      Connecting...
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(connection.id)}
                      className="h-8 px-3 text-xs hover:bg-teal-50 border-teal-200"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessage(connection.id)}
                    className="h-8 px-3 text-xs hover:bg-teal-50 border-teal-200"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                </div>

                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}

        {filteredConnections.length > 0 && (
          <div className="pt-3 border-t border-teal-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-700">
                {filteredConnections.length} smart suggestions
              </span>
              <Button variant="link" className="text-xs text-teal-600 hover:text-teal-800 p-0 h-auto">
                View all suggestions <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};