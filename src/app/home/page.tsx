
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

function FeedItemCard({ 
  item, 
  onDeletePost,
  onLike,
  onComment
}: { 
  item: FeedItem, 
  onDeletePost: (postId: string) => void,
  onLike: (postId: string) => void,
  onComment: (postId: string, commentText: string) => void
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [votedOptionIndex, setVotedOptionIndex] = useState<number | null>(null);
  const [currentPollOptions, setCurrentPollOptions] = useState<PollOption[]>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    // Reset local state when the item prop changes (e.g., parent state update)
    setCurrentPollOptions(item.pollOptions?.map(opt => ({ ...opt })) || []);
    setIsLiked(false);
    setVotedOptionIndex(null);
    setShowCommentInput(false);
    setCommentText("");
  }, [item]);

  const handleLike = () => {
    setIsLiked(prev => !prev); // Optimistically toggle the like button's appearance
    onLike(item.id);
  };

  const handleCommentButtonClick = () => {
    setShowCommentInput(prev => !prev);
    if (showCommentInput) {
      setCommentText("");
    }
  };
  
  const handlePostComment = () => {
    if (!commentText.trim()) return;
    onComment(item.id, commentText);
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
            <span>{item.likesCount || 0} Like{item.likesCount === 1 ? '' : 's'}</span>
            <span>{item.commentsCount || 0} Comment{item.commentsCount === 1 ? '' : 's'}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 flex flex-col items-stretch">
        <div className="flex justify-around border-t pt-1">
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
          <div className="mt-3 px-2 space-y-2 border-t pt-3">
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
  const [feedItems, setFeedItems] = useState<FeedItem[]>(initialFeedItems);
  const router = useRouter();
  const pathname = usePathname();
  const { homepagePreference, isPreferenceLoading } = useHomepagePreference();

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

  useEffect(() => {
    if (!isPreferenceLoading && homepagePreference && homepagePreference !== pathname && pathname === '/') {
      router.replace(homepagePreference);
    }
  }, [homepagePreference, isPreferenceLoading, pathname, router]);

  const handleCreatePost = (content: string, media?: File, pollData?: { text: string }[]) => {
    const newPost: FeedItem = {
      id: `post-${Date.now()}`,
      type: pollData && pollData.length > 0 ? 'poll' : 'shared_article', 
      timestamp: new Date().toISOString(),
      userId: 'currentDemoUser', 
      userName: 'Demo User', 
      userAvatar: 'https://placehold.co/40x40.png', 
      userHeadline: 'Agri-Enthusiast | DamDoh Platform',
      content: content,
      postImage: media && media.type.startsWith("image/") ? URL.createObjectURL(media) : undefined,
      dataAiHint: media ? (media.type.startsWith("image/") ? "user content" : "file attachment") : "text post",
      likesCount: 0,
      commentsCount: 0,
      pollOptions: pollData ? pollData.map(opt => ({ text: opt.text, votes: 0 })) : undefined,
    };
    setFeedItems(prevItems => [newPost, ...prevItems]);
  };

  const handleDeletePost = (postId: string) => {
    setFeedItems(prevItems => prevItems.filter(item => item.id !== postId));
  };
  
  const handleLikePost = (postId: string) => {
    setFeedItems(prevItems => 
      prevItems.map(item => {
        if (item.id === postId) {
          // This logic is a simple increment for demo. A real app would track who liked it.
          // The local `isLiked` state in the card will handle the button color change.
          const currentLikes = item.likesCount || 0;
          return { ...item, likesCount: currentLikes + 1 };
        }
        return item;
      })
    );
  };

  const handleCommentOnPost = (postId: string, commentText: string) => {
    console.log(`Comment on post ${postId}: ${commentText}`);
    // Optimistically update the comment count
    setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item.id === postId) {
          return { ...item, commentsCount: (item.commentsCount || 0) + 1 };
        }
        return item;
      })
    );
  };


  const renderDashboard = () => {
    if (isLoadingRole || authLoading) {
      return <DashboardSkeleton />;
    }

    // Default to feed view if no specific role dashboard matches
    const defaultFeedView = (
        <div className="hidden md:grid md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-3">
            <DashboardLeftSidebar />
          </div>
          <div className="md:col-span-6 space-y-6">
            <StartPost onCreatePost={handleCreatePost} />
            <div className="flex items-center gap-2">
              <hr className="flex-grow"/>
              <span className="text-xs text-muted-foreground">Sort by: Top <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></Button></span>
            </div>
            {feedItems.map(item => (
              <FeedItemCard 
                key={item.id} 
                item={item} 
                onDeletePost={handleDeletePost}
                onLike={handleLikePost}
                onComment={handleCommentOnPost}
              />
            ))}
            {feedItems.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center py-10">No activity yet. Share your agricultural insights or explore the network!</p>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="md:col-span-3">
            <DashboardRightSidebar />
          </div>
        </div>
    );

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
        // This includes the mobile view as well as a default for desktop
        return (
          <>
            {/* Mobile View */}
            <div className="md:hidden space-y-6">
              <div className="px-0 pt-2"> 
                <h1 className="text-2xl font-bold mb-4 px-4">Explore DamDoh</h1>

                <div className="relative w-full h-40 sm:h-48 md:h-56 rounded-lg overflow-hidden mb-6">
                  <Image src="https://placehold.co/600x250.png" alt="DamDoh Promotion" fill style={{objectFit: 'cover'}} data-ai-hint="agriculture banner farm" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
                    <h2 className="text-white text-xl font-semibold">Connect & Grow</h2>
                    <p className="text-white/90 text-sm">Your agricultural supply chain hub.</p>
                  </div>
                </div>

                <section className="mb-6">
                  <div className="flex justify-between items-center mb-2 px-4">
                    <h2 className="text-xl font-semibold">Categories</h2>
                    <Link href="/categories" className="text-sm text-primary hover:underline flex items-center">
                      See All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex gap-3 px-4 pb-2">
                      {mobileHomeCategories.map((category) => (
                        <Link key={category.id} href={category.href} className="inline-block">
                          <Card className="w-32 h-32 flex flex-col items-center justify-center p-3 text-center hover:shadow-md transition-shadow">
                            <category.icon className="h-8 w-8 text-primary mb-2" />
                            <p className="text-xs font-medium text-foreground whitespace-normal">{category.name}</p>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                </section>

                <section className="mb-6">
                  <div className="flex justify-between items-center mb-3 px-4">
                      <h2 className="text-xl font-semibold">Discover Opportunities</h2>
                      <Link href="/discover" className="text-sm text-primary hover:underline flex items-center">
                          View More <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                  </div>
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex gap-3 px-4 pb-2">
                      {mobileDiscoverItems.map((item) => (
                        <Link key={item.id} href={item.link} className="inline-block">
                          <Card className="w-40 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative w-full aspect-[3/4]">
                              <Image src={item.imageUrl} alt={item.title} fill style={{objectFit:"cover"}} data-ai-hint={item.dataAiHint || "discover item"}/>
                            </div>
                            <CardContent className="p-2">
                              <p className="text-sm font-medium text-foreground line-clamp-2 h-10 leading-tight">{item.title}</p>
                              <Badge variant="outline" className="mt-1 text-xs">{item.type}</Badge>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                </section>

                <div className="px-4">
                  <StartPost onCreatePost={handleCreatePost} />
                </div>

                <section className="mt-6 px-4 space-y-4">
                  <h2 className="text-xl font-semibold">Feed</h2>
                  {feedItems.map(item => ( 
                    <FeedItemCard 
                      key={item.id} 
                      item={item} 
                      onDeletePost={handleDeletePost}
                      onLike={handleLikePost}
                      onComment={handleCommentOnPost}
                    />
                  ))}
                  {feedItems.length === 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center py-10">No activity yet. Share your agricultural insights!</p>
                      </CardContent>
                    </Card>
                  )}
                </section>
              </div>
            </div>
            {/* Desktop View */}
            {defaultFeedView}
          </>
        );
    }
  };

  if (isPreferenceLoading || (homepagePreference && homepagePreference !== "/" && pathname === "/")) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height,80px)-var(--bottom-nav-height,64px))]"><p>Loading...</p></div>;
  }

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
