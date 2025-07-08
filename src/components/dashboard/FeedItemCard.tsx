
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { FeedItem, PostReply, PollOption } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, MoreHorizontal, Edit, Trash2, Share2, Send, CheckCircle } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Loader2 } from 'lucide-react';
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/lib/auth-utils";
import { useTranslations } from "next-intl";

interface FeedItemCardProps {
  item: FeedItem;
  onLike: (id: string) => void;
  onComment: (id: string, commentText: string) => void;
  onDeletePost: (id: string) => void;
}

const functions = getFunctions(firebaseApp);

export function FeedItemCard({ item, onLike, onComment, onDeletePost }: FeedItemCardProps) {
  const t = useTranslations('FeedItemCard');
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  
  const [votedOptionIndex, setVotedOptionIndex] = useState<number | null>(null);
  const [currentPollOptions, setCurrentPollOptions] = useState<PollOption[]>([]);
  
  const voteOnPollCallable = useMemo(() => httpsCallable(functions, 'voteOnPoll'), []);

  useEffect(() => {
      setCurrentPollOptions(item.pollOptions?.map(opt => ({...opt})) || []);
      // Here you could add logic to check if the user has already voted on this poll
      // e.g., by checking a `votes` subcollection on the post.
      // For this implementation, we rely on client-side state after the first vote.
      setVotedOptionIndex(null); 
  }, [item.pollOptions, item.id]);

  const totalVotes = useMemo(() => {
    return currentPollOptions.reduce((acc, opt) => acc + (opt.votes || 0), 0);
  }, [currentPollOptions]);

  
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [replies, setReplies] = useState<PostReply[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  const { toast } = useToast();
  const getCommentsForPost = useMemo(() => httpsCallable(functions, 'getCommentsForPost'), [functions]);
  const { profile: currentUserProfile } = useUserProfile();
  
  useEffect(() => {
    // Reset state when the item prop changes
    setIsLiked(false); 
    setShowCommentInput(false);
    setCommentText("");
    setIsSubmittingComment(false);
    setReplies([]);
    setIsLoadingReplies(false);
    setLastVisible(null);
    setHasMoreComments(true);
  }, [item]);
  

  const handleLike = () => {
    if (!user) { toast({ title: t('signInToLikeToast'), variant: "destructive" }); return; }
    setIsLiked(prev => !prev);
    onLike(item.id);
  };
  
  const fetchComments = useCallback(async (isInitialLoad = false) => {
    if (!hasMoreComments && !isInitialLoad) return;
    setIsLoadingReplies(true);
    try {
      const result = await getCommentsForPost({ postId: item.id, lastVisible: isInitialLoad ? null : lastVisible });
      const data = (result.data as { replies: PostReply[], lastVisible?: any }) || { replies: [], lastVisible: null };
      setReplies(prev => isInitialLoad ? data.replies : [...prev, ...data.replies]);
      setLastVisible(data.lastVisible || null);
      setHasMoreComments(!!data.lastVisible);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast({ title: t('loadCommentsErrorToast'), variant: "destructive" });
    } finally {
      setIsLoadingReplies(false);
    }
  }, [item.id, lastVisible, hasMoreComments, getCommentsForPost, toast, t]);


  const handleCommentButtonClick = async () => {
    const willBeVisible = !showCommentInput;
    setShowCommentInput(willBeVisible);

    if (willBeVisible && replies.length === 0) {
      fetchComments(true); // Initial fetch
    }
  };
  
  const handlePostComment = async () => {
    if (!commentText.trim() || !user) return;
    setIsSubmittingComment(true);
    
    try {
      await onComment(item.id, commentText);
      setCommentText("");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRepost = () => toast({ title: t('repostPlaceholderToast') });
  
  const handlePollVote = async (optionIndex: number) => {
    if (votedOptionIndex !== null || !user) {
        if (!user) toast({ title: t('signInToVoteToast'), variant: "destructive" });
        return;
    }
    
    // Optimistic UI update
    const originalPollOptions = [...currentPollOptions];
    const newPollOptions = [...currentPollOptions];
    newPollOptions[optionIndex] = {
        ...newPollOptions[optionIndex],
        votes: (newPollOptions[optionIndex].votes || 0) + 1
    };
    setCurrentPollOptions(newPollOptions);
    setVotedOptionIndex(optionIndex);

    try {
        await voteOnPollCallable({ postId: item.id, optionIndex });
        toast({ title: t('voteSuccessToast') });
    } catch (error: any) {
        toast({ title: t('voteErrorToast'), description: error.message, variant: "destructive" });
        // Revert UI on error
        setCurrentPollOptions(originalPollOptions);
        setVotedOptionIndex(null);
    }
  };
  
  const isPostAuthor = item.userId === user?.uid;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.userAvatar} alt={item.userName} data-ai-hint="profile person agriculture" />
            <AvatarFallback>{item.userName?.substring(0, 1) ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/profiles/${item.userId}`} className="font-semibold text-sm hover:underline">{item.userName}</Link>
                {item.userHeadline && <p className="text-xs text-muted-foreground">{item.userHeadline}</p>}
                <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</p>
              </div>
               {isPostAuthor && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('editPost')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => onDeletePost(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('deletePost')}
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-2">
        {item.content && <p className="text-sm whitespace-pre-line mb-4">{item.content}</p>}
        {item.type === 'poll' && currentPollOptions.length > 0 && (
          <div className="space-y-2">
            {currentPollOptions.map((option, index) => {
              const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;
              const isVoted = votedOptionIndex === index;
              return (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="w-full justify-start h-auto p-0 overflow-hidden relative"
                  onClick={() => handlePollVote(index)}
                  disabled={votedOptionIndex !== null}
                >
                  {votedOptionIndex !== null && <div className="absolute left-0 top-0 h-full bg-primary/20" style={{ width: `${percentage}%` }}/>}
                  <div className="relative z-10 p-2 flex justify-between w-full items-center">
                    <span className="font-medium">{option.text}</span>
                    <div className="flex items-center gap-2">
                      {isVoted && <CheckCircle className="h-4 w-4 text-primary"/>}
                      {votedOptionIndex !== null && <span className="text-sm font-semibold">{percentage.toFixed(0)}%</span>}
                    </div>
                  </div>
                </Button>
              )
            })}
             <p className="text-xs text-muted-foreground text-right">{totalVotes} {t('votes', {count: totalVotes})}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-2 flex flex-col items-stretch">
        <div className="px-2 flex items-center justify-between text-xs text-muted-foreground mt-2 mb-1">
            <span>{item.likesCount} {t('likes', {count: item.likesCount})}</span>
            <span>{item.commentsCount} {t('comments', {count: item.commentsCount})}</span>
        </div>
        <div className="flex justify-around border-t pt-1">
          <Button variant="ghost" className={`hover:bg-accent/50 w-full ${isLiked ? 'text-primary' : 'text-muted-foreground'}`} onClick={handleLike}>
            <ThumbsUp className="mr-2 h-5 w-5" /> {t('like')}
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleCommentButtonClick}>
            <MessageSquare className="mr-2 h-5 w-5" /> {t('comment')}
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleRepost}>
            <Share2 className="mr-2 h-5 w-5" /> {t('repost')}
          </Button>
        </div>
        
        {showCommentInput && (
          <div className="mt-3 px-2 space-y-2 border-t pt-3 w-full">
             <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {replies.length > 0 ? (
                    replies.map(reply => (
                        <div key={reply.id} className="flex items-start gap-2">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} data-ai-hint="profile person agriculture" />
                                <AvatarFallback>{reply.author.name.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted rounded-md p-2 text-sm">
                                <span className="font-semibold">{reply.author.name}</span>
                                <p className="whitespace-pre-line break-words">{reply.content}</p>
                            </div>
                        </div>
                    ))
                ) : !isLoadingReplies && (
                    <p className="text-xs text-center text-muted-foreground py-2">{t('noComments')}</p>
                )}
                {isLoadingReplies && <div className="flex items-center space-x-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /><span className="text-sm text-muted-foreground">{t('loadingComments')}</span></div>}
                {hasMoreComments && !isLoadingReplies && (
                    <Button variant="link" size="sm" className="w-full" onClick={() => fetchComments()}>{t('loadMoreComments')}</Button>
                )}
            </div>
             <div className="flex items-start gap-2 pt-2">
                <Avatar className="h-7 w-7">
                    <AvatarImage src={currentUserProfile?.avatarUrl || "https://placehold.co/40x40.png"} alt={"Current User"} data-ai-hint="profile agriculture"/>
                    <AvatarFallback>{currentUserProfile?.displayName?.substring(0, 1) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={t('writeCommentPlaceholder')}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[40px] text-sm"
                    autoFocus
                    disabled={isSubmittingComment}
                  />
                   <div className="flex justify-end gap-2 mt-2">
                      <Button size="sm" onClick={handlePostComment} disabled={!commentText.trim() || isSubmittingComment}>
                        {isSubmittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {t('postButton')}
                      </Button>
                    </div>
                </div>
              </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
