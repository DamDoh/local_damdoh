
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageCircle as MessageIcon, Share2, Send } from "lucide-react"; // Renamed MessageSquare to MessageIcon to avoid conflict
import Link from "next/link";
import type { FeedItem } from "@/lib/types";
import { DashboardLeftSidebar } from "@/components/dashboard/DashboardLeftSidebar";
import { DashboardRightSidebar } from "@/components/dashboard/DashboardRightSidebar";
import { StartPost } from "@/components/dashboard/StartPost";
import Image from "next/image"; // Added Image import

// Dummy data for recent feed items - enhanced for LinkedIn style
const recentFeedItems: FeedItem[] = [
  { 
    id: 'feed1', 
    type: 'forum_post', 
    timestamp: new Date(Date.now() - 3600000).toISOString(), 
    userId: 'userA', 
    userName: 'Samuel Chen', 
    userAvatar: 'https://placehold.co/40x40.png', 
    content: 'Thrilled and honored to be accepted into the Stanford GSB Executive Education. SEP brings together global leaders to challenge conventional thinking, expand leadership capacity, and drive ...more', 
    link: '/forums/stanford-gsb/post123',
    // additional fields for linkedin style
    userHeadline: "Building with Purpose and Impact",
    postImage: "https://placehold.co/600x350.png",
    likesCount: 41,
    commentsCount: 6,
  },
  { 
    id: 'feed2', 
    type: 'marketplace_listing', 
    timestamp: new Date(Date.now() - 7200000).toISOString(), 
    userId: 'userB', 
    userName: 'Miles Loo, Jr.', 
    userAvatar: 'https://placehold.co/40x40.png', 
    content: "Excited to be speaking at #DatacloudGlobalCongress as we celebrate 20 years of shaping digital infrastructure! Register here: https://lnkd.in/eT_t7s7R — more\n\nI'M SPEAKING AT\nCelebrating 20 years of transforming global digital infrastructure", 
    link: '/marketplace/item456',
    userHeadline: "Vice Chairman | Global V&A Lead - Data Centers & Life Science ...",
    postImage: "https://placehold.co/600x400.png", // Placeholder for the event image
    likesCount: 120,
    commentsCount: 15,
  },
];


function FeedItemCard({ item }: { item: FeedItem }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.userAvatar} alt={item.userName} data-ai-hint="profile person" />
            <AvatarFallback>{item.userName?.substring(0, 1) ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/profiles/${item.userId}`} className="font-semibold text-sm hover:underline">{item.userName}</Link>
                {item.userHeadline && <p className="text-xs text-muted-foreground">{item.userHeadline}</p>}
                <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()} • Edited</p>
              </div>
              {/* Three dots menu placeholder */}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-2">
        <p className="text-sm whitespace-pre-line mb-2">{item.content}</p>
        {item.postImage && (
          <div className="my-2 rounded-md overflow-hidden border">
            <Image src={item.postImage} alt="Post image" width={600} height={350} className="w-full object-cover" data-ai-hint="article event" />
          </div>
        )}
         <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 mb-1">
            {item.likesCount && <span>{item.likesCount} Likes</span>}
            {item.commentsCount && <span>{item.commentsCount} Comments</span>}
        </div>
      </CardContent>
      <hr />
      <CardFooter className="p-2 flex justify-around">
        <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full">
          <ThumbsUp className="mr-2 h-5 w-5" /> Like
        </Button>
        <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full">
          <MessageIcon className="mr-2 h-5 w-5" /> Comment
        </Button>
        <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full">
          <Share2 className="mr-2 h-5 w-5" /> Repost
        </Button>
        <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 w-full">
          <Send className="mr-2 h-5 w-5" /> Send
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar */}
      <div className="md:col-span-3 hidden md:block">
        <DashboardLeftSidebar />
      </div>

      {/* Main content: Feed and Quick Actions */}
      <div className="md:col-span-6 space-y-6">
        <StartPost />
        <div className="flex items-center gap-2">
            <hr className="flex-grow"/>
            <span className="text-xs text-muted-foreground">Sort by: Top <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></Button></span>
        </div>
        {recentFeedItems.map(item => (
          <FeedItemCard key={item.id} item={item} />
        ))}
        {recentFeedItems.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center py-10">No activity yet. Start connecting or post something!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="md:col-span-3 hidden md:block">
        <DashboardRightSidebar />
      </div>
    </div>
  );
}
