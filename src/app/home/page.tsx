
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageCircle as MessageIcon, Share2, Send, BarChart3, Trash2, ChevronRight, CheckCircle, Edit } from "lucide-react";
import Link from "next/link";
import type { FeedItem, PollOption, MobileHomeCategory, MobileDiscoverItem } from "@/lib/types";
import { DashboardLeftSidebar } from "@/components/dashboard/DashboardLeftSidebar";
import { DashboardRightSidebar } from "@/components/dashboard/DashboardRightSidebar";
import { StartPost } from "@/components/dashboard/StartPost";
import Image from 'next/image';
import { dummyFeedItems as initialFeedItems, mobileHomeCategories, mobileDiscoverItems } from "@/lib/dummy-data";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { ScrollArea } from '@/components/ui/scroll-area';
import { FarmerDashboard } from "@/components/dashboard/hubs/FarmerDashboard";
import { BuyerDashboard } from "@/components/dashboard/hubs/BuyerDashboard";
import { RegulatorDashboard } from "@/components/dashboard/hubs/RegulatorDashboard";
import { LogisticsDashboard } from "@/components/dashboard/hubs/LogisticsDashboard";
import { FiDashboard } from "@/components/dashboard/hubs/FiDashboard";
import { FieldAgentDashboard } from "@/components/dashboard/hubs/FieldAgentDashboard";
import { InputSupplierDashboard } from "@/components/dashboard/hubs/InputSupplierDashboard";
import { EnergyProviderDashboard } from "@/components/dashboard/hubs/EnergyProviderDashboard";
import { PackagingSupplierDashboard } from "@/components/dashboard/hubs/PackagingSupplierDashboard";
import { ProcessingUnitDashboard } from "@/components/dashboard/hubs/processing-logistics/ProcessingUnitDashboard";
import { WarehouseDashboard } from "@/components/dashboard/hubs/processing-logistics/WarehouseDashboard";
import { AgroExportDashboard } from "@/components/dashboard/hubs/processing-logistics/AgroExportDashboard";
import { QaDashboard } from "@/components/dashboard/hubs/QaDashboard";
import { CertificationBodyDashboard } from "@/components/dashboard/hubs/CertificationBodyDashboard";
import { ResearcherDashboard } from "@/components/dashboard/hubs/ResearcherDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/lib/auth-utils';
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";

