
"use client"; 

import { Link } from '@/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-utils";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";
import { useTranslations } from 'next-intl';

export function DashboardLeftSidebar() {
  const t = useTranslations('DashboardLeftSidebar');
  const { profile, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState<{ profileViews: number, postLikes: number, postComments: number } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const getStatsCallable = useMemo(() => httpsCallable(functions, 'activity-getUserEngagementStats'), [functions]);

  useEffect(() => {
    if (profile?.id) { 
        getStatsCallable({ userId: profile.id })
            .then(result => {
                setStats(result.data as any);
            })
            .catch(error => {
                console.error("Error fetching stats:", error);
                setStats({ profileViews: 0, postLikes: 0, postComments: 0 }); 
            })
            .finally(() => {
                setIsLoadingStats(false);
            });
    } else if (!authLoading) {
        setIsLoadingStats(false);
        setStats({ profileViews: 0, postLikes: 0, postComments: 0 }); 
    }
  }, [profile, authLoading, getStatsCallable]); 


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
          <p className="text-xs text-muted-foreground mt-1">{profile?.location?.address || 'Your Location'}</p>
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs space-y-1">
          {isLoadingStats ? (
            <div className="space-y-2 p-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
                <div className="flex justify-between items-center p-1 rounded-sm">
                    <span>{t('profileViewers')}</span>
                    <span className="text-primary font-semibold">{stats?.profileViews ?? 0}</span>
                </div>
                <div className="flex justify-between items-center p-1 rounded-sm">
                    <span>{t('postEngagements')}</span>
                    <span className="text-primary font-semibold">{totalEngagements}</span>
                </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
