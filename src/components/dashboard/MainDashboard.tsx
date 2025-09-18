
"use client";

import React, { Suspense, lazy, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { FeedItem } from "@/lib/types";
import { PageSkeleton } from '@/components/Skeletons';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-utils";
import { useToast } from '@/hooks/use-toast';
import { FeedItemCard } from '@/components/dashboard/FeedItemCard';
import { uploadFileAndGetURL } from '@/lib/storage-utils';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';
import { Link } from '@/navigation';
import { Edit } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
// Use StakeholderDashboard for all roles to ensure consistent layout
import { StakeholderDashboard } from './hubs/StakeholderDashboard';
import { stakeholderConfigs } from '@/lib/stakeholder-configs';
import { StartPost } from './StartPost';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { apiCall } from '@/lib/api-utils';


const { useState, useMemo, useCallback, useRef } = React;


function MainContent() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  // Performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log slow dashboard loads (> 1 second)
          if (entry.duration > 1000) {
            console.warn('Slow dashboard load detected:', {
              component: 'MainDashboard',
              duration: entry.duration,
              type: entry.entryType
            });
          }
        }
      });

      observer.observe({ entryTypes: ['measure'] });

      // Mark dashboard load start
      performance.mark('dashboard-load-start');

      return () => {
        // Mark dashboard load end and measure
        performance.mark('dashboard-load-end');
        performance.measure('dashboard-load', 'dashboard-load-start', 'dashboard-load-end');
        observer.disconnect();
      };
    }
  }, []);

  const { toast } = useToast();
  const { profile, loading: authLoading } = useUserProfile();
  const t = useTranslations('MainDashboard');
  const { user: rawUser } = useAuth();
  const user = useMemo(() => rawUser, [rawUser?.id, rawUser?.email]); // Memoize user based on id and email
  
  const fetchFeedItems = useCallback(async () => {
    if (user) {
      setIsLoadingFeed(true);
      try {
        // Fetch feed items using our new API
        const posts = await apiCall('/community/feed');
        setFeedItems(posts as FeedItem[]);
      } catch (error) {
        console.error("Error fetching feed:", error);
        toast({
            title: t('feedError.title'),
            description: t('feedError.description'),
            variant: "destructive"
        });
      } finally {
        setIsLoadingFeed(false);
      }
    } else if (!authLoading) {
        setIsLoadingFeed(false);
    }
  }, [user, authLoading]);

  // Polling for feed items
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Initial fetch
    fetchFeedItems();

    // Set up polling interval
    if (user) {
      intervalId = setInterval(fetchFeedItems, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, fetchFeedItems]);


  const handleCreatePost = async (content: string, media?: File, pollData?: { text: string }[]) => {
    if (!user) {
      toast({ title: t('postError.auth'), variant: "destructive" });
      return;
    }
    
    try {
      let imageUrl: string | undefined = undefined;
      let dataAiHint: string | undefined = undefined;
      if (media) {
        toast({ title: t('uploadingMedia') });
        imageUrl = await uploadFileAndGetURL(media, `feed-posts/${user.id}`);
        toast({ title: t('uploadComplete') });
      }

      // Create post using our new API
      await apiCall('/community/create-post', {
        method: 'POST',
        body: JSON.stringify({ content, pollOptions: pollData, imageUrl, dataAiHint }),
      });
      toast({ title: t('postSuccess.title'), description: t('postSuccess.description') });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: t('postError.fail'), variant: "destructive" });
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    if (!user) {
        toast({ title: t('deleteError.auth'), variant: "destructive" });
        return;
    }

    try {
        // Delete post using our new API
        await apiCall('/community/delete-post', {
            method: 'POST',
            body: JSON.stringify({ postId }),
        });
        toast({ title: t('deleteSuccess.title'), description: t('deleteSuccess.description') });
    } catch (error) {
        console.error("Error deleting post:", error);
        toast({ title: t('deleteError.fail'), variant: "destructive" });
    }
  };

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      );
    }

    const isProfileIncomplete = profile && (!profile.profileSummary || profile.profileSummary.includes("Just joined") || !profile.location);

    if (isProfileIncomplete) {
        return (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>{t('profileCompletion.title')}</CardTitle>
                    <CardDescription>{t('profileCompletion.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/profiles/me/edit">
                            <Edit className="mr-2 h-4 w-4" />
                            {t('profileCompletion.button')}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Get the appropriate dashboard for the user's role
    const userRole = profile?.primaryRole || 'General';

    // Use StakeholderDashboard with appropriate layout for all roles to ensure consistent social media-style layout
    const config = stakeholderConfigs[userRole] || stakeholderConfigs['General'];
    return <StakeholderDashboard config={config} />;
  };

  return (
    <div className="space-y-6">
        <OfflineIndicator />
        {user && <StartPost onCreatePost={handleCreatePost} />}
        {renderContent()}
    </div>
  );
}


const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  </div>
);

export function MainDashboard() {
  return <MainContent />;
}
