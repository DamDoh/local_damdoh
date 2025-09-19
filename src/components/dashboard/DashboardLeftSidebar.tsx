
"use client";

import { Link } from '@/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-utils";
import { useTranslations } from 'next-intl';
import {
  Eye,
  ThumbsUp,
  MapPin,
  CheckCircle,
  User,
  BarChart3,
  Clock,
  AlertTriangle,
  AlertCircle,
  Activity,
  Users,
  TrendingUp,
  Wifi,
  Sprout,
  BookOpen
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { apiCall } from '@/lib/api-utils';

interface EngagementStats {
    profileViews: number;
    postLikes: number;
    postComments: number;
}

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    timestamp: string;
    priority: 'high' | 'medium' | 'low';
}

interface PerformanceMetrics {
    farmSize: number;
    successRate: number;
    network: number;
}

export function DashboardLeftSidebar() {
  const t = useTranslations('DashboardLeftSidebar');
  const { profile, loading: authLoading } = useUserProfile();

  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
        setIsLoading(true);
        // Fetch engagement stats
        apiCall<EngagementStats>('/dashboard/engagement-stats', {
            method: 'GET',
        })
        .then((statsResult) => {
            setStats(statsResult);
        }).catch((error: any) => {
            console.error("Error fetching sidebar data:", error);
            setStats({ profileViews: 0, postLikes: 0, postComments: 0 });
        });

        // Mock performance metrics - in real app, this would come from API
        setMetrics({
            farmSize: 8.5,
            successRate: 95,
            network: 47
        });

        // Mock recent activities - in real app, this would come from API
        setActivities([
            {
                id: '1',
                type: 'inspection',
                title: 'Field inspection completion for maize crop',
                timestamp: '2h ago',
                priority: 'high'
            },
            {
                id: '2',
                type: 'loan',
                title: 'Loan application submission to AgriFinance',
                timestamp: '4h ago',
                priority: 'medium'
            }
        ]);

        setIsLoading(false);
    } else if (!authLoading) {
        setIsLoading(false);
        setStats({ profileViews: 0, postLikes: 0, postComments: 0 });
        setMetrics({ farmSize: 0, successRate: 0, network: 0 });
        setActivities([]);
    }
  }, [profile, authLoading]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
        case 'high':
            return <AlertTriangle className="h-3 w-3 text-red-500" />;
        case 'medium':
            return <AlertCircle className="h-3 w-3 text-orange-500" />;
        default:
            return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6 text-center">
            <Skeleton className="h-20 w-20 rounded-full mx-auto mb-2" />
            <Skeleton className="h-5 w-3/4 mx-auto mb-1" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="pt-6 text-center">
          <div className="relative inline-block mb-4">
            <Link href="/profiles/me">
              <Avatar className="h-20 w-20 mx-auto border-4 border-white cursor-pointer">
                <AvatarImage src={profile?.avatarUrl ?? undefined} alt={profile?.displayName} data-ai-hint="profile agriculture" />
                <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                  {profile?.displayName?.substring(0, 2).toUpperCase() || 'JK'}
                </AvatarFallback>
              </Avatar>
            </Link>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <div className="mb-2">
            <Link href="/profiles/me">
              <h3 className="text-lg font-bold hover:underline flex items-center justify-center gap-2">
                {profile?.displayName || 'John Kimani'}
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                  Verified ✓
                </Badge>
              </h3>
            </Link>
          </div>

          <p className="text-sm text-green-600 font-medium mb-2">
            Farmer (Individual/Smallholder)
          </p>

          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4" />
            <span>Nairobi, Kenya</span>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Metrics */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Performance Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Farm Size</span>
              <span className="text-sm font-semibold text-gray-900">{metrics?.farmSize ?? 0} ha</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-semibold text-green-600">{metrics?.successRate ?? 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Network</span>
              <span className="text-sm font-semibold text-gray-900">{metrics?.network ?? 0} connections</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Navigation</h4>
          <div className="space-y-2">
            <Link href="/profiles/me" className="flex items-center gap-3 p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">About Me</span>
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Analytics</span>
            </Link>
            <Link href="/farm-operations" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">Daily Operations</span>
            </Link>
            <Link href="/emergency-alerts" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-gray-700">Emergency Alerts</span>
            </Link>
            <Link href="/connectivity" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Wifi className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-700">Connectivity</span>
            </Link>
            <Link href="/crop-growth" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Sprout className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">Crop Monitor</span>
            </Link>
            <Link href="/storytelling" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span className="text-sm text-gray-700">Stories</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  {getPriorityIcon(activity.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-tight">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tracking */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-900">Performance Tracking</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                Active
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Ongoing farm operations and metrics tracking active
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Activity className="h-3 w-3" />
              <span>Last updated: 5 min ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
