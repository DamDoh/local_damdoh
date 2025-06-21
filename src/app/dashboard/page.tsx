
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Card, CardContent } from "@/components/ui/card";
import type { FeedItem, UserProfile, Post } from '@/lib/types';
import { StartPost } from '@/components/dashboard/StartPost';
import { FeedItemCard } from "@/components/dashboard/FeedItemCard";
import { DashboardLeftSidebar } from '@/components/dashboard/DashboardLeftSidebar';
import { DashboardRightSidebar } from '@/components/dashboard/DashboardRightSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-utils';
import { collection, query, orderBy, limit, onSnapshot, getFirestore, doc, getDoc } from 'firebase/firestore';

// Helper function to fetch user profiles, with caching
const userProfileCache: Record<string, UserProfile> = {};
const fetchUserProfiles = async (userIds: string[]) => {
    const db = getFirestore(firebaseApp);
    const userProfiles: Record<string, UserProfile> = {};
    const usersToFetch = userIds.filter(id => !userProfileCache[id]);

    if (usersToFetch.length > 0) {
        for (const userId of usersToFetch) {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await userDocRef.get();
            userProfileCache[userId] = userDoc.exists() 
                ? (userDoc.data() as UserProfile)
                : { id: userId, name: "Unknown User", headline: "DamDoh Member", avatarUrl: "" };
        }
    }
    userIds.forEach(id => {
        userProfiles[id] = userProfileCache[id];
    });
    return userProfiles;
};

export default function DashboardPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const { user } = useAuth();
  const functions = getFunctions(firebaseApp);

  // Memoize the callable functions
  const getFeed = useMemo(() => httpsCallable(functions, 'getFeed'), [functions]);
  const createPostCallable = useMemo(() => httpsCallable(functions, 'createPost'), [functions]);
  const likePostCallable = useMemo(() => httpsCallable(functions, 'likePost'), [functions]);
  const addCommentCallable = useMemo(() => httpsCallable(functions, 'addComment'), [functions]);


  useEffect(() => {
    const fetchPersonalizedFeed = async () => {
        setIsLoadingFeed(true);
        try {
            // In a real app, user interests would be fetched from their profile
            const userContext = { interests: ['maize', 'fertilizer', 'weather'] };
            const result = await getFeed(userContext);
            const posts = (result.data as any).posts as any[];

            if (posts.length > 0) {
                const userIds = [...new Set(posts.map(post => post.userId))];
                const profiles = await fetchUserProfiles(userIds);
                
                const enrichedFeed: FeedItem[] = posts.map(post => ({
                    id: post.id,
                    content: post.content,
                    timestamp: post.createdAt.toDate().toISOString(),
                    user: {
                        id: post.userId,
                        name: profiles[post.userId]?.name || "Unknown User",
                        headline: profiles[post.userId]?.headline || "DamDoh Member",
                        avatarUrl: profiles[post.userId]?.avatarUrl || ""
                    },
                    likes: post.likeCount,
                    comments: post.commentCount,
                    media: post.mediaUrl ? { url: post.mediaUrl, type: post.mediaType } : undefined,
                    pollOptions: post.pollOptions,
                }));
                setFeedItems(enrichedFeed);
            } else {
                setFeedItems([]);
            }
        } catch (error) {
            console.error("Error fetching personalized feed:", error);
        } finally {
            setIsLoadingFeed(false);
        }
    };
    
    // Instead of a realtime listener, we now fetch a personalized feed.
    // A more advanced implementation might combine personalization with a realtime subscription.
    fetchPersonalizedFeed();

  }, [user, getFeed]);

  const handleCreatePost = async (content: string, media?: File, pollOptions?: { text: string }[]) => {
    if (!user) return;
    
    let mediaUrl: string | undefined = undefined;
    if (media) {
      mediaUrl = "https://placehold.co/800x450.png";
    }
    
    try {
      await createPostCallable({ content, mediaUrl, pollOptions });
      // Here, you might trigger a re-fetch of the personalized feed
      // Or optimistically add the post to the top of the feed.
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };
  
  const handleLikePost = async (postId: string) => {
    try {
      await likePostCallable({ postId });
      // Optimistic update for immediate feedback
      setFeedItems(prevItems => prevItems.map(item => 
        item.id === postId ? { ...item, likes: item.likes + 1 } : item
      ));
    } catch(error) {
      console.error("Error liking post:", error);
    }
  };
  
  const handleCommentOnPost = async (postId: string, comment: string) => {
     try {
        await addCommentCallable({ postId, content: comment });
        setFeedItems(prevItems => prevItems.map(item => 
            item.id === postId ? { ...item, comments: item.comments + 1 } : item
        ));
     } catch(error) {
         console.error("Error adding comment:", error);
     }
  };


  return (
    <div className="grid md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_300px] xl:grid-cols-[280px_1fr_320px] items-start gap-6 p-4 md:p-6 max-w-screen-2xl mx-auto w-full">
      
      <DashboardLeftSidebar />

      <div className="grid gap-6">
        <StartPost onCreatePost={handleCreatePost} />

        {isLoadingFeed ? (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
        ) : feedItems.length > 0 ? (
          feedItems.map((item) => (
            <FeedItemCard 
              key={item.id} 
              item={item} 
              onLike={handleLikePost}
              onComment={handleCommentOnPost}
            />
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No posts in your feed right now.</p>
              <p className="text-sm">Check back later or create a post to get the conversation started!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <DashboardRightSidebar />
      
    </div>
  );
}
