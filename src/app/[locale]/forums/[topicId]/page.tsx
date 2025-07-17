"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, PlusCircle, ArrowLeft, Frown, Loader2, Send, ChevronDown, ChevronUp } from "lucide-react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ForumTopic, ForumPost, ForumReply } from '@/lib/types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-utils';
import { formatDistanceToNow } from 'date-fns';


const getTopicDetails = async (topicId: string): Promise<ForumTopic | null> => {
    const db = getFirestore(firebaseApp);
    const topicRef = doc(db, "forumTopics", topicId);
    const topicSnap = await getDoc(topicRef);
    if (topicSnap.exists()) {
        const data = topicSnap.data();
        return {
            id: topicSnap.id,
            ...data,
            lastActivityAt: (data.lastActivityAt as any)?.toDate ? (data.lastActivityAt as any).toDate().toISOString() : new Date().toISOString(),
            createdAt: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate().toISOString() : new Date().toISOString(),
        } as ForumTopic;
    }
    return null;
};

export default function TopicPage() {
    const params = useParams();
    const topicId = params.topicId as string;
    const { toast } = useToast(); // Destructure toast hook
    const t = useTranslations('Forums.topic');

    const [topic, setTopic] = useState<ForumTopic | null>(null);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const { user } = useAuth(); // Get authenticated user
    const functions = getFunctions(firebaseApp); // Use firebaseApp instance
    const getPostsForTopic = useMemo(() => httpsCallable(functions, 'getPostsForTopic'), [functions]);

    const fetchPosts = useCallback(async (isInitialLoad = false) => {
        if(!hasMore && !isInitialLoad) return;
        if(isInitialLoad) setIsLoading(true);
        else setIsLoadingMore(true);

        try {
            const result = await getPostsForTopic({ topicId, lastVisible: isInitialLoad ? null : lastVisible });
            const data = result.data as { posts?: ForumPost[], lastVisible?: any };
            const backendPosts = data?.posts || [];
            
            if (backendPosts.length > 0) {
              setPosts(prev => isInitialLoad ? backendPosts : [...prev, ...backendPosts]);
              setLastVisible(data.lastVisible);
              setHasMore(!!data.lastVisible);
            } else {
              setHasMore(false);
            }

        } catch (error) {
            console.error("Error fetching posts:", error);
            toast({ // Use destructured toast
                title: t('errors.loadPosts.title'), // Use translated string
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
                 toast({ // Use destructured toast
                    title: t('errors.loadTopic.title'), // Use translated string
                    description: t('errors.loadTopic.description'),
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId, toast, t]);

    if (isLoading) {
        return <TopicPageSkeleton />;
    }

    if (!topic) {
        return (
             <div className="container mx-auto max-w-4xl py-8 text-center">
                 <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                 <h3 className="mt-4 text-lg font-semibold">{t('notFound.title')}</h3> {/* Use translated string */}
                 <p className="mt-2 text-sm text-muted-foreground">{t('notFound.description')}</p> {/* Use translated string */}
                <Button asChild className="mt-4">
                    <Link href="/forums">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {/* Use lucide-react icon */}
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
                {t('backLink')} {/* Use translated string */}
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{t('title', { topicName: topic.name })}</CardTitle> {/* Use translated string with interpolation */}
                    <CardDescription>{t('description', { topicDescription: topic.description })}</CardDescription> {/* Use translated string with interpolation */}
                </CardHeader>
                <CardContent>
                     {user && (
                        <CreatePostInput topicId={topicId} onPostCreated={fetchPosts} /> // Render CreatePostInput component
                     )}

                    <div className="space-y-4">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostItem key={post.id} post={post} topicId={topicId} /> // Render PostItem component for each post
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">{t('noPosts')}</h3> {/* Use translated string */}
                                <p className="mt-2 text-sm text-muted-foreground">{t('noPostsDescription')}</p> {/* Use translated string */}
                                <Button asChild className="mt-4">
                                    <Link href={`/forums/${topicId}/create-post`}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        {t('createPost.submitButton')} {/* Use translated string */}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
                {hasMore && !isLoading && (
                    <CardFooter className="flex justify-center">
                        <Button
                            onClick={() => fetchPosts()}
                            disabled={isLoadingMore}
                            variant="outline"
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('loadMorePosts.loading')} {/* Use translated string */}
                                </>
                            ) : (
                                t('loadMorePosts.button') // Use translated string
                            )}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

// Component for individual post items
function PostItem({ post, topicId }: { post: ForumPost; topicId: string }) {
    const t = useTranslations('Forums.topic'); // Use correct namespace
    const { user } = useAuth();
    const { toast } = useToast();
    const functions = getFunctions(firebaseApp);
    const getRepliesForPost = useMemo(() => httpsCallable(functions, 'getRepliesForPost'), [functions]);
    const addReplyToPost = useMemo(() => httpsCallable(functions, 'addReplyToPost'), [functions]);

    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<ForumReply[]>([]);
    const [replyLastVisible, setReplyLastVisible] = useState<any>(null);
    const [hasMoreReplies, setHasMoreReplies] = useState(true);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [isLoadingMoreReplies, setIsLoadingMoreReplies] = useState(false);
    const [newReplyContent, setNewReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const fetchReplies = useCallback(async (isInitialLoad = false) => {
        if (!hasMoreReplies && !isInitialLoad) return;
        if (isInitialLoad) setIsLoadingReplies(true);
        else setIsLoadingMoreReplies(true);

        try {
            const result = await getRepliesForPost({
                topicId,
                postId: post.id,
                lastVisible: isInitialLoad ? null : replyLastVisible
            });
            const data = result.data as { replies?: ForumReply[], lastVisible?: any };
            const backendReplies = data?.replies || [];

            if (backendReplies.length > 0) {
                setReplies(prev => isInitialLoad ? backendReplies : [...prev, ...backendReplies]);
                setReplyLastVisible(data.lastVisible);
                setHasMoreReplies(!!data.lastVisible);
            } else {
                setHasMoreReplies(false);
            }

        } catch (error) {
            console.error("Error fetching replies:", error);
            toast({
                title: t('errors.loadReplies.title'), // Use translated string
                description: t('errors.loadReplies.description'), // Use translated string
                variant: "destructive"
            });
        } finally {
            if (isInitialLoad) setIsLoadingReplies(false);
            else setIsLoadingMoreReplies(false);
        }
    }, [topicId, post.id, replyLastVisible, getRepliesForPost, hasMoreReplies, toast, t]); // Include all dependencies

    const handleAddReply = useCallback(async () => {
        if (!user || !newReplyContent.trim()) return;

        setIsSubmittingReply(true);
        try {
            const newReply = {
                topicId,
                postId: post.id,
                content: newReplyContent.trim(),
            };
            await addReplyToPost(newReply);
            setNewReplyContent('');
            // Refetch replies to show the new one
            fetchReplies(true);
            toast({
                title: t('replyAdded.title'), // Use translated string
                description: t('replyAdded.description'), // Use translated string
            });
        } catch (error) {
            console.error("Error adding reply:", error);
            toast({
                title: t('errors.addReply.title'), // Use translated string
                description: t('errors.addReply.description'), // Use translated string
                variant: "destructive"
            });
        } finally {
            setIsSubmittingReply(false);
        }
    }, [user, newReplyContent, topicId, post.id, addReplyToPost, fetchReplies, toast, t]); // Include all dependencies

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddReply();
        }
    }, [handleAddReply]);

    useEffect(() => {
        if (showReplies && post.replyCount > 0) {
            fetchReplies(true);
        } else if (!showReplies) {
            // Clear replies when hiding
            setReplies([]);
            setReplyLastVisible(null);
            setHasMoreReplies(true);
        }
    }, [showReplies, post.replyCount, fetchReplies]);

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                    <AvatarFallback>{post.author.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow overflow-hidden">
                    <h4 className="font-semibold">{post.title}</h4>
                    <p className="text-xs text-muted-foreground">
                        {t('post.postedBy', { authorName: post.author.name })} {t('post.postedOn', { date: formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) })} {/* Use translated strings with interpolation */}
                    </p>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{post.content}</p>
                    {post.replyCount > 0 && (
                        <Button variant="link" size="sm" onClick={() => setShowReplies(!showReplies)} className="mt-2 p-0 h-auto text-muted-foreground">
                            {showReplies ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}
                            {t('post.replies', { count: post.replyCount })} {/* Use translated string with pluralization */}
                        </Button>
                    )}
                </div>
            </div>

            {showReplies && (
                <div className="ml-12 mt-4 space-y-3 border-l pl-4">
                    {isLoadingReplies ? (
                        <Skeleton className="h-16 w-full" />
                    ) : replies.length > 0 ? (
                        replies.map(reply => (
                            <div key={reply.id} className="text-sm pb-2 border-b last:border-b-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
                                        <AvatarFallback className="text-xs">{reply.author.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{reply.author.name}</span>
                                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground italic">{t('post.noReplies')}</p> // Use translated string
                    )}
                     {hasMoreReplies && !isLoadingReplies && (
                        <div className="flex justify-center mt-2">
                            <Button onClick={() => fetchReplies()} disabled={isLoadingMoreReplies} variant="outline" size="sm">
                                {isLoadingMoreReplies ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronDown className="mr-1 h-4 w-4" />}
                                {isLoadingMoreReplies ? t('post.loadingMoreReplies') : t('post.loadMoreReplies')} {/* Use translated strings */}
                            </Button>
                        </div>
                    )}
                    {user && (
                        <div className="mt-4 flex gap-2 items-start">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                             <div className="flex-grow flex items-end gap-2">
                                <Textarea
                                    placeholder={t('post.addReplyPlaceholder')} // Use translated string
                                    className="flex-grow resize-none"
                                    rows={1}
                                    value={newReplyContent}
                                    onChange={(e) => setNewReplyContent(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <Button size="icon" onClick={handleAddReply} disabled={!newReplyContent.trim() || isSubmittingReply}>
                                    {isSubmittingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Component for the "Create Post" input area
function CreatePostInput({ topicId, onPostCreated }: { topicId: string; onPostCreated: () => void }) {
    const t = useTranslations('Forums.topic'); // Use correct namespace
    const { user } = useAuth();
    const { toast } = useToast();
    const functions = getFunctions(firebaseApp);
    const createForumPost = useMemo(() => httpsCallable(functions, 'createForumPost'), [functions]);

    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitPost = useCallback(async () => {
        if (!user || !postTitle.trim() || !postContent.trim()) return;

        setIsSubmitting(true);
        try {
            const newPost = {
                topicId,
                title: postTitle.trim(),
                content: postContent.trim(),
            };
            await createForumPost(newPost);
            setPostTitle('');
            setPostContent('');
            onPostCreated(); // Trigger a refetch of posts in the parent component
            toast({
                title: t('postCreated.title'), // Use translated string
                description: t('postCreated.description'), // Use translated string
            });
        } catch (error) {
            console.error("Error creating post:", error);
            toast({
                title: t('errors.createPost.title'), // Use translated string
                description: t('errors.createPost.description'), // Use translated string
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [user, postTitle, postContent, topicId, createForumPost, onPostCreated, toast, t]); // Include all dependencies

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>{t('createPost.title')}</CardTitle> {/* Use translated string */}
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('createPost.postTitleLabel')} {/* Use translated string */}
                    </label>
                    <Input
                        id="postTitle"
                        placeholder={t('createPost.postTitlePlaceholder')} // Use translated string
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('createPost.contentLabel')} {/* Use translated string */}
                    </label>
                    <Textarea
                        id="postContent"
                        placeholder={t('createPost.contentPlaceholder')} // Use translated string
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                    />
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSubmitPost} disabled={!postTitle.trim() || !postContent.trim() || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('createPost.submittingButton')} {/* Use translated string */}
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {t('createPost.submitButton')} {/* Use translated string */}
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
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


"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, PlusCircle, ArrowLeft, Frown, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ForumTopic, ForumPost } from '@/lib/types';
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
            lastActivityAt: (data.lastActivityAt as any)?.toDate ? (data.lastActivityAt as any).toDate().toISOString() : new Date().toISOString(),
            createdAt: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate().toISOString() : new Date().toISOString(),
        } as ForumTopic;
    }
    return null;
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
            const result = await getPostsForTopic({ topicId, lastVisible: isInitialLoad ? null : lastVisible });
            const data = result.data as { posts?: ForumPost[], lastVisible?: any };
            const backendPosts = data?.posts || [];
            
            if (backendPosts.length > 0) {
              setPosts(prev => isInitialLoad ? backendPosts : [...prev, ...backendPosts]);
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
    }, [topicId, toast, t]);

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
                                        <div className="flex-grow overflow-hidden">
                                            <h4 className="font-semibold">{post.title}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {t('postMeta', { author: post.author.name, date: new Date(post.createdAt).toLocaleDateString() })}
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
                 {hasMore && !isLoading && (
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
