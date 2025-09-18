/**
 * FarmerFeedbackWidget - Microservice Component
 * Allows farmers to provide quick feedback and suggestions
 * Single Responsibility: User feedback collection and improvement
 * Dependencies: feedback-service, user-engagement-api
 */

import React from 'react';
import { MessageSquare, ThumbsUp, AlertCircle, AlertTriangle, Lightbulb, ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FarmerFeedbackWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-pink-800">
        <MessageSquare className="h-5 w-5 mr-2 text-pink-600" />
        Your Voice Matters
      </CardTitle>
      <p className="text-sm text-pink-600 font-normal">Help us improve DamDoh</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Quick Feedback Options */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-pink-800">How is your experience today?</p>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1 bg-white hover:bg-green-50 border-green-200">
            <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
            Great!
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-white hover:bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
            Okay
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-white hover:bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
            Needs Help
          </Button>
        </div>
      </div>

      {/* Feature Requests */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-pink-800">What feature would you like to see?</p>
        <div className="space-y-1">
          <Button size="sm" variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <Lightbulb className="h-4 w-4 mr-2 text-blue-600" />
            Better weather alerts
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200">
            <ShoppingCart className="h-4 w-4 mr-2 text-purple-600" />
            More buyer connections
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start bg-white hover:bg-green-50 border-green-200">
            <Zap className="h-4 w-4 mr-2 text-green-600" />
            Faster AI responses
          </Button>
        </div>
      </div>

      {/* Feedback Stats */}
      <div className="pt-3 border-t border-pink-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-pink-700">Your feedback helps</span>
          <Badge className="bg-pink-100 text-pink-800">247 farmers improved</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);