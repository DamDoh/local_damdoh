
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Card, CardContent } from "@/components/ui/card";
import type { FeedItem, UserProfile } from '@/lib/types';
import { StartPost } from '@/components/dashboard/StartPost';
import { FeedItemCard } from "@/components/dashboard/FeedItemCard";
import { DashboardLeftSidebar } from '@/components/dashboard/DashboardLeftSidebar';
import { DashboardRightSidebar } from '@/components/dashboard/DashboardRightSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-utils';
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';

// Placeholder imports for role-based hubs
import FarmerHub from '@/components/dashboard/hubs/FarmerHub';
import BuyerHub from '@/components/dashboard/hubs/BuyerHub';
import LogisticsHub from '@/components/dashboard/hubs/LogisticsHub';
// Add imports for other roles as needed

export default function DashboardPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const functions = getFunctions(firebaseApp);
  const db = getFirestore(firebaseApp);

  // Memoize the callable functions
  const getFeed = useMemo(() => httpsCallable(functions, 'getFeed'), [functions]);
  const createPostCallable = useMemo(() => httpsCallable(functions, 'createFeedPost'), [functions]);
  const likePostCallable = useMemo(() => httpsCallable(functions, 'likePost'), [functions]);
  const addCommentCallable = useMemo(() => httpsCallable(functions, 'addComment'), [functions]);

  // Effect to fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setIsLoadingRole(false);
        return;
      }
      setIsLoadingRole(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        setUserRole(userDoc.data()?.role || 'general'); // Assume 'general' if role is not set
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole('general'); // Fallback role
      } finally {
        setIsLoadingRole(false);
      }
    };
    fetchUserRole();
  }, [user, db]);

  // Effect to fetch the feed
  useEffect(() => {
    const fetchPersonalizedFeed = async () => {
        setIsLoadingFeed(true);
        try {
            // In a real app, user interests would be fetched from their profile
            const userContext = { interests: ['maize', 'fertilizer', 'weather'] };
            const result = await getFeed(userContext);
            const posts = (result.data as any).posts as FeedItem[];
            setFeedItems(posts || []);
        } catch (error) {
            console.error("Error fetching personalized feed:", error);
            toast({
              title: "Could not load feed",
              description: "There was an error fetching the latest posts. Please try again later.",
              variant: "destructive"
            });
        } finally {
            setIsLoadingFeed(false);
        }
    };
    
    // We only fetch the feed once on component mount.
    // For real-time updates without a full listener, a "refresh" button could be added.
    fetchPersonalizedFeed();

  }, [getFeed, toast]);

  const handleCreatePost = async (content: string, media?: File, pollOptions?: { text: string }[]) => {
    if (!user) return;
    
    // In a real app, we'd upload the media file to Cloud Storage and get a URL first.
    // For this demo, we'll just indicate that a media file was part of the post.
    let mediaUrl: string | undefined = undefined;
    if (media) {
      mediaUrl = "https://placehold.co/800x450.png"; // Placeholder for uploaded media
      toast({ title: "Uploading Media...", description: "Media upload is simulated for this demo."});
    }
    
    try {
      await createPostCallable({ content, mediaUrl, pollOptions });
      toast({ title: "Post Created!", description: "Your post is now live." });
      // Refetch feed to show the new post
      // A more optimistic UI would add the post to the top of the list immediately.
      const result = await getFeed({});
      const posts = (result.data as any).posts as FeedItem[];
      setFeedItems(posts || []);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Failed to create post", variant: "destructive" });
    }
  };
  
  const handleLikePost = async (postId: string) => {
    try {
      // Optimistic update for immediate feedback
      setFeedItems(prevItems => prevItems.map(item => 
        item.id === postId ? { ...item, likes: (item.likes || 0) + 1 } : item
      ));
      await likePostCallable({ postId });
    } catch(error) {
      console.error("Error liking post:", error);
      toast({ title: "Failed to like post", variant: "destructive" });
      // Revert optimistic update on error
       setFeedItems(prevItems => prevItems.map(item => 
        item.id === postId ? { ...item, likes: (item.likes || 0) - 1 } : item
      ));
    }
  };
  
  const handleCommentOnPost = async (postId: string, comment: string) => {
     try {
        await addCommentCallable({ postId, content: comment });
        // Optimistic update
        setFeedItems(prevItems => prevItems.map(item => 
            item.id === postId ? { ...item, comments: (item.comments || 0) + 1 } : item
        ));
        toast({ title: "Comment added!" });
     } catch(error) {
         console.error("Error adding comment:", error);
         toast({ title: "Failed to add comment", variant: "destructive" });
     }
  };

  return (
    <div className="grid md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_300px] xl:grid-cols-[280px_1fr_320px] items-start gap-6 p-4 md:p-6 max-w-screen-2xl mx-auto w-full">
      
      <DashboardLeftSidebar />

      <div className="grid gap-6">
        <StartPost onCreatePost={handleCreatePost} />
        
        {/* Conditional rendering based on user role */}
        {isLoadingRole ? (
           <div className="space-y-6">
             <Skeleton className="h-48 w-full rounded-lg" />
             <Skeleton className="h-64 w-full rounded-lg" />
             <Skeleton className="h-56 w-full rounded-lg" />
           </div>
        ) : (
          <Suspense fallback={<div className="space-y-6"><Skeleton className="h-48 w-full rounded-lg" /><Skeleton className="h-64 w-full rounded-lg" /></div>}>
             {userRole === 'farmer' ? (
               <FarmerHub />
             ) : userRole === 'buyer' ? (
               <BuyerHub />
             ) : userRole === 'logistics' ? (
               <LogisticsHub />
             ) : (
              // Default Feed for 'general' role or if role is not recognized
              isLoadingFeed ? (
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
                <Card><CardContent className="pt-6 text-center text-muted-foreground"><p>No posts in your feed right now.</p><p className="text-sm">Check back later or create a post to get the conversation started!</p></CardContent></Card>
              )
             )}
          </Suspense>
        )}
      </div>

      <DashboardRightSidebar />
      
    </div>
  );
}
