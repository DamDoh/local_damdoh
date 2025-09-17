
"use client";

import React, { Suspense } from 'react';
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
import { FarmerDashboard } from './hubs/FarmerDashboard';
import { StartPost } from './StartPost';
import { apiCall } from '@/lib/api-utils';


const { useState, useEffect, useMemo } = React;


function MainContent() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  
  const { toast } = useToast();
  const { profile, loading: authLoading } = useUserProfile();
  const t = useTranslations('MainDashboard');
  const { user } = useAuth();
  
  // Polling for feed items
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchFeedItems = async () => {
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
    };

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
  }, [user, authLoading, toast, t]);


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
    
    if (profile?.primaryRole === 'Farmer') {
        return <FarmerDashboard />;
    }
  
    // Default Fallback: Social Feed for other roles
    if (isLoadingFeed) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      );
    }
    
    return feedItems && feedItems.length > 0 ? (
      feedItems.map(item => (
        <FeedItemCard 
          key={item.id} 
          item={item} 
          onDeletePost={handleDeletePost}
        />
      ))
    ) : (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center py-10">{t('noActivity')}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
        {user && <StartPost onCreatePost={handleCreatePost} />}
        {renderContent()}
    </div>
  );
}


export function MainDashboard() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MainContent />
    </Suspense>
  );
}
