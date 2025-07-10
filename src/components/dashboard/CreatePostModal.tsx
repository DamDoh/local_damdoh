

"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Image as ImageIcon, Video, FileText, CalendarDays, BarChart3, PlusCircle, Trash2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { PollOption } from "@/lib/types";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';


interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (content: string, media?: File, pollOptions?: { text: string }[]) => void;
}

const MAX_POLL_OPTIONS = 5;

export function CreatePostModal({ isOpen, onClose, onCreatePost }: CreatePostModalProps) {
  const t = useTranslations('CreatePostModal');
  const [postContent, setPostContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]); // Start with 2 empty options

  const { profile } = useUserProfile();
  const { toast } = useToast();

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setMediaPreview(null); // No preview for non-image files for now
      }
    }
  };

  const handlePost = () => {
    const finalPollOptions = showPollCreator ? pollOptions.filter(opt => opt.trim()) : [];

    if (showPollCreator && finalPollOptions.length < 2) {
      toast({ title: t('pollOptionsError'), variant: "destructive" });
      return;
    }

    if (!postContent.trim() && !mediaFile && (!showPollCreator || finalPollOptions.length < 2)) {
      toast({ title: t('emptyPostError'), variant: "destructive" });
      return;
    }

    const activePollOptions = showPollCreator ? finalPollOptions.map(opt => ({ text: opt })) : undefined;
    onCreatePost(postContent, mediaFile || undefined, activePollOptions);
    resetModal();
  };

  const resetModal = () => {
    setPostContent("");
    setMediaFile(null);
    setMediaPreview(null);
    setShowPollCreator(false);
    setPollOptions(["", ""]);
    onClose();
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < MAX_POLL_OPTIONS) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleRemovePollOption = (indexToRemove: number) => {
    if (pollOptions.length > 2) { // Ensure at least 2 options remain
      setPollOptions(pollOptions.filter((_, index) => index !== indexToRemove));
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  
  const handleTogglePollCreator = () => {
    setShowPollCreator(!showPollCreator);
    if (!showPollCreator) {
       setPollOptions(["",""]); // Reset to 2 options when opening
    }
  };


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetModal()}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-4 border-b">
          <VisuallyHidden>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </VisuallyHidden>
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName} data-ai-hint="profile person" />
              <AvatarFallback>{profile?.displayName?.substring(0, 1) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profile?.displayName || t('yourName')}</p>
              <p className="text-xs font-normal text-muted-foreground">{t('shareUpdate')}</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-4">
            <Textarea
              placeholder={t('placeholder')}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[120px] border-none focus-visible:ring-0 text-base resize-none"
            />

            {mediaPreview && (
              <div className="relative group">
                <Image src={mediaPreview} alt="Media preview" width={550} height={300} className="rounded-md object-contain max-h-[300px] w-full" data-ai-hint="post image" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={() => { setMediaFile(null); setMediaPreview(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            {mediaFile && !mediaPreview && (
              <div className="text-sm text-muted-foreground p-2 border rounded-md">
                {t('selectedFile')} {mediaFile.name} ({mediaFile.type})
                 <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => { setMediaFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                 </Button>
              </div>
            )}

            {showPollCreator && (
              <div className="space-y-3 p-3 border rounded-md bg-muted/50">
                <Label className="text-sm font-medium">{t('pollOptionsLabel')}</Label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder={t('pollOptionPlaceholder', { index: index + 1 })}
                      value={option}
                      onChange={(e) => handlePollOptionChange(index, e.target.value)}
                      maxLength={80}
                      className="h-9"
                    />
                    {pollOptions.length > 2 && (
                       <Button variant="ghost" size="icon" onClick={() => handleRemovePollOption(index)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                {pollOptions.length < MAX_POLL_OPTIONS && (
                  <Button variant="outline" size="sm" onClick={handleAddPollOption} className="mt-1">
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('addOptionButton')}
                  </Button>
                )}
                 <p className="text-xs text-muted-foreground">{t('pollNote', { maxOptions: MAX_POLL_OPTIONS })}</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <Separator />
        
        <div className="p-4 flex flex-wrap items-center justify-between gap-2 border-t">
          <div className="flex items-center gap-1">
            <input type="file" ref={fileInputRef} onChange={handleMediaChange} accept="image/*,video/*" style={{ display: 'none' }} id="media-upload" />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title={t('addMediaButton')}>
              <ImageIcon className="h-5 w-5 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" asChild title={t('createEventButton')}>
              <Link href="/agri-events/create"><CalendarDays className="h-5 w-5 text-red-500" /></Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => console.log("Share document clicked")} title={t('shareDocumentButton')}>
              <FileText className="h-5 w-5 text-orange-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleTogglePollCreator} title={t('createPollButton')} className={showPollCreator ? "bg-primary/20" : ""}>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </Button>
          </div>
          <DialogFooter className="sm:justify-end p-0 mt-0">
            <Button 
              onClick={handlePost}
            >
              {t('postButton')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
