/**
 * General Widgets - Universal widgets for general stakeholders
 * Provides broad access to platform features and community engagement
 */

import React from 'react';
import Link from 'next/link';
import {
  Users, Globe, BookOpen, Heart, Star, TrendingUp,
  Calendar, Bell, MessageSquare, Shield, Award, Zap,
  CheckCircle, Clock, MapPin, DollarSign, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 🌐 COMMUNITY ENGAGEMENT - Connect with the agriculture ecosystem
export const CommunityEngagementWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-blue-800">
        <Users className="h-5 w-5 mr-2 text-blue-600" />
        Community Hub
      </CardTitle>
      <p className="text-sm text-blue-600 font-normal">Connect with farmers, experts, and stakeholders</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Community Features */}
      <div className="space-y-2">
        <Link href="/forums">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <MessageSquare className="h-4 w-4 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-blue-800">Discussion Forums</div>
              <div className="text-xs text-blue-600">Join agricultural conversations</div>
            </div>
          </Button>
        </Link>

        <Link href="/groups">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-green-50 border-green-200">
            <Users className="h-4 w-4 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-green-800">Interest Groups</div>
              <div className="text-xs text-green-600">Connect with like-minded people</div>
            </div>
          </Button>
        </Link>

        <Link href="/network">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200">
            <Globe className="h-4 w-4 mr-3 text-purple-600" />
            <div className="text-left">
              <div className="font-semibold text-purple-800">Professional Network</div>
              <div className="text-xs text-purple-600">Build your agriculture network</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Community Stats */}
      <div className="pt-3 border-t border-blue-200">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-blue-600">2,847</p>
            <p className="text-xs text-blue-700">Active Members</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">156</p>
            <p className="text-xs text-green-700">Discussions</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600">42</p>
            <p className="text-xs text-purple-700">Events</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 📚 KNOWLEDGE CENTER - Access learning resources and information
export const KnowledgeCenterWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-green-800">
        <BookOpen className="h-5 w-5 mr-2 text-green-600" />
        Knowledge Center
      </CardTitle>
      <p className="text-sm text-green-600 font-normal">Learn about sustainable agriculture</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Learning Resources */}
      <div className="space-y-2">
        <Link href="/knowledge-hub">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-green-50 border-green-200">
            <BookOpen className="h-4 w-4 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-green-800">Learning Hub</div>
              <div className="text-xs text-green-600">Courses, guides, and resources</div>
            </div>
          </Button>
        </Link>

        <Link href="/industry-news">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <TrendingUp className="h-4 w-4 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-blue-800">Industry News</div>
              <div className="text-xs text-blue-600">Latest agriculture trends</div>
            </div>
          </Button>
        </Link>

        <Link href="/sustainability">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200">
            <Heart className="h-4 w-4 mr-3 text-purple-600" />
            <div className="text-left">
              <div className="font-semibold text-purple-800">Sustainability</div>
              <div className="text-xs text-purple-600">Environmental best practices</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Popular Topics */}
      <div className="pt-3 border-t border-green-200">
        <p className="text-sm font-medium text-green-800 mb-2">🔥 Popular Topics</p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-800 cursor-pointer hover:bg-green-200">Climate-Smart Ag</Badge>
          <Badge className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200">Organic Farming</Badge>
          <Badge className="bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200">Regenerative Ag</Badge>
          <Badge className="bg-orange-100 text-orange-800 cursor-pointer hover:bg-orange-200">AgriTech</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 🏆 ACHIEVEMENTS & RECOGNITION - Track contributions and milestones
