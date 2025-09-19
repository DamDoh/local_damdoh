
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { FeedItem, PostReply, PollOption } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, ThumbsUp, MoreHorizontal, Edit, Share2, Send, CheckCircle, Trash2, ShoppingCart, Users, Handshake, HelpCircle, Shield, Star, Award, Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from "@/lib/auth-utils";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { apiCall } from '@/lib/api-utils';

interface FeedItemCardProps {
  item: FeedItem;
  onDeletePost: (id: string) => void;
}

export function FeedItemCard({ item, onDeletePost }: FeedItemCardProps) {
  const t = useTranslations('FeedItemCard');
  const format = useFormatter();
  const { user } = useAuth();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const [interestedInBuying, setInterestedInBuying] = useState(false);
  const [wantToCollaborate, setWantToCollaborate] = useState(false);
  const [needSimilarHelp, setNeedSimilarHelp] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [votedOptionIndex, setVotedOptionIndex] = useState<number | null>(null);
  const [currentPollOptions, setCurrentPollOptions] = useState<PollOption[]>([]);
  
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [replies, setReplies] = useState<PostReply[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [doubleTapCount, setDoubleTapCount] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const { toast } = useToast();
  const { profile: currentUserProfile } = useUserProfile();

  // Polling for comments
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchComments = async (isInitialLoad = false) => {
      if (!hasMoreComments && !isInitialLoad) return;
      setIsLoadingReplies(true);
      try {
        // Fetch comments using our new API
        const result = await apiCall(`/community/comments/${item.id}`, {
          method: 'POST',
          body: JSON.stringify({ lastVisible: isInitialLoad ? null : lastVisible }),
        });
        const data = result as { replies: PostReply[], lastVisible: any };
        
        setReplies(prev => isInitialLoad ? (data.replies || []) : [...prev, ...(data.replies || [])]);
        setLastVisible(data.lastVisible);
        setHasMoreComments(!!data.lastVisible);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        toast({ title: t('loadCommentsErrorToast'), variant: "destructive" });
      } finally {
        setIsLoadingReplies(false);
      }
    };

    if (showCommentInput && replies.length === 0) {
      fetchComments(true);
      
      // Set up polling interval for comments
      intervalId = setInterval(fetchComments, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [item.id, lastVisible, hasMoreComments, toast, t, showCommentInput, replies.length]);

  useEffect(() => {
    if (item.pollOptions) {
      setCurrentPollOptions([...item.pollOptions]);
    }
    if (item.type === 'poll' && user) {
        // Check if user has voted on this poll using our new API
        apiCall(`/community/poll-vote/${item.id}/${user.id}`)
            .then((result: any) => {
                if (result.hasVoted) {
                    setVotedOptionIndex(result.optionIndex);
                }
            })
            .catch(error => {
                console.error("Error checking poll vote:", error);
            });
    }
  }, [item.pollOptions, item.id, item.type, user]);

  const totalVotes = useMemo(() => {
    return currentPollOptions.reduce((acc, opt) => acc + (opt.votes || 0), 0);
  }, [currentPollOptions]);

  const handleLike = async () => {
    if (!user) { toast({ title: t('signInToLikeToast'), variant: "destructive" }); return; }

    // Optimistic UI update
    setIsLiked(prev => !prev);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
        // Like post using our new API
        await apiCall('/community/like-post', {
            method: 'POST',
            body: JSON.stringify({ postId: item.id }),
        });
    } catch(error) {
        console.error("Error liking post:", error);
        // Revert optimistic UI update on error
        setIsLiked(prev => !prev);
        setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
        toast({ title: t('likeError.fail'), variant: "destructive" });
    }
  };

  const handleInterestedInBuying = async () => {
    if (!user) { toast({ title: 'Sign in to express interest', variant: "destructive" }); return; }

    setInterestedInBuying(prev => !prev);
    toast({ title: interestedInBuying ? 'Interest removed' : 'Interest expressed!' });
  };

  const handleWantToCollaborate = async () => {
    if (!user) { toast({ title: 'Sign in to collaborate', variant: "destructive" }); return; }

    setWantToCollaborate(prev => !prev);
    toast({ title: wantToCollaborate ? 'Collaboration request withdrawn' : 'Collaboration requested!' });
  };

  const handleNeedSimilarHelp = async () => {
    if (!user) { toast({ title: 'Sign in to request help', variant: "destructive" }); return; }

    setNeedSimilarHelp(prev => !prev);
    toast({ title: needSimilarHelp ? 'Help request removed' : 'Help requested!' });
  };

  const handleBookmark = async () => {
    if (!user) { toast({ title: 'Sign in to bookmark posts', variant: "destructive" }); return; }

    setIsBookmarked(prev => !prev);
    toast({ title: isBookmarked ? 'Bookmark removed' : 'Post bookmarked!' });
  };
  
  const handleCommentButtonClick = () => {
    const willBeVisible = !showCommentInput;
    setShowCommentInput(willBeVisible);
  };
  
  const handlePostComment = async () => {
    if (!commentText.trim() || !user) return;
    setIsSubmittingComment(true);
    try {
      // Add comment using our new API
      await apiCall('/community/add-comment', {
          method: 'POST',
          body: JSON.stringify({ postId: item.id, content: commentText }),
      });
      setCommentText("");
      toast({ title: t('commentSuccess') });
    } catch(error) {
         console.error("Error adding comment:", error);
         toast({ title: t('commentError.fail'), variant: "destructive" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRepost = () => toast({ title: t('repostPlaceholderToast') });

  // Double tap to like functionality
  const handleDoubleTap = () => {
    if (!user) {
      toast({ title: 'Sign in to like posts', variant: "destructive" });
      return;
    }

    if (!isLiked) {
      setShowHeartAnimation(true);
      setIsLiked(true);
      setLikesCount(prev => prev + 1);

      // Hide heart animation after 1 second
      setTimeout(() => setShowHeartAnimation(false), 1000);

      // Trigger like API call
      apiCall('/community/like-post', {
        method: 'POST',
        body: JSON.stringify({ postId: item.id }),
      }).catch(error => {
        console.error("Error liking post:", error);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        toast({ title: t('likeError.fail'), variant: "destructive" });
      });
    }
  };

  const handleTouchStart = () => {
    setDoubleTapCount(prev => prev + 1);

    setTimeout(() => {
      if (doubleTapCount === 1) {
        setDoubleTapCount(0);
      } else if (doubleTapCount >= 2) {
        handleDoubleTap();
        setDoubleTapCount(0);
      }
    }, 300);
  };
  
  const handlePollVote = async (optionIndex: number) => {
    if (votedOptionIndex !== null || !user) {
        if (!user) toast({ title: t('signInToVoteToast'), variant: "destructive" });
        return;
    }
    
    const originalPollOptions = [...currentPollOptions];
    const newPollOptions = [...currentPollOptions];
    newPollOptions[optionIndex] = {
        ...newPollOptions[optionIndex],
        votes: (newPollOptions[optionIndex].votes || 0) + 1
    };
    setCurrentPollOptions(newPollOptions);
    setVotedOptionIndex(optionIndex);

    try {
        // Vote on poll using our new API
        await apiCall('/community/vote-poll', {
            method: 'POST',
            body: JSON.stringify({ postId: item.id, optionIndex }),
        });
        toast({ title: t('voteSuccessToast') });
    } catch (error: any) {
        toast({ title: t('voteErrorToast'), description: error.message, variant: "destructive" });
        setCurrentPollOptions(originalPollOptions);
        setVotedOptionIndex(null);
    }
  };
  
  const isPostAuthor = item.userId === user?.id;
  const isAdmin = currentUserProfile?.primaryRole === 'Admin';


  return (
    <Card className="overflow-hidden relative transition-all duration-200 hover:shadow-lg" onTouchStart={handleTouchStart} onDoubleClick={handleDoubleTap}>
      {/* Heart Animation Overlay */}
      {showHeartAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black bg-opacity-20 rounded-lg">
          <div className="text-red-500 text-6xl animate-ping">❤️</div>
        </div>
      )}

      <CardHeader className="p-4" role="banner" aria-label={`Post by ${item.userName || 'Unknown User'}`}>
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.userAvatar} alt={item.userName} data-ai-hint="profile person agriculture" />
            <AvatarFallback>{item.userName?.substring(0, 1) ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/profiles/${item.userId}`} className="font-semibold text-sm hover:underline">{item.userName}</Link>
                  {/* Trust/Verification Badges */}
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" aria-label="Verified Farmer" />
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-gray-600">4.8</span>
                    </div>
                    <Shield className="h-4 w-4 text-blue-600" aria-label="Trusted Seller" />
                  </div>
                </div>
                {item.userHeadline && <p className="text-xs text-muted-foreground">{item.userHeadline}</p>}
                <p className="text-xs text-muted-foreground">{format.dateTime(new Date(item.timestamp), {dateStyle: 'medium'})}</p>
              </div>
               {(isPostAuthor || isAdmin) && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    {isPostAuthor && (
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('editPost')}
                        </DropdownMenuItem>
                    )}
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
        {item.imageUrl && (
            <div className="relative aspect-video rounded-md overflow-hidden border">
                <Image src={item.imageUrl} alt="Post content" fill style={{ objectFit: 'cover' }} data-ai-hint={item.dataAiHint || 'community post image'} />
            </div>
        )}
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
             <p className="text-xs text-muted-foreground text-right">{t('votes', {count: totalVotes})}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-2 flex flex-col items-stretch">
        <div className="px-2 flex items-center justify-between text-xs text-muted-foreground mt-2 mb-1">
            <span>{likesCount} {t('likes', {count: likesCount})}</span>
            <span>{item.commentsCount} {t('comments', {count: item.commentsCount})}</span>
        </div>
        <div className="border-t pt-1">
           {/* Primary Reactions */}
           <div className="flex justify-around mb-2">
             <Button variant="ghost" className={`hover:bg-accent/50 w-full ${isLiked ? 'text-primary' : 'text-muted-foreground'}`} onClick={handleLike}>
               <ThumbsUp className="mr-2 h-5 w-5" /> {t('like')}
             </Button>
             <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleCommentButtonClick}>
               <MessageSquare className="mr-2 h-5 w-5" /> {t('comment')}
             </Button>
             <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none">
               <Share2 className="mr-2 h-5 w-5" /> {t('repost')}
             </Button>
           </div>

           {/* Agricultural-Specific Reactions */}
           <div className="flex justify-around text-xs">
             <Button
               variant="ghost"
               size="sm"
               className={`hover:bg-accent/50 ${interestedInBuying ? 'text-green-600 bg-green-50' : 'text-muted-foreground'}`}
               onClick={handleInterestedInBuying}
             >
               <ShoppingCart className="mr-1 h-4 w-4" />
               Buy
             </Button>
             <Button
               variant="ghost"
               size="sm"
               className={`hover:bg-accent/50 ${wantToCollaborate ? 'text-blue-600 bg-blue-50' : 'text-muted-foreground'}`}
               onClick={handleWantToCollaborate}
             >
               <Handshake className="mr-1 h-4 w-4" />
               Collaborate
             </Button>
             <Button
               variant="ghost"
               size="sm"
               className={`hover:bg-accent/50 ${needSimilarHelp ? 'text-orange-600 bg-orange-50' : 'text-muted-foreground'}`}
               onClick={handleNeedSimilarHelp}
             >
               <HelpCircle className="mr-1 h-4 w-4" />
               Need Help
             </Button>
             <Button
               variant="ghost"
               size="sm"
               className={`hover:bg-accent/50 ${isBookmarked ? 'text-purple-600 bg-purple-50' : 'text-muted-foreground'}`}
               onClick={handleBookmark}
               aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
             >
               {isBookmarked ? <BookmarkCheck className="mr-1 h-4 w-4" /> : <Bookmark className="mr-1 h-4 w-4" />}
               {isBookmarked ? 'Saved' : 'Save'}
             </Button>
           </div>
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
                    <Button variant="link" size="sm" className="w-full" onClick={() => {
                        // Fetch more comments using our new API
                        apiCall(`/community/comments/${item.id}`, {
                            method: 'POST',
                            body: JSON.stringify({ lastVisible }),
                        })
                        .then((result: any) => {
                            const data = result as { replies: PostReply[], lastVisible: any };
                            setReplies(prev => [...prev, ...(data.replies || [])]);
                            setLastVisible(data.lastVisible);
                            setHasMoreComments(!!data.lastVisible);
                        })
                        .catch(error => {
                            console.error("Failed to fetch more comments:", error);
                            toast({ title: t('loadCommentsErrorToast'), variant: "destructive" });
                        });
                    }}>{t('loadMoreComments')}</Button>
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
