
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, PlusCircle, ArrowLeft, Frown, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ForumTopic, ForumPost, UserProfile } from '@/lib/types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

const getTopicDetails = async (topicId: string): Promise<ForumTopic | null> => {
    const db = getFirestore(firebaseApp);
    const topicRef = doc(db, "forums", topicId);
    const topicSnap = await getDoc(topicRef);
    if (topicSnap.exists()) {
        const data = topicSnap.data();
        return {
            id: topicSnap.id,
            ...data,
            lastActivityAt: data.lastActivityAt ? new Date(data.lastActivityAt.seconds * 1000).toISOString() : new Date().toISOString(),
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
        } as ForumTopic;
    }
    return null;
};

const fetchPostAuthors = async (posts: any[]): Promise<Record<string, UserProfile>> => {
    if (!posts || posts.length === 0) return {};
    const db = getFirestore(firebaseApp);
    const authorIds = [...new Set(posts.map(p => p.authorRef))].filter(Boolean) as string[]; // FIX: Filter out undefined/null IDs
    if (authorIds.length === 0) return {};

    const profiles: Record<string, UserProfile> = {};
    
    const userPromises = authorIds.map(id => getDoc(doc(db, "users", id)));
    const userSnaps = await Promise.all(userPromises);

    userSnaps.forEach(userSnap => {
        if (userSnap.exists()) {
            profiles[userSnap.id] = userSnap.data() as UserProfile;
        } else {
            profiles[userSnap.id] = { id: userSnap.id, displayName: "Unknown User", avatarUrl: "" } as UserProfile;
        }
    });

    return profiles;
};


export default function TopicPage() {
    const params = useParams();
    const topicId = params.topicId as string;
    const { toast } = useToast();
    const t = useTranslations('Forums.topic');

    const [topic, setTopic] = useState<ForumTopic | null>(null);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const functions = getFunctions(firebaseApp);
    const getPostsForTopic = useMemo(() => httpsCallable(functions, 'getPostsForTopic'), [functions]);

    const fetchPosts = useCallback(async (isInitialLoad = false) => {
        if(!hasMore && !isInitialLoad) return;
        if(isInitialLoad) setIsLoading(true);
        else setIsLoadingMore(true);

        try {
            const result = await getPostsForTopic({ topicId, lastVisible });
            const data = result.data as { posts?: any[], lastVisible?: any };
            const backendPosts = data?.posts || [];
            
            if (backendPosts.length > 0) {
              const authorProfiles = await fetchPostAuthors(backendPosts);

              const newPosts: ForumPost[] = backendPosts.map((post: any) => ({
                  ...post,
                  timestamp: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
                  author: {
                      id: post.authorRef,
                      name: authorProfiles[post.authorRef]?.displayName || t('unknownUser'),
                      avatarUrl: authorProfiles[post.authorRef]?.avatarUrl || ""
                  }
              }));
              
              setPosts(prev => isInitialLoad ? newPosts : [...prev, ...newPosts]);
              setLastVisible(data.lastVisible);
              setHasMore(!!data.lastVisible);
            } else {
              setHasMore(false);
            }

        } catch (error) {
            console.error("Error fetching posts:", error);
            toast({
                title: t('errors.loadPosts.title'),
                description: t('errors.loadPosts.description'),
                variant: "destructive"
            });
        } finally {
            if(isInitialLoad) setIsLoading(false);
            else setIsLoadingMore(false);
        }
    }, [topicId, lastVisible, getPostsForTopic, toast, hasMore, t]);


    useEffect(() => {
        if (!topicId) return;

        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const topicDetails = await getTopicDetails(topicId);
                setTopic(topicDetails);
                if (topicDetails) {
                    setPosts([]);
                    setLastVisible(null);
                    setHasMore(true);
                    await fetchPosts(true);
                }
            } catch (error) {
                 toast({
                    title: t('errors.loadTopic.title'),
                    description: t('errors.loadTopic.description'),
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId, toast]);

    if (isLoading) {
        return <TopicPageSkeleton />;
    }

    if (!topic) {
        return (
             <div className="container mx-auto max-w-4xl py-8 text-center">
                 <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                 <h3 className="mt-4 text-lg font-semibold">{t('notFound.title')}</h3>
                 <p className="mt-2 text-sm text-muted-foreground">{t('notFound.description')}</p>
                <Button asChild className="mt-4">
                    <Link href="/forums">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('notFound.backButton')}
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Link href="/forums" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink')}
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{topic.name}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-6">
                        <Button asChild>
                            <Link href={`/forums/${topicId}/create-post`}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {t('buttons.createPost')}
                            </Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <Link key={post.id} href={`/forums/${topicId}/${post.id}`} passHref>
                                    <div className="p-4 border rounded-lg hover:bg-accent flex items-start gap-4 transition-colors cursor-pointer">
                                        <Avatar>
                                            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                                            <AvatarFallback>{post.author.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow">
                                            <h4 className="font-semibold">{post.title}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {t('postMeta', { author: post.author.name, date: new Date(post.timestamp).toLocaleDateString() })}
                                            </p>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1 shrink-0">
                                            <MessageSquare className="h-4 w-4" />
                                            {post.replyCount || 0}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">{t('noPosts.title')}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{t('noPosts.description')}</p>
                                <Button asChild className="mt-4">
                                    <Link href={`/forums/${topicId}/create-post`}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        {t('noPosts.button')}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
                 {hasMore && (
                    <CardFooter className="flex justify-center">
                        <Button
                            onClick={() => fetchPosts()}
                            disabled={isLoadingMore}
                            variant="outline"
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('buttons.loadingMore')}
                                </>
                            ) : (
                                t('buttons.loadMore')
                            )}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

const TopicPageSkeleton = () => (
    <div className="container mx-auto max-w-4xl py-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
                <div className="flex justify-end mb-6">
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </CardContent>
        </Card>
    </div>
);
