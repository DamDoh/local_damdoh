
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, CalendarDays, BarChart3, Plus } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { CreatePostModal } from './CreatePostModal';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface StartPostProps {
  onCreatePost: (content: string, media?: File, pollOptions?: { text: string }[]) => void;
}

export function StartPost({ onCreatePost }: StartPostProps) {
  const t = useTranslations('StartPost');
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
              <AvatarImage src={profile?.avatarUrl ?? undefined} alt={profile?.displayName} data-ai-hint="profile person" />
              <AvatarFallback>{profile?.displayName?.substring(0,2)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div
              className="flex-grow rounded-full hover:bg-muted/80 focus:bg-muted/90 transition-colors cursor-pointer border border-input h-10 flex items-center px-4 text-muted-foreground text-sm"
              onClick={handleOpenModal}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOpenModal()}

            >
             {t('placeholder')}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-around gap-2 sm:gap-0">
            <Button onClick={handleOpenModal} variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none">
              <ImageIcon className="mr-2 h-5 w-5 text-green-500" /> {t('photoVideo')}
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none" asChild>
                <Link href="/agri-events/create">
                    <CalendarDays className="mr-2 h-5 w-5 text-red-500" /> {t('agriEvent')}
                </Link>
            </Button>
            <Button onClick={handleOpenModal} variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-500" /> {t('createPoll')}
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