function FeedItemCard({ item, onDeletePost }: { item: FeedItem, onDeletePost: (postId: string) => void }) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(item.likesCount || 0);
  const [currentComments, setCurrentComments] = useState(item.commentsCount || 0);
  const [votedOptionIndex, setVotedOptionIndex] = useState<number | null>(null);
  const [currentPollOptions, setCurrentPollOptions] = useState<PollOption[]>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    setCurrentLikes(item.likesCount || 0);
    setCurrentComments(item.commentsCount || 0);
    setCurrentPollOptions(item.pollOptions?.map(opt => ({ ...opt })) || []);
    setIsLiked(false);
    setVotedOptionIndex(null);
    setShowCommentInput(false);
    setCommentText("");
  }, [item]);

  // Debug log for showCommentInput state
  useEffect(() => {
    console.log(`FeedItem [${item.id}]: showCommentInput state changed to: ${showCommentInput}`);
  }, [showCommentInput, item.id]);

  const handleLike = () => {
    if (isLiked) {
      setCurrentLikes(prev => prev - 1);
    } else {
      setCurrentLikes(prev => prev + 1);
    }
    setIsLiked(prev => !prev);
    console.log(`Like toggled for post: ${item.id}. New like status: ${!isLiked}`);
  };

  const handleCommentButtonClick = () => {
    setShowCommentInput(prev => !prev); // Toggle the state
    if (showCommentInput) { // If we are closing it by clicking again
        setCommentText(""); // Clear text when hiding
    }
  };
  
  const handlePostComment = () => {
    if (!commentText.trim()) return;
    setCurrentComments(prev => prev + 1);
    console.log(`Posted comment on post ${item.id}: "${commentText}"`);
    setCommentText(""); 
    setShowCommentInput(false); 
  };

  const handleCancelComment = () => {
    setCommentText("");
    setShowCommentInput(false);
  };

  const handleRepost = () => {
    console.log(`Repost button clicked for post: ${item.id}.`);
  };

  const handleSend = () => {
    console.log(`Send button clicked for post: ${item.id}.`);
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
      console.log(`Voted for option: "${currentPollOptions[optionIndex]?.text}" on post: "${item.id}"`);
    } else {
      console.log(`Already voted or poll not available for post: "${item.id}"`);
    }
  };

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
                <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()} • Edited</p>
              </div>
              {item.userId === 'currentDemoUser' && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDeletePost(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
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
            {item.type === 'poll' && !item.content && <p className="text-sm font-medium mb-2">Poll:</p>}
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
            {votedOptionIndex !== null && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Total votes might be shown here in a real app.
              </p>
            )}
          </div>
        )}

         <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 mb-1">
            <span>{currentLikes} Like{currentLikes === 1 ? '' : 's'}</span>
            <span>{currentComments} Comment{currentComments === 1 ? '' : 's'}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 flex flex-col items-stretch"> {/* Footer is now flex-col */}
        <div className="flex justify-around border-t pt-1"> {/* Action buttons in their own row */}
          <Button variant="ghost" className={`hover:bg-accent/50 w-full ${isLiked ? 'text-primary' : 'text-muted-foreground'}`} onClick={handleLike}>
            <ThumbsUp className="mr-2 h-5 w-5" /> Like
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleCommentButtonClick}>
            <MessageIcon className="mr-2 h-5 w-5" /> Comment
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleRepost}>
            <Share2 className="mr-2 h-5 w-5" /> Repost
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleSend}>
            <Send className="mr-2 h-5 w-5" /> Send
          </Button>
        </div>
        
        {showCommentInput && (
          <div className="mt-3 px-2 space-y-2 border-t pt-3"> {/* Comment input section as a new block */}
            <Textarea
              placeholder="Write your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[60px] text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancelComment}>Cancel</Button>
              <Button size="sm" onClick={handlePostComment} disabled={!commentText.trim()}>
                Post Comment
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}


export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchUserRole = async () => {
        const db = getFirestore(firebaseApp);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await userDocRef.get();
        if (userDoc.exists()) {
          setUserRole(userDoc.data()?.primaryRole || "farmer"); 
        } else {
          setUserRole("farmer"); 
        }
        setIsLoadingRole(false);
      };
      fetchUserRole();
    } else if (!authLoading) {
      setIsLoadingRole(false);
    }
  }, [user, authLoading]);

  const renderDashboard = () => {
    if (isLoadingRole || authLoading) {
      return <DashboardSkeleton />;
    }

    switch (userRole) {
      case "farmer":
        return <FarmerDashboard />;
      case "buyer":
        return <BuyerDashboard />;
      case "regulator":
        return <RegulatorDashboard />;
      case "logistics_partner":
        return <LogisticsDashboard />;
      case "fi":
        return <FiDashboard />;
      case "field_agent":
        return <FieldAgentDashboard />;
      case "input_supplier":
        return <InputSupplierDashboard />;
      case "energy_provider":
        return <EnergyProviderDashboard />;
      case "packaging_supplier":
        return <PackagingSupplierDashboard />;
      case "processing_unit":
        return <ProcessingUnitDashboard />;
      case "warehouse":
        return <WarehouseDashboard />;
      case "agro_export":
        return <AgroExportDashboard />;
      case "qa":
        return <QaDashboard />;
      case "certification_body":
        return <CertificationBodyDashboard />;
      case "researcher":
        return <ResearcherDashboard />;
      default:
        return <FarmerDashboard />;
    }
  };

  return <div className="p-4 md:p-6">{renderDashboard()}</div>;
}

const DashboardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg lg:col-span-2" />
        <Skeleton className="h-96 w-full rounded-lg" />
    </div>
);
