
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Video, Image as ImageIcon, FileText, Mic, CalendarDays, BarChart3 } from "lucide-react";
import { dummyUsersData } from "@/lib/dummy-data";
import { CreatePostModal } from './CreatePostModal'; // Import the modal

interface StartPostProps {
  onCreatePost: (content: string, media?: File, pollOptions?: { text: string }[]) => void;
}

export function StartPost({ onCreatePost }: StartPostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUserAvatar = dummyUsersData['currentDemoUser']?.avatarUrl || "https://placehold.co/40x40.png";
  const currentUserFallback = dummyUsersData['currentDemoUser']?.name?.substring(0,2).toUpperCase() || "DU";

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={currentUserAvatar} alt="Demo User" data-ai-hint="profile person" />
              <AvatarFallback>{currentUserFallback}</AvatarFallback>
            </Avatar>
            <Input
              placeholder="Share an agricultural update, market insight, or ask a question..."
              className="flex-grow rounded-full hover:bg-muted/80 focus:bg-muted/90 transition-colors cursor-pointer"
              onClick={handleOpenModal}
              readOnly // Make it readOnly as it's just a trigger
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-around gap-2 sm:gap-0">
            <Button onClick={handleOpenModal} variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none">
              <ImageIcon className="mr-2 h-5 w-5 text-green-500" /> Photo / Video
            </Button>
            <Button onClick={handleOpenModal} variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none">
              <CalendarDays className="mr-2 h-5 w-5 text-red-500" /> Agri Event
            </Button>
            <Button onClick={handleOpenModal} variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none">
              <FileText className="mr-2 h-5 w-5 text-orange-500" /> Share Document
            </Button>
            <Button onClick={handleOpenModal} variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary flex-1 sm:flex-none">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-500" /> Create Poll
            </Button>
          </div>
        </CardContent>
      </Card>
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreatePost={onCreatePost} 
      />
    </>
  );
}
