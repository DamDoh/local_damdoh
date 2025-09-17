
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
import type { PostReply } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslations } from 'next-intl';
import { apiCall } from '@/lib/api-utils';

interface GroupPost {
    id: string;
    title: string;
    content: string;
    groupId: string;
    groupName: string; // for breadcrumb
    timestamp: string; // ISO string
    author: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    replyCount: number;
}


const getGroupPostDetails = async (groupId: string, postId: string): Promise<GroupPost | null> => {
    try {
        // Fetch post details using our new API
        const result = await apiCall(`/groups/${groupId}/posts/${postId}`);
        return result as GroupPost;
    } catch (error) {
        console.error("Error fetching post data:", error);
        return null;
    }
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


export default function GroupPostPage() {
    const params = useParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const t = useTranslations('groupsPage.postDetail');
    
    const groupId = params.groupId as string;
    const postId = params.postId as string;

    const [post, setPost] = useState<GroupPost | null>(null);
    const [replies, setReplies] = useState<PostReply[]>([]);
    const [newReply, setNewReply] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const postDetails = await getGroupPostDetails(groupId, postId);
            setPost(postDetails);
        } catch (error) {
            console.error("Error fetching post data:", error);
             toast({
                title: t('toast.loadPostError.title'),
                description: t('toast.loadPostError.description'),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [groupId, postId, toast, t]);

    const fetchReplies = useCallback(async () => {
        try {
            // Fetch replies using our new API
            const result = await apiCall(`/groups/${groupId}/posts/${postId}/replies`);
            setReplies(result as PostReply[]);
        } catch (error) {
            console.error("Error fetching replies:", error);
            toast({
                title: t('toast.loadRepliesError.title'),
                description: t('toast.loadRepliesError.description'),
                variant: "destructive"
            });
        }
    }, [groupId, postId, toast, t]);

    useEffect(() => {
        if (!groupId || !postId) return;
        
        fetchInitialData();
        fetchReplies();
        
        // Set up polling interval for replies
        const intervalId = setInterval(fetchReplies, 5000); // Poll every 5 seconds
        
        return () => clearInterval(intervalId);
    }, [groupId, postId, fetchInitialData, fetchReplies, toast, t]);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || !user) {
            toast({ title: t('toast.emptyReply'), variant: "destructive"});
            return;
        }
        setIsSubmitting(true);
        try {
            // Add reply using our new API
            await apiCall('/groups/add-reply', {
                method: 'POST',
                body: JSON.stringify({ groupId, postId, content: newReply }),
            });
            setNewReply("");
            toast({ title: t('toast.replySuccess') });
            // Refetch replies to update the list
            fetchReplies();
        } catch (error) {
             console.error("Error adding reply:", error);
             toast({
                title: t('toast.submitError.title'),
                description: t('toast.submitError.description'),
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
                    <Link href={`/groups/${groupId}`}>{t('notFound.backButton')}</Link>
                </Button>
            </div>
        );
    }


    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Link href={`/groups/${groupId}`} className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink', { groupName: post.groupName })}
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

            <h2 className="text-xl font-semibold mt-8 mb-4">{t('repliesTitle', { count: replies.length })}</h2>
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
                        <CardTitle>{t('yourReplyTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleReplySubmit}>
                            <div className="grid w-full gap-2">
                                <Textarea 
                                    placeholder={t('replyPlaceholder')}
                                    value={newReply}
                                    onChange={(e) => setNewReply(e.target.value)}
                                    rows={4}
                                    disabled={isSubmitting}
                                />
                                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || !newReply.trim()}>
                                     {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('replySubmittingButton')}</> : <><Send className="mr-2 h-4 w-4"/>{t('replySubmitButton')}</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
