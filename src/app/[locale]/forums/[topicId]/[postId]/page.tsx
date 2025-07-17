
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ForumPost, PostReply } from '@/lib/types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { doc, getDoc, getFirestore, onSnapshot, query, collection, orderBy } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslations } from 'next-intl';

// This helper could be centralized in a future refactor
const getPostDetails = async (topicId: string, postId: string): Promise<ForumPost | null> => {
    const db = getFirestore(firebaseApp);
    const postRef = doc(db, `forums/${topicId}/posts`, postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
        const data = postSnap.data();
        
        // Fetch topic details for breadcrumb
        const topicRef = doc(db, "forums", topicId);
        const topicSnap = await getDoc(topicRef);
        const topicName = topicSnap.exists() ? topicSnap.data().name : '';

        return {
            id: postSnap.id,
            title: data.title,
            content: data.content,
            topicId: topicId,
            topicName: topicName,
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
            author: {
                id: data.authorRef,
                name: data.authorName,
                avatarUrl: data.authorAvatarUrl,
            },
            replyCount: data.replyCount || 0,
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
    const params = useParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const t = useTranslations('Forums.postView');
    
    const topicId = params.topicId as string;
    const postId = params.postId as string;

    const [post, setPost] = useState<ForumPost | null>(null);
    const [replies, setReplies] = useState<PostReply[]>([]);
    const [newReply, setNewReply] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const functions = getFunctions(firebaseApp);
    const addReplyToPost = useMemo(() => httpsCallable(functions, 'addReplyToPost'), [functions]);

    useEffect(() => {
        if (!topicId || !postId) return;

        const fetchPostData = async () => {
            try {
                const postDetails = await getPostDetails(topicId, postId);
                setPost(postDetails);
            } catch (error) {
                console.error("Error fetching post data:", error);
                toast({
                    title: t('errors.loadPost.title'),
                    description: t('errors.loadPost.description'),
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchPostData();
        
        const db = getFirestore(firebaseApp);
        const repliesQuery = query(collection(db, `forums/${topicId}/posts/${postId}/replies`), orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(repliesQuery, (snapshot) => {
            const fetchedReplies = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id, 
                    content: data.content,
                    author: {
                        id: data.authorRef,
                        name: data.authorName || 'Unknown User',
                        avatarUrl: data.authorAvatarUrl || null,
                    },
                    timestamp: (data.createdAt as any)?.toDate?.().toISOString() || new Date().toISOString()
                } as PostReply;
            });
            setReplies(fetchedReplies);
        }, (error) => {
            console.error("Error listening for replies:", error);
            toast({
                title: t('errors.loadReplies.title'),
                description: t('errors.loadReplies.description'),
                variant: "destructive"
            });
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
        
    }, [topicId, postId, toast, t]);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || !user) {
            toast({ title: t('errors.emptyReply'), variant: "destructive"});
            return;
        }
        setIsSubmitting(true);
        try {
            await addReplyToPost({ topicId, postId, content: newReply });
            setNewReply("");
            toast({ title: t('reply.success') });
        } catch (error) {
             console.error("Error adding reply:", error);
             toast({
                title: t('errors.submitReply.title'),
                description: t('errors.submitReply.description'),
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
                <h3 className="text-lg font-semibold">{t('notFound.title')}</h3>
                <p className="text-muted-foreground">{t('notFound.description')}</p>
                <Button asChild className="mt-4">
                    <Link href="/forums">{t('notFound.backButton')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Link href={`/forums/${topicId}`} className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink', { topicName: post.topicName })}
            </Link>

            <Card>
                <CardHeader className="border-b">
                    <CardTitle>{post.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                            <AvatarFallback>{post.author.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{t('postMeta', { author: post.author.name, date: new Date(post.createdAt).toLocaleDateString() })}</span>
                    </div>
                </CardHeader>
                <CardContent className="py-6 whitespace-pre-wrap">
                    {post.content}
                </CardContent>
            </Card>

            <h2 className="text-xl font-semibold mt-8 mb-4">{t('repliesTitle', { count: post.replyCount || 0 })}</h2>
            <div className="space-y-4">
                {replies.length > 0 ? (
                    replies.map(reply => (
                        <Card key={reply.id} className="bg-slate-50 dark:bg-slate-800/20">
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
                                <p className="whitespace-pre-line text-sm">{reply.content}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground bg-slate-50 dark:bg-slate-800/20 rounded-lg">
                        <p>{t('noReplies')}</p>
                    </div>
                )}
            </div>
            
            {user && (
                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>{t('reply.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleReplySubmit}>
                            <div className="grid w-full gap-2">
                                <Textarea 
                                    placeholder={t('reply.placeholder')}
                                    value={newReply}
                                    onChange={(e) => setNewReply(e.target.value)}
                                    rows={4}
                                    disabled={isSubmitting}
                                />
                                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || !newReply.trim()}>
                                     {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('reply.submittingButton')}</> : <><Send className="mr-2 h-4 w-4"/>{t('reply.submitButton')}</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
