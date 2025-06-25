
"use client";

import { useState, useEffect } from "react";
import type { FeedItem, PollOption, PostReply } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, MoreHorizontal, BarChart3, Edit, Trash2, Share2, Send, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from 'lucide-react';


interface FeedItemCardProps {
  item: FeedItem;
  onLike: (id: string) => void;
  onComment: (id: string, commentText: string) => void;
  onDeletePost: (id: string) => void;
}

export function FeedItemCard({ item, onLike, onComment, onDeletePost }: FeedItemCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(item.likesCount || 0);
  const [currentComments, setCurrentComments] = useState(item.commentsCount || 0);

  const [votedOptionIndex, setVotedOptionIndex] = useState<number | null>(null);
  const [currentPollOptions, setCurrentPollOptions] = useState<PollOption[]>([]);
  
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [replies, setReplies] = useState<PostReply[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const { toast } = useToast();
  const functions = getFunctions(firebaseApp);
  const getRepliesForPost = httpsCallable(functions, 'getRepliesForPost');
  
  useEffect(() => {
    // Reset local state when the item prop changes (e.g., parent state update)
    setCurrentPollOptions(item.pollOptions?.map(opt => ({ ...opt })) || []);
    setCurrentLikes(item.likesCount || 0);
    setCurrentComments(item.commentsCount || 0);
    setIsLiked(false);
    setVotedOptionIndex(null);
    setShowCommentInput(false);
    setCommentText("");
    setIsSubmittingComment(false);
    setReplies([]);
    setIsLoadingReplies(false);
  }, [item]);

  const handleLike = () => {
    setIsLiked(prev => !prev); 
    setCurrentLikes(prev => isLiked ? prev - 1 : prev + 1);
    onLike(item.id);
  };

  const handleCommentButtonClick = async () => {
    const willBeVisible = !showCommentInput;
    setShowCommentInput(willBeVisible);

    if (willBeVisible && replies.length === 0) {
        setIsLoadingReplies(true);
        try {
            // Placeholder: A real implementation would call getRepliesForPost
            console.log("Fetching comments for post:", item.id);
            await new Promise(res => setTimeout(res, 500)); // Simulate network
            setReplies([]); // Set to empty array for now, as getRepliesForPost is not fully implemented
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            toast({ title: "Could not load comments.", variant: "destructive" });
        } finally {
            setIsLoadingReplies(false);
        }
    }
  };
  
  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    
    try {
      await onComment(item.id, commentText);
      
      const newComment: PostReply = {
        id: `temp-${Date.now()}`,
        content: commentText,
        author: { id: 'currentUser', name: 'You', avatarUrl: 'https://placehold.co/40x40.png' },
        timestamp: new Date().toISOString()
      };
      setReplies(prev => [...prev, newComment]);
      setCurrentComments(prev => prev + 1);
      setCommentText("");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRepost = () => {
    toast({ title: "Repost action triggered (placeholder)." });
  };

  const handleSend = () => {
    toast({ title: "Send action triggered (placeholder)." });
  };

  const handlePollVote = (optionIndex: number) => {
    if (votedOptionIndex === null && currentPollOptions.length > 0) {
      const newPollOptions = currentPollOptions.map((opt, idx) => {
        if (idx === optionIndex) {
          return { ...opt, votes: (opt.votes || 0) + 1 };
        }
        return opt;
      });
      setCurrentPollOptions(newPollOptions);
      setVotedOptionIndex(optionIndex);
    }
  };
  
  // A simple check for demo purposes
  const isPostAuthor = item.userId === 'currentDemoUser';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.userAvatar} alt={item.userName} data-ai-hint="profile agriculture person" />
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
                        Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => onDeletePost(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Post
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-2">
        {item.content && <p className="text-sm whitespace-pre-line mb-2">{item.content}</p>}

        {item.postImage && (
          <div className="my-2 rounded-md overflow-hidden border">
            <Image src={item.postImage} alt="Post image" width={600} height={350} className="w-full object-cover" data-ai-hint={item.dataAiHint || "agriculture content"} />
          </div>
        )}

        {currentPollOptions && currentPollOptions.length > 0 && (
          <div className="my-3 p-3 border rounded-md bg-muted/30">
            <div className="space-y-2">
              {currentPollOptions.map((option, index) => (
                <Button
                  key={index}
                  variant={votedOptionIndex === index ? "default" : "outline"}
                  className="w-full justify-between text-left h-auto py-2"
                  onClick={() => handlePollVote(index)}
                  disabled={votedOptionIndex !== null && votedOptionIndex !== index}
                >
                  <span className="flex-1 whitespace-normal break-words">{option.text}</span>
                  {votedOptionIndex !== null && (
                    <span className="text-xs ml-2">{option.votes} vote{option.votes === 1 ? '' : 's'}</span>
                  )}
                  {votedOptionIndex === index && <CheckCircle className="ml-2 h-4 w-4 text-primary-foreground" />}
                </Button>
              ))}
            </div>
          </div>
        )}

         <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 mb-1">
            <span>{currentLikes} Like{currentLikes === 1 ? '' : 's'}</span>
            <span>{currentComments} Comment{currentComments === 1 ? '' : 's'}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 flex flex-col items-stretch">
        <div className="flex justify-around border-t pt-1">
          <Button variant="ghost" className={`hover:bg-accent/50 w-full ${isLiked ? 'text-primary' : 'text-muted-foreground'}`} onClick={handleLike}>
            <ThumbsUp className="mr-2 h-5 w-5" /> Like
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleCommentButtonClick}>
            <MessageSquare className="mr-2 h-5 w-5" /> Comment
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleRepost}>
            <Share2 className="mr-2 h-5 w-5" /> Repost
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleSend}>
            <Send className="mr-2 h-5 w-5" /> Send
          </Button>
        </div>
        
        {showCommentInput && (
          <div className="mt-3 px-2 space-y-2 border-t pt-3">
             <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {isLoadingReplies ? (
                    <div className="flex items-center space-x-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /><span className="text-sm text-muted-foreground">Loading comments...</span></div>
                ) : replies.length > 0 ? (
                    replies.map(reply => (
                        <div key={reply.id} className="flex items-start gap-2">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} data-ai-hint="profile person"/>
                                <AvatarFallback>{reply.author.name.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted rounded-md p-2 text-sm">
                                <span className="font-semibold">{reply.author.name}</span>
                                <p className="whitespace-pre-line break-words">{reply.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-center text-muted-foreground py-2">No comments yet. Be the first to reply!</p>
                )}
            </div>
             <div className="flex items-start gap-2 pt-2">
                <Avatar className="h-7 w-7">
                    <AvatarImage src={"https://placehold.co/40x40.png"} alt={"Current User"} data-ai-hint="profile person agriculture"/>
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[40px] text-sm"
                    autoFocus
                    disabled={isSubmittingComment}
                  />
                   <div className="flex justify-end gap-2 mt-2">
                      <Button size="sm" onClick={handlePostComment} disabled={!commentText.trim() || isSubmittingComment}>
                        {isSubmittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Post
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
