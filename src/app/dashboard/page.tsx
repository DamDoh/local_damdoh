
"use client";

import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase'; // Ensure you have this export in your firebase config
import { Card, CardContent } from "@/components/ui/card";
import type { FeedItem, UserProfile } from '@/lib/types';
import { StartPost } from '@/components/dashboard/StartPost';
import { FeedItemCard } from "@/components/dashboard/FeedItemCard";
import { DashboardLeftSidebar } from '@/components/dashboard/DashboardLeftSidebar';
import { DashboardRightSidebar } from '@/components/dashboard/DashboardRightSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-utils';
import { doc, getDoc, getFirestore } from 'firebase/firestore';


// Helper function to fetch user profiles
// In a real-world scenario, this might be batched or cached for efficiency
const fetchUserProfiles = async (userIds: string[]) => {
    const db = getFirestore(firebaseApp);
    const userProfiles: Record<string, UserProfile> = {};
    for (const userId of userIds) {
        if (!userProfiles[userId]) { // Avoid duplicate fetches
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await userDocRef.get();
            if (userDoc.exists()) {
                userProfiles[userId] = userDoc.data() as UserProfile;
            } else {
                 // Fallback for users not in the 'users' collection
                userProfiles[userId] = { id: userId, name: "Unknown User", headline: "DamDoh Member", avatarUrl: "" };
            }
        }
    }
    return userProfiles;
};


export default function DashboardPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const { user } = useAuth(); // Get the current authenticated user

  useEffect(() => {
    const functions = getFunctions(firebaseApp);
    const getFeed = httpsCallable(functions, 'getFeed');

    const fetchFeedData = async () => {
      setIsLoadingFeed(true);
      try {
        const result = await getFeed();
        const posts = (result.data as any).posts as any[];

        if (posts.length > 0) {
            // Get unique user IDs from the posts
            const userIds = [...new Set(posts.map(post => post.userId))];
            const profiles = await fetchUserProfiles(userIds);
            
            // Map posts to FeedItem type, enriching them with user data
            const enrichedFeed: FeedItem[] = posts.map(post => ({
                id: post.id,
                content: post.content,
                timestamp: post.createdAt.toDate().toISOString(), // Convert Firestore timestamp
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
        console.error("Error fetching feed:", error);
        // TODO: Show a toast message to the user
      } finally {
        setIsLoadingFeed(false);
      }
    };

    fetchFeedData();
  }, []);

  const handleCreatePost = async (content: string, media?: File, pollOptions?: { text: string }[]) => {
    if (!user) {
        console.error("User must be logged in to post.");
        // TODO: Show a toast message
        return;
    }
      
    const functions = getFunctions(firebaseApp);
    const createPost = httpsCallable(functions, 'createPost');

    // Note: Media file upload to Firebase Storage should happen here.
    // For now, we'll pass a placeholder URL.
    let mediaUrl: string | undefined = undefined;
    if (media) {
        console.log("Simulating media upload for:", media.name);
        // In a real app: mediaUrl = await uploadFileAndGetURL(media);
        mediaUrl = "https://placehold.co/800x450.png"; // Placeholder
    }
    
    try {
        await createPost({ content, mediaUrl, pollOptions });
        // Optimistically update the UI while the feed re-fetches or a real-time listener updates it.
        const newPost: FeedItem = {
          id: `new-post-${Math.random()}`,
          user: {
            id: user.uid,
            name: user.displayName || "You",
            avatarUrl: user.photoURL || "",
            headline: "Just now"
          },
          timestamp: new Date().toISOString(),
          content,
          likes: 0,
          comments: 0,
          media: mediaUrl ? { url: mediaUrl, type: 'image' } : undefined,
          pollOptions: pollOptions?.map((opt, i) => ({id: `${i}`, ...opt, votes: 0}))
        };
        setFeedItems(prevItems => [newPost, ...prevItems]);
    } catch (error) {
        console.error("Error creating post:", error);
        // TODO: Show a toast message
    }
  };
  
  const handleLikePost = async (postId: string) => {
    const functions = getFunctions(firebaseApp);
    const likePostCallable = httpsCallable(functions, 'likePost');

    // Optimistic UI update
    setFeedItems(prevItems =>
      prevItems.map(item =>
        item.id === postId 
        ? { ...item, likes: item.likes + 1 } // Simplified optimistic update
        : item
      )
    );

    try {
        await likePostCallable({ postId });
        // The backend handles the logic. We might want to re-fetch to get the exact count
        // if multiple users are liking simultaneously, but for now this is fine.
    } catch(error) {
        console.error("Error liking post:", error);
        // Revert optimistic update on error
        setFeedItems(prevItems =>
          prevItems.map(item =>
            item.id === postId 
            ? { ...item, likes: item.likes - 1 }
            : item
          )
        );
    }
  };
  
  // Placeholder for comment handling
  const handleCommentOnPost = (postId: string, comment: string) => {
     console.log(`Commenting on post ${postId}: ${comment}`);
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
