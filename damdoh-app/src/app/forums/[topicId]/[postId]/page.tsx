
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ForumPost, UserProfile, PostReply } from '@/lib/types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslation } from 'react-i18next';

// This helper could be centralized in a future refactor
const getPostDetails = async (topicId: string, postId: string): Promise<ForumPost | null> => {
    const db = getFirestore(firebaseApp);
    const postRef = doc(db, `forums/${topicId}/posts`, postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
        const data = postSnap.data();
        
        const authorRef = data.authorRef;
        let author: UserProfile | null = null;
        if(authorRef) {
            const userRef = doc(db, "users", authorRef);
            const userSnap = await getDoc(userRef);
            author = userSnap.exists() 
                ? { id: userSnap.id, ...userSnap.data() } as UserProfile
                : { id: data.authorRef, displayName: "Unknown User", photoURL: "" } as any;
        }
        
        const topicRef = doc(db, "forums", topicId);
        const topicSnap = await getDoc(topicRef);
        const topicName = topicSnap.exists() ? topicSnap.data().name : '';

        return {
            id: postSnap.id,
            ...data,
            timestamp: data.timestamp ? new Date(data.timestamp.seconds * 1000).toISOString() : new Date().toISOString(),
            author: {
                id: data.authorRef,
                name: author?.displayName || "Unknown User",
                avatarUrl: author?.photoURL || ""
            },
            topicName: topicName,
        } as ForumPost;
    }
    return null;
};

const PostPageSkeleton = () => (
    <div className="container mx-auto max-w-3xl py-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 border-b">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-96" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="py-6">
                <div className="space-y-3 mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </CardContent>
        </Card>
        
        <div className="mt-8">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    </div>
);


