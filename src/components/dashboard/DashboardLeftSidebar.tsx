
"use client";

import { Link } from '@/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-utils";
import { useTranslations } from 'next-intl';
import { Eye, ThumbsUp, GitBranch, ShoppingCart, CircleDollarSign, MessageSquare } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { apiCall } from '@/lib/api-utils';

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
  const { profile, loading: authLoading } = useUserProfile();
  
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
        setIsLoading(true);
        apiCall<EngagementStats>('/dashboard/engagement-stats', {
            method: 'GET',
        })
        .then((statsResult) => {
            setStats(statsResult);
        }).catch((error: any) => {
            console.error("Error fetching sidebar data:", error);
            setStats({ profileViews: 0, postLikes: 0, postComments: 0 });
        }).finally(() => {
            setIsLoading(false);
        });
    } else if (!authLoading) {
        setIsLoading(false);
        setStats({ profileViews: 0, postLikes: 0, postComments: 0 });
    }
  }, [profile, authLoading]);


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
    </div>
  );
}