export const AchievementsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-yellow-800">
        <Award className="h-5 w-5 mr-2 text-yellow-600" />
        Achievements
      </CardTitle>
      <p className="text-sm text-yellow-600 font-normal">Your contributions to the ecosystem</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Recent Achievements */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Community Contributor</p>
              <p className="text-xs text-yellow-700">Posted 10 helpful discussions</p>
            </div>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Earned 2 days ago</Badge>
        </div>

        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Knowledge Sharer</p>
              <p className="text-xs text-yellow-700">Helped 25 community members</p>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800 text-xs">Earned 1 week ago</Badge>
        </div>
      </div>

      {/* Achievement Progress */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-yellow-800"><TrendingUp className="h-4 w-4 inline mr-1" /> Next Milestones</h4>
        <div className="space-y-2">
          <div className="p-2 bg-white rounded border border-yellow-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-yellow-800">Expert Contributor</span>
              <span className="text-xs text-yellow-700">15/20 posts</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="p-2 bg-white rounded border border-yellow-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-yellow-800">Mentor</span>
              <span className="text-xs text-yellow-700">3/5 mentees</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 📅 EVENTS & OPPORTUNITIES - Upcoming events and opportunities
export const EventsOpportunitiesWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-purple-800">
        <Calendar className="h-5 w-5 mr-2 text-purple-600" />
        Events & Opportunities
      </CardTitle>
      <p className="text-sm text-purple-600 font-normal">Stay connected with the agriculture community</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Upcoming Events */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-800">AgriTech Innovation Summit</p>
            <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>
          </div>
          <p className="text-xs text-purple-700 mb-2">March 15, 2024 • Online</p>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-700">Free registration</span>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-2 bg-purple-50 hover:bg-purple-100 border-purple-200">
            Register Now
          </Button>
        </div>

        <div className="p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-800">Farmers Market Networking</p>
            <Badge className="bg-green-100 text-green-800">In-Person</Badge>
          </div>
          <p className="text-xs text-purple-700 mb-2">March 22, 2024 • Nairobi</p>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-700">Westlands Mall</span>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-2 bg-green-50 hover:bg-green-100 border-green-200">
            Join Event
          </Button>
        </div>
      </div>

      {/* Opportunities */}
      <div className="pt-3 border-t border-purple-200">
        <p className="text-sm font-medium text-purple-800 mb-2">💼 Opportunities</p>
        <div className="space-y-2">
          <div className="p-2 bg-white rounded border border-purple-200">
            <p className="text-sm font-medium text-purple-800">Volunteer: Community Garden Project</p>
            <p className="text-xs text-purple-700">Help establish urban farming initiatives</p>
          </div>
          <div className="p-2 bg-white rounded border border-purple-200">
            <p className="text-sm font-medium text-purple-800">Survey: Consumer Preferences</p>
            <p className="text-xs text-purple-700">Share your insights on sustainable products</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 🔔 NOTIFICATIONS CENTER - Stay updated with platform activities
export const NotificationsCenterWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-red-800">
        <Bell className="h-5 w-5 mr-2 text-red-600" />
        Notifications
      </CardTitle>
      <p className="text-sm text-red-600 font-normal">Stay updated with important updates</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Recent Notifications */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-red-200">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">New Feature: Enhanced Marketplace</p>
              <p className="text-xs text-red-700">Discover improved buying and selling tools</p>
              <p className="text-xs text-red-600 mt-1">2 hours ago</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Community Achievement</p>
              <p className="text-xs text-red-700">Congratulations on your 50th helpful post!</p>
              <p className="text-xs text-red-600 mt-1">1 day ago</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Weekly Digest</p>
              <p className="text-xs text-red-700">Your personalized agriculture insights</p>
              <p className="text-xs text-red-600 mt-1">3 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="pt-3 border-t border-red-200">
        <Link href="/settings">
          <Button variant="outline" className="w-full bg-white hover:bg-red-50 border-red-200">
            <Bell className="h-4 w-4 mr-2" />
            Manage Notification Preferences
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

// 🌟 IMPACT DASHBOARD - Personal contribution tracking
export const ImpactDashboardWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-teal-800">
        <Star className="h-5 w-5 mr-2 text-teal-600" />
        Your Impact
      </CardTitle>
      <p className="text-sm text-teal-600 font-normal">Track your contributions to sustainable agriculture</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Impact Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white rounded-lg border border-teal-200">
          <div className="text-2xl font-bold text-green-600">47</div>
          <div className="text-xs text-teal-700">Discussions Started</div>
          <div className="text-xs text-green-600 mt-1">Helped 200+ people</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-teal-200">
          <div className="text-2xl font-bold text-blue-600">23</div>
          <div className="text-xs text-teal-700">Resources Shared</div>
          <div className="text-xs text-blue-600 mt-1">Knowledge contributions</div>
        </div>
      </div>

      {/* Contribution Areas */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-teal-800"><Heart className="h-4 w-4 inline mr-1" /> Your Contributions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
            <span className="text-sm text-teal-800">Community Support</span>
            <div className="flex items-center space-x-1">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="text-xs text-green-600 font-semibold">High</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
            <span className="text-sm text-teal-800">Knowledge Sharing</span>
            <div className="flex items-center space-x-1">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <span className="text-xs text-blue-600 font-semibold">Good</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
            <span className="text-sm text-teal-800">Event Participation</span>
            <div className="flex items-center space-x-1">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <span className="text-xs text-purple-600 font-semibold">Moderate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="pt-3 border-t border-teal-200">
        <p className="text-sm font-medium text-teal-800 mb-2">🎯 Ways to Increase Impact</p>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-teal-700">Join a local farming community</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-teal-700">Share your expertise in forums</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Star className="h-4 w-4 text-blue-600" />
            <span className="text-teal-700">Participate in upcoming events</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);