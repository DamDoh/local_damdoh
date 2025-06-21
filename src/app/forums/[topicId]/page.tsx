
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ForumTopic, ForumPost as ForumPostType } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Clock, MessageSquare, ThumbsUp, Send, UserCircle, Truck, Leaf, ShieldAlert, Brain, TrendingUp, Award, Tractor, Package, Wheat } from "lucide-react";
import { dummyUsersData } from "@/lib/dummy-data";
import { useParams, notFound } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getForumTopicByIdFromDB, getForumPostsByTopicIdFromDB } from "@/lib/db-utils";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to get the correct icon for a topic
const getIcon = (iconName?: string) => {
    const iconProps = { className: "h-7 w-7 text-primary" };
    switch (iconName) {
        case 'Leaf': return <Leaf {...iconProps} />;
        case 'ShieldAlert': return <ShieldAlert {...iconProps} />;
        case 'Brain': return <Brain {...iconProps} />;
        case 'TrendingUp': return <TrendingUp {...iconProps} />;
        case 'Award': return <Award {...iconProps} />;
        case 'Tractor': return <Tractor {...iconProps} />;
        case 'Package': return <Package {...iconProps} />;
        case 'Wheat': return <Wheat {...iconProps} />;
        case 'Truck': return <Truck {...iconProps} />;
        default: return <MessageSquare {...iconProps} />;
    }
};

function ForumPost({ post }: { post: ForumPostType }) {
  // Use dummy data as a fallback for author details
  const author = dummyUsersData[post.authorId] || { name: 'Unknown User', role: 'Stakeholder', avatarUrl: '' };
  return (
    <Card className="shadow-sm bg-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={author.avatarUrl} alt={author.name} data-ai-hint="profile agriculture" />
            <AvatarFallback>{author.name.substring(0,1)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/profiles/${post.authorId}`} className="font-semibold text-sm hover:underline">{author.name}</Link>
                {author.role && <p className="text-xs text-muted-foreground">{author.role}</p>}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(post.createdAt).toLocaleString()}</p>
            </div>
            <p className="mt-2 text-sm text-foreground/90 whitespace-pre-line">{post.content}</p>
            <div className="mt-3 flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <ThumbsUp className="mr-1 h-4 w-4" /> {post.likes} Likes
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <MessageSquare className="mr-1 h-4 w-4" /> Reply
              </Button>
            </div>
          </div>
        </div>
        {post.replies && post.replies.length > 0 && (
          <div className="ml-10 mt-4 space-y-3 border-l pl-4">
            {post.replies.map(reply => <ForumPost key={reply.id} post={reply} />)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopicPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-3/4" />
          </div>
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <Card><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
        <Card><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}

export default function ForumTopicPage() {
  const params = useParams();
  const { toast } = useToast();
  const topicId = params.topicId as string;

  const [forumTopic, setForumTopic] = useState<ForumTopic | null>(null);
  const [forumPosts, setForumPosts] = useState<ForumPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!topicId) {
        setIsLoading(false);
        return;
    }

    async function fetchData() {
        setIsLoading(true);
        try {
            const [topicData, postsData] = await Promise.all([
                getForumTopicByIdFromDB(topicId),
                getForumPostsByTopicIdFromDB(topicId),
            ]);

            if (topicData) {
                setForumTopic(topicData);
                setForumPosts(postsData);
            } else {
                setForumTopic(null); // Explicitly set to null if not found
            }
        } catch (error) {
            console.error("Error fetching forum data:", error);
            toast({ variant: "destructive", title: "Failed to load topic", description: "Could not fetch the discussion details. Please try again." });
        } finally {
            setIsLoading(false);
        }
    }

    fetchData();
  }, [topicId, toast]);

  if (isLoading) {
    return <TopicPageSkeleton />;
  }

  if (!forumTopic) {
    // This will be triggered if getForumTopicByIdFromDB returns null
    return notFound();
  }
  
  const creator = dummyUsersData[forumTopic.creatorId] || { name: 'Unknown Creator' };
  
  const handleContribute = () => {
      toast({
          title: "Contribution Submitted (Simulated)",
          description: "Your post has been added to the discussion.",
      });
      // In a real app, this would clear the textarea and refresh the posts list
  };

  return (
    <div className="space-y-6">
      <Link href="/forums" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Agri-Supply Chain Forums
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon(forumTopic.icon)}
            <CardTitle className="text-3xl">{forumTopic.title}</CardTitle>
          </div>
          <CardDescription className="text-md mt-1">{forumTopic.description}</CardDescription>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>{forumTopic.postCount} contributions</span>
            <span>Created by: <Link href={`/profiles/${forumTopic.creatorId}`} className="text-primary hover:underline">{creator.name}</Link></span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contribute to the Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-start">
             <Avatar className="h-10 w-10 border mt-1">
                <AvatarImage src={dummyUsersData['currentDemoUser']?.avatarUrl} alt={dummyUsersData['currentDemoUser']?.name} data-ai-hint="profile supply chain" />
                <AvatarFallback><UserCircle /></AvatarFallback>
            </Avatar>
            <Textarea placeholder="Share your experience, ask a question, or offer a solution..." className="min-h-[100px] flex-grow" />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleContribute}><Send className="mr-2 h-4 w-4" />Post Contribution</Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contributions</h2>
        {forumPosts.length > 0 ? (
            forumPosts.map(post => <ForumPost key={post.id} post={post} />)
        ) : (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No contributions in this topic yet. Be the first to share your insights!
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
