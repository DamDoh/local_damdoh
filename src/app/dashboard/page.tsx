
"use client";

import { useState, useEffect } from 'react';
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

// Helper function to fetch user profiles, with caching to prevent re-fetching
const userProfileCache: Record<string, UserProfile> = {};
const fetchUserProfiles = async (userIds: string[]) => {
    const db = getFirestore(firebaseApp);
    const userProfiles: Record<string, UserProfile> = {};
    const usersToFetch = userIds.filter(id => !userProfileCache[id]);

    if (usersToFetch.length > 0) {
        for (const userId of usersToFetch) {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await userDocRef.get();
            if (userDoc.exists()) {
                userProfileCache[userId] = userDoc.data() as UserProfile;
            } else {
                userProfileCache[userId] = { id: userId, name: "Unknown User", headline: "DamDoh Member", avatarUrl: "" };
            }
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

  // ==============================================================
  // REAL-TIME DATA FETCHING FOR THE FEED
  // ==============================================================
  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const posts: Post[] = [];
      querySnapshot.forEach((doc) => {
        // Basic filtering for moderation
        const data = doc.data();
        if (data.moderation?.status !== 'rejected') {
            posts.push({ id: doc.id, ...data } as Post);
        }
      });
      
      if (posts.length > 0) {
        const userIds = [...new Set(posts.map(post => post.userId))];
        const profiles = await fetchUserProfiles(userIds);

        const enrichedFeed: FeedItem[] = posts.map(post => ({
          id: post.id,
          content: post.content,
          timestamp: post.createdAt?.toDate().toISOString() || new Date().toISOString(),
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
          moderation: post.moderation
        }));
        setFeedItems(enrichedFeed);
      } else {
        setFeedItems([]);
      }
      setIsLoadingFeed(false);
    }, (error) => {
      console.error("Error listening to feed:", error);
      setIsLoadingFeed(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (content: string, media?: File, pollOptions?: { text: string }[]) => {
    if (!user) return;
      
    const functions = getFunctions(firebaseApp);
    const createPost = httpsCallable(functions, 'createPost');

    let mediaUrl: string | undefined = undefined;
    if (media) {
      mediaUrl = "https://placehold.co/800x450.png"; // Placeholder for upload
    }
    
    try {
      await createPost({ content, mediaUrl, pollOptions });
      // UI will update automatically via the onSnapshot listener
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };
  
  const handleLikePost = async (postId: string) => {
    const functions = getFunctions(firebaseApp);
    const likePostCallable = httpsCallable(functions, 'likePost');
    try {
      await likePostCallable({ postId });
      // UI will update automatically via the onSnapshot listener's likeCount update
    } catch(error) {
      console.error("Error liking post:", error);
    }
  };
  
  const handleCommentOnPost = async (postId: string, comment: string) => {
    const functions = getFunctions(firebaseApp);
    const addCommentCallable = httpsCallable(functions, 'addComment');
     try {
        await addCommentCallable({ postId, content: comment });
        // UI will update automatically via the onSnapshot listener's commentCount update
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
            item.moderation?.status !== 'pending_review' && (
                <FeedItemCard 
                  key={item.id} 
                  item={item} 
                  onLike={handleLikePost}
                  onComment={handleCommentOnPost}
                />
            )
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>The feed is empty.</p>
              <p className="text-sm">Be the first to share something with the community!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <DashboardRightSidebar />
      
    </div>
  );
}
