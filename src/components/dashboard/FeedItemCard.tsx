
"use client";

import type { FeedItem } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, MoreHorizontal, BarChart3, Edit, Trash2 } from "lucide-react";
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

interface FeedItemCardProps {
  item: FeedItem;
  onLike?: (id: string) => void;
  onComment?: (id: string, comment: string) => void;
  // Conceptual: Add functions for edit/delete if the current user is the author
  // onEdit?: (id: string) => void;
  // onDelete?: (id: string) => void;
  // currentUserId?: string; // To check if the current user is the author
}

export function FeedItemCard({ item, onLike, onComment }: FeedItemCardProps) {
  const { id, user, timestamp, content, media, pollOptions, likes, comments } = item;
  
  const totalPollVotes = pollOptions?.reduce((sum, option) => sum + (option.votes || 0), 0) || 0;
  // Conceptual: Check if the current user has liked this post
  // const isLikedByCurrentUser = likes?.some(like => like.userId === currentUserId);
  const isLikedByCurrentUser = Math.random() > 0.5; // Placeholder for UI development
  const isPostAuthor = true; // Placeholder for edit/delete menu

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <Avatar>
          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile picture" />
          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/profiles/${user.id}`} className="font-semibold hover:underline">
                {user.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {user.headline} &bull; {new Date(timestamp).toLocaleDateString()}
              </p>
            </div>
            {isPostAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{content}</p>
        {media && (
          <div className="mt-3 rounded-lg overflow-hidden border relative">
            <Image
              src={media.url}
              alt="Post media"
              width={800}
              height={450}
              className="object-cover w-full"
              data-ai-hint="social media post image"
            />
          </div>
        )}
        {pollOptions && (
          <div className="mt-3 space-y-2">
            <h3 className="font-medium flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Poll</h3>
            {pollOptions.map((option) => {
              const percentage = totalPollVotes > 0 ? ((option.votes || 0) / totalPollVotes) * 100 : 0;
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option.text}</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={percentage} />
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">{totalPollVotes} votes</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="ghost" onClick={() => onLike?.(id)} className={isLikedByCurrentUser ? 'text-primary' : 'text-muted-foreground'}>
          <ThumbsUp className="mr-2 h-4 w-4" /> 
          Like ({likes})
        </Button>
        <Button variant="ghost" className="text-muted-foreground">
          <MessageSquare className="mr-2 h-4 w-4" /> 
          Comment ({comments})
        </Button>
      </CardFooter>
    </Card>
  );
}
