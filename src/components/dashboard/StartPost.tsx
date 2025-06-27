
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, BarChart3, ImageIcon } from "lucide-react";
import { CreatePostModal } from './CreatePostModal'; 
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '../ui/skeleton';

interface StartPostProps {
  onCreatePost: (content: string, media?: File, pollOptions?: { text: string }[]) => void;
}

export function StartPost({ onCreatePost }: StartPostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { profile, loading } = useUserProfile();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-10 flex-grow rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatarUrl} alt={profile?.name} data-ai-hint="profile person" />
              <AvatarFallback>{profile?.name?.substring(0,2)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div
              className="flex-grow rounded-full hover:bg-muted/80 focus:bg-muted/90 transition-colors cursor-pointer border border-input h-10 flex items-center px-4 text-muted-foreground text-sm"
              onClick={handleOpenModal}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOpenModal()}
            >
             Share an agricultural update, market insight, or ask a question...
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-around gap-2 sm:gap-0">
            <Button onClick={handleOpenModal} variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none">
              <ImageIcon className="mr-2 h-5 w-5 text-green-500" /> Photo / Video
            </Button>
            <Button onClick={handleOpenModal} variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none">
              <CalendarDays className="mr-2 h-5 w-5 text-red-500" /> Agri Event
            </Button>
            <Button onClick={handleOpenModal} variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-500" /> Create Poll
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onCreatePost={onCreatePost} 
      />
    </>
  );
}
