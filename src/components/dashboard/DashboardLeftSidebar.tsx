
"use client"; 

import { Link } from '@/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-utils";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";
import { useTranslations } from 'next-intl';
import { Eye, ThumbsUp, GitBranch, ShoppingCart, CircleDollarSign, MessageSquare } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatDistanceToNow } from 'date-fns';

const activityIconMap: Record<string, React.ElementType> = {
    MessageSquare,
    ShoppingCart,
    CircleDollarSign,
    GitBranch,
};

interface EngagementStats {
    profileViews: number;
    postLikes: number;
    postComments: number;
}

interface Activity {
    id: string;
    type: string;
    title: string;
    timestamp: string;
    icon: string;
}

export function DashboardLeftSidebar() {
  const t = useTranslations('DashboardLeftSidebar');
  const tActivity = useTranslations('activity');
  const { profile, loading: authLoading } = useUserProfile();
  
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStatsCallable = useMemo(() => httpsCallable(functions, 'activity-getUserEngagementStats'), [functions]);
  const getActivityCallable = useMemo(() => httpsCallable(functions, 'activity-getUserActivity'), [functions]);

  useEffect(() => {
    if (profile?.id) { 
        setIsLoading(true);
        Promise.all([
            getStatsCallable({ userId: profile.id }),
            getActivityCallable({ userId: profile.id })
        ]).then(([statsResult, activityResult]) => {
            setStats(statsResult.data as EngagementStats);
            setActivity((activityResult.data as any).activities || []);
        }).catch(error => {
            console.error("Error fetching sidebar data:", error);
            setStats({ profileViews: 0, postLikes: 0, postComments: 0 }); 
            setActivity([]);
        }).finally(() => {
            setIsLoading(false);
        });
    } else if (!authLoading) {
        setIsLoading(false);
        setStats({ profileViews: 0, postLikes: 0, postComments: 0 }); 
        setActivity([]);
    }
  }, [profile, authLoading, getStatsCallable, getActivityCallable]); 


  if (authLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Skeleton className="h-20 w-20 rounded-full mx-auto mb-2" />
            <Skeleton className="h-5 w-3/4 mx-auto mb-1" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardContent>
          <hr/>
          <CardContent className="text-xs space-y-2 py-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const totalEngagements = (stats?.postLikes || 0) + (stats?.postComments || 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 text-center">
          <Link href="/profiles/me">
            <Avatar className="h-20 w-20 mx-auto mb-2 border-2 border-primary cursor-pointer">
              <AvatarImage src={profile?.avatarUrl ?? undefined} alt={profile?.displayName} data-ai-hint="profile agriculture" />
              <AvatarFallback>{profile?.displayName?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Link>
          <Link href="/profiles/me">
            <h3 className="text-lg font-semibold hover:underline">{profile?.displayName || 'Your Name'}</h3>
          </Link>
          <p className="text-xs text-muted-foreground px-2">{profile?.profileSummary || 'Your Headline'}</p>
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
                <div className="flex justify-between items-center p-1 rounded-sm hover:bg-accent cursor-pointer">
                    <span className="flex items-center gap-2"><Eye className="h-4 w-4"/>{t('profileViewers')}</span>
                    <span className="text-primary font-semibold">{stats?.profileViews ?? 0}</span>
                </div>
                <div className="flex justify-between items-center p-1 rounded-sm hover:bg-accent cursor-pointer">
                    <span className="flex items-center gap-2"><ThumbsUp className="h-4 w-4"/>{t('postEngagements')}</span>
                    <span className="text-primary font-semibold">{totalEngagements}</span>
                </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle className="text-base">{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full"/>
                    <Skeleton className="h-10 w-full"/>
                </div>
            ) : activity.length > 0 ? (
                <ul className="space-y-3">
                    {activity.slice(0, 3).map(act => {
                        const Icon = activityIconMap[act.icon] || GitBranch;
                        return (
                        <li key={act.id} className="flex items-start gap-2 text-xs">
                            <Icon className="h-4 w-4 mt-0.5 text-muted-foreground"/>
                            <div>
                                <p className="font-medium text-muted-foreground">{tActivity(act.type, {defaultMessage: act.type})}</p>
                                <p className="text-foreground line-clamp-1">{act.title}</p>
                            </div>
                        </li>
                        )
                    })}
                </ul>
            ) : (
                <p className="text-xs text-muted-foreground text-center">{t('noActivity')}</p>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