export default function PostPage() {
    const { t } = useTranslation('common');
    const params = useParams();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const topicId = params.topicId as string;
    const postId = params.postId as string;

    const [post, setPost] = useState<ForumPost | null>(null);
    const [replies, setReplies] = useState<PostReply[]>([]);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [newReply, setNewReply] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const functions = getFunctions(firebaseApp);
    const getRepliesForPost = useMemo(() => httpsCallable(functions, 'getRepliesForPost'), [functions]);
    const addReplyToPost = useMemo(() => httpsCallable(functions, 'addReplyToPost'), [functions]);

    const fetchReplies = useCallback(async (isInitialLoad = false) => {
        if(!hasMore && !isInitialLoad) return;
        if(isInitialLoad) setIsLoading(true);
        else setIsLoadingMore(true);

        try {
            const result = await getRepliesForPost({ topicId, postId, lastVisible });
            const data = (result.data as any);
            const backendReplies = data.replies || [];
            
            const db = getFirestore(firebaseApp);
            const authorIds = [...new Set(backendReplies.map((r: any) => r.authorRef))];
            const profiles: Record<string, UserProfile> = {};

            if (authorIds.length > 0) {
                const userPromises = authorIds.map(id => getDoc(doc(db, "users", id as string)));
                const userSnaps = await Promise.all(userPromises);

                userSnaps.forEach(userSnap => {
                    if (userSnap.exists()) {
                        profiles[userSnap.id] = { id: userSnap.id, ...userSnap.data() } as UserProfile;
                    } else {
                        profiles[userSnap.id] = { id: userSnap.id, displayName: "Unknown User", photoURL: "" } as any;
                    }
                });
            }

            const enrichedReplies: PostReply[] = backendReplies.map((reply: any) => ({
                ...reply,
                id: reply.id,
                timestamp: reply.timestamp,
                author: {
                    id: reply.authorRef,
                    name: profiles[reply.authorRef]?.displayName || "Unknown User",
                    avatarUrl: profiles[reply.authorRef]?.photoURL || ""
                }
            }));
            
            setReplies(prev => isInitialLoad ? enrichedReplies : [...prev, ...enrichedReplies]);
            setLastVisible(data.lastVisible);
            setHasMore(backendReplies.length > 0);

        } catch (error) {
             console.error("Error fetching replies:", error);
            toast({
                title: t('forums.post.detail.errorLoadRepliesTitle'),
                description: t('forums.post.detail.errorLoadRepliesDescription'),
                variant: "destructive"
            });
        } finally {
            if(isInitialLoad) setIsLoading(false);
            else setIsLoadingMore(false);
        }
    }, [topicId, postId, lastVisible, getRepliesForPost, toast, hasMore, t]);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const postDetails = await getPostDetails(topicId, postId);
            setPost(postDetails);
            if(postDetails){
               await fetchReplies(true);
            }
        } catch (error) {
            console.error("Error fetching post data:", error);
             toast({
                title: t('forums.post.detail.errorLoadPostTitle'),
                description: t('forums.post.detail.errorLoadPostDescription'),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [topicId, postId, fetchReplies, toast, t]);


    useEffect(() => {
        if (!topicId || !postId) return;
        fetchInitialData();
    }, [topicId, postId, fetchInitialData]);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || !user) {
            toast({ title: t('forums.post.detail.errorEmptyReply'), variant: "destructive"});
            return;
        }
        setIsSubmitting(true);
        try {
            await addReplyToPost({ topicId, postId, content: newReply });
            setNewReply("");
            toast({ title: t('forums.post.detail.successReplyTitle') });
            // Reset replies and fetch from the beginning
            setReplies([]);
            setLastVisible(null);
            await fetchReplies(true);
        } catch (error) {
             console.error("Error adding reply:", error);
             toast({
                title: t('forums.post.detail.failReplyTitle'),
                description: t('forums.post.detail.failReplyDescription'),
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    

    if (isLoading) {
        return <PostPageSkeleton />;
    }

    if (!post) {
        return (
            <div className="container mx-auto max-w-3xl py-8 text-center">
                <h3 className="text-lg font-semibold">{t('forums.post.detail.notFoundTitle')}</h3>
                <p className="text-muted-foreground">{t('forums.post.detail.notFoundDescription')}</p>
                <Button asChild className="mt-4">
                    <Link href="/forums">{t('forums.backToForums')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Link href={`/forums/${topicId}`} className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('forums.post.detail.backButton', { topicName: post.topicName })}
            </Link>

            <Card>
                <CardHeader className="border-b">
                    <CardTitle>{post.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                            <AvatarFallback>{post.author.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{post.author.name}</span>
                        <span>&bull;</span>
                        <span>{new Date(post.timestamp).toLocaleString()}</span>
                    </div>
                </CardHeader>
                <CardContent className="py-6 whitespace-pre-wrap">
                    {post.content}
                </CardContent>
            </Card>

            <h2 className="text-xl font-semibold mt-8 mb-4">{t('forums.post.detail.repliesTitle', { count: post.replyCount || 0 })}</h2>
            <div className="space-y-4">
                {replies.length > 0 ? (
                    replies.map(reply => (
                        <Card key={reply.id} className="bg-slate-50">
                            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
                                 <Avatar className="h-8 w-8">
                                    <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
                                    <AvatarFallback>{reply.author.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{reply.author.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(reply.timestamp).toLocaleString()}</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg">
                        <p>{t('forums.post.detail.noReplies')}</p>
                    </div>
                )}
                 {hasMore && (
                    <div className="flex justify-center">
                        <Button
                            onClick={() => fetchReplies()}
                            disabled={isLoadingMore}
                            variant="outline"
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('forums.post.detail.loadingMoreButton')}
                                </>
                            ) : (
                                t('forums.post.detail.loadMoreButton')
                            )}
                        </Button>
                    </div>
                )}
            </div>
            
            {user && (
                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>{t('forums.post.detail.addReplyTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleReplySubmit}>
                            <div className="grid w-full gap-2">
                                <Textarea 
                                    placeholder={t('forums.post.detail.addReplyPlaceholder')}
                                    value={newReply}
                                    onChange={(e) => setNewReply(e.target.value)}
                                    rows={4}
                                    disabled={isSubmitting}
                                />
                                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || !newReply.trim()}>
                                    {isSubmitting ? t('forums.post.detail.submittingButton') : t('forums.post.detail.submitButton')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
