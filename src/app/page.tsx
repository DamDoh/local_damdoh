
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle as MessageIcon, Share2, Send, BarChart3, Trash2, ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { FeedItem, PollOption, MobileHomeCategory, MobileDiscoverItem } from "@/lib/types";
import { DashboardLeftSidebar } from "@/components/dashboard/DashboardLeftSidebar";
import { DashboardRightSidebar } from "@/components/dashboard/DashboardRightSidebar";
import { StartPost } from "@/components/dashboard/StartPost";
import Image from "next/image";
import { dummyFeedItems as initialFeedItems, mobileHomeCategories, mobileDiscoverItems } from "@/lib/dummy-data";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { ScrollArea } from '@/components/ui/scroll-area';

function FeedItemCard({ item, onDeletePost }: { item: FeedItem, onDeletePost: (postId: string) => void }) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(item.likesCount || 0);
  const [currentComments, setCurrentComments] = useState(item.commentsCount || 0);
  const [votedOptionIndex, setVotedOptionIndex] = useState<number | null>(null);
  const [currentPollOptions, setCurrentPollOptions] = useState<PollOption[]>([]);

  useEffect(() => {
    setCurrentLikes(item.likesCount || 0);
    setCurrentComments(item.commentsCount || 0);
    // Deep copy poll options to allow local modifications without affecting parent state
    setCurrentPollOptions(item.pollOptions?.map(opt => ({ ...opt })) || []);
    setIsLiked(false); // Reset like status if item changes
    setVotedOptionIndex(null); // Reset poll vote status if item changes
  }, [item]);

  const handleLike = () => {
    if (isLiked) {
      setCurrentLikes(prev => prev - 1);
    } else {
      setCurrentLikes(prev => prev + 1);
    }
    setIsLiked(prev => !prev);
    console.log(`Like toggled for post: ${item.id}. New like status: ${!isLiked}`);
  };

  const handleComment = () => {
    setCurrentComments(prev => prev + 1);
    console.log(`Comment button clicked for post: ${item.id}. (Action: Open comment modal/section)`);
  };

  const handleRepost = () => {
    console.log(`Repost button clicked for post: ${item.id}.`);
    // In a real app, this might call something like:
    // onCreatePost(`Reposted: ${item.content}`, undefined, undefined, item.id);
  };

  const handleSend = () => {
    console.log(`Send button clicked for post: ${item.id}. (Action: Open share/send modal)`);
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
      console.log(`Voted for option: "${currentPollOptions[optionIndex]?.text}" on post: "${item.content}"`);
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
                  <span className="flex-1">{option.text}</span>
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
      <hr />
      <CardFooter className="p-2 flex justify-around">
        <Button variant="ghost" className={`hover:bg-accent/50 w-full ${isLiked ? 'text-primary' : 'text-muted-foreground'}`} onClick={handleLike}>
          <ThumbsUp className="mr-2 h-5 w-5" /> Like
        </Button>
        <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleComment}>
          <MessageIcon className="mr-2 h-5 w-5" /> Comment
        </Button>
        <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleRepost}>
          <Share2 className="mr-2 h-5 w-5" /> Repost
        </Button>
        <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full" onClick={handleSend}>
          <Send className="mr-2 h-5 w-5" /> Send
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function DashboardPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(initialFeedItems);
  const router = useRouter();
  const pathname = usePathname();
  const { homepagePreference, isPreferenceLoading } = useHomepagePreference();

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


  if (isPreferenceLoading || (homepagePreference && homepagePreference !== "/" && pathname === "/")) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height,80px)-var(--bottom-nav-height,64px))]"><p>Loading...</p></div>;
  }

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
            <div className="flex justify-between items-center mb-2 px-4">
                <h2 className="text-xl font-semibold">Discover Opportunities</h2>
                <Link href="/discover" className="text-sm text-primary hover:underline flex items-center">
                    View More <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 px-4 pb-2">
                {mobileDiscoverItems.map((item) => (
                  <Link key={item.id} href={item.link} className="inline-block">
                    <Card className="w-40 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative w-full aspect-[3/4]">
                        <Image src={item.imageUrl} alt={item.title} fill style={{objectFit:"cover"}} data-ai-hint={item.dataAiHint || "discover item"}/>
                      </div>
                      <CardContent className="p-2">
                        <p className="text-xs font-medium text-foreground line-clamp-2 h-8">{item.title}</p>
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
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            {feedItems.slice(0, 3).map(item => ( 
              <FeedItemCard key={item.id} item={item} onDeletePost={handleDeletePost} />
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
            <FeedItemCard key={item.id} item={item} onDeletePost={handleDeletePost} />
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
    </>
  );
}
