
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FeedItem } from "@/lib/types";
import { DashboardLeftSidebar } from "@/components/dashboard/DashboardLeftSidebar";
import { DashboardRightSidebar } from "@/components/dashboard/DashboardRightSidebar";
import { StartPost } from "@/components/dashboard/StartPost";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/lib/auth-utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { FeedItemCard } from '@/components/dashboard/FeedItemCard';

export default function DashboardPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const { homepagePreference, isPreferenceLoading } = useHomepagePreference();

  const { toast } = useToast();
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);

  const getFeed = httpsCallable(functions, 'getFeed');
  const createPostCallable = httpsCallable(functions, 'createFeedPost');
  const likePostCallable = httpsCallable(functions, 'likePost');
  const addCommentCallable = httpsCallable(functions, 'addComment');

  const fetchPersonalizedFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const result = await getFeed({});
      setFeedItems((result.data as any).posts || []);
    } catch (error) {
      console.error("Error fetching feed:", error);
      toast({
        title: "Could not load feed",
        description: "There was an error fetching the latest posts.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (!isPreferenceLoading && homepagePreference && homepagePreference !== pathname && pathname === '/') {
      router.replace(homepagePreference);
    }
  }, [homepagePreference, isPreferenceLoading, pathname, router]);

  useEffect(() => {
    fetchPersonalizedFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePost = async (content: string, media?: File, pollData?: { text: string }[]) => {
    try {
      await createPostCallable({ content, pollOptions: pollData });
      toast({ title: "Post Created!", description: "Your post is now live." });
      fetchPersonalizedFeed(); // Refresh the feed to show the new post
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Failed to create post", variant: "destructive" });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await likePostCallable({ postId });
      // The local state update is now handled inside FeedItemCard for optimistic UI
    } catch(error) {
      console.error("Error liking post:", error);
      toast({ title: "Failed to like post", variant: "destructive" });
    }
  };
  
  const handleCommentOnPost = async (postId: string, commentText: string) => {
     try {
        await addCommentCallable({ postId, content: commentText });
        toast({ title: "Comment added!" });
        // The optimistic update is handled in the FeedItemCard
     } catch(error) {
         console.error("Error adding comment:", error);
         toast({ title: "Failed to add comment", variant: "destructive" });
     }
  };

  const handleDeletePost = (postId: string) => {
    setFeedItems(prevItems => prevItems.filter(item => item.id !== postId));
     toast({ title: "Post Deleted (Simulated)" });
  };

  if (isPreferenceLoading || (homepagePreference && homepagePreference !== "/" && pathname === "/")) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height,80px)-var(--bottom-nav-height,64px))]"><p>Loading...</p></div>;
  }

  return (
    <div className="hidden md:grid md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-3">
        <DashboardLeftSidebar />
      </div>
      <div className="md:col-span-6 space-y-6">
        <StartPost onCreatePost={handleCreatePost} />
        <div className="flex items-center gap-2">
          <hr className="flex-grow"/>
          <span className="text-xs text-muted-foreground">Sort by: Top <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></Button></span>
        </div>
        {isLoadingFeed ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
        ) : feedItems.length > 0 ? (
          feedItems.map(item => (
            <FeedItemCard 
              key={item.id} 
              item={item} 
              onDeletePost={handleDeletePost}
              onLike={handleLikePost}
              onComment={handleCommentOnPost}
            />
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center py-10">No activity yet. Share your agricultural insights or explore the network!</p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="md:col-span-3">
        <DashboardRightSidebar />
      </div>
    </div>
  );
}
