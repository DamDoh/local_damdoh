import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Users, MessageSquare, PlusCircle, ThumbsUp, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FeedItem, ForumTopic, UserProfile } from "@/lib/types";

// Dummy data for AI suggestions - replace with actual AI flow calls
const suggestedConnections: UserProfile[] = [
  { id: '1', name: 'Alice Farmer', role: 'Farmer', location: 'Green Valley', avatarUrl: 'https://placehold.co/100x100.png', profileSummary: 'Experienced organic farmer specializing in tomatoes.' },
  { id: '2', name: 'Bob Supplier', role: 'Input Supplier', location: 'Central City', avatarUrl: 'https://placehold.co/100x100.png', profileSummary: 'Provides high-quality seeds and fertilizers.' },
  { id: '3', name: 'Carol Processor', role: 'Processor', location: 'Industrial Park', avatarUrl: 'https://placehold.co/100x100.png', profileSummary: 'Transforms raw produce into packaged goods.' },
];

const forumTopicSuggestions: ForumTopic[] = [
  { id: 'ft1', title: 'Sustainable Farming Practices', description: 'Discuss eco-friendly farming methods.', postCount: 120, lastActivityAt: new Date().toISOString(), creatorId: 'user1', icon: 'Leaf' },
  { id: 'ft2', title: 'Crop Disease Management', description: 'Share tips on preventing crop diseases.', postCount: 85, lastActivityAt: new Date().toISOString(), creatorId: 'user2', icon: 'ShieldAlert' },
  { id: 'ft3', title: 'Agri-Tech Innovations', description: 'Explore new technologies in agriculture.', postCount: 200, lastActivityAt: new Date().toISOString(), creatorId: 'user3', icon: 'Cpu' },
];

const recentFeedItems: FeedItem[] = [
  { id: 'feed1', type: 'forum_post', timestamp: new Date(Date.now() - 3600000).toISOString(), userId: 'userA', userName: 'John Doe', userAvatar: 'https://placehold.co/40x40.png', content: 'Just shared a new technique for pest control in the "Organic Farming" forum!', link: '/forums/organic-farming/post123' },
  { id: 'feed2', type: 'marketplace_listing', timestamp: new Date(Date.now() - 7200000).toISOString(), userId: 'userB', userName: 'Jane Smith', userAvatar: 'https://placehold.co/40x40.png', content: 'Fresh batch of organic apples available in the marketplace.', link: '/marketplace/item456' },
  { id: 'feed3', type: 'connection', timestamp: new Date(Date.now() - 10800000).toISOString(), userId: 'userC', userName: 'Mike Johnson', userAvatar: 'https://placehold.co/40x40.png', content: 'is now connected with', relatedUser: { id: 'userD', name: 'Sarah Lee', avatarUrl: 'https://placehold.co/40x40.png' } },
];


export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content: Feed and Quick Actions */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to DamDoh!</CardTitle>
            <CardDescription>Your central hub for agricultural networking and resources.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="w-full sm:w-auto"><Link href="/forums/create"><PlusCircle className="mr-2 h-4 w-4" /> New Post</Link></Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto"><Link href="/marketplace/create"><PlusCircle className="mr-2 h-4 w-4" /> List Item</Link></Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto"><Link href="/talent-exchange/create"><PlusCircle className="mr-2 h-4 w-4" /> Offer Service</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Latest updates from your network and the community.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentFeedItems.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg shadow-sm hover:bg-accent/50 transition-colors">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={item.userAvatar} alt={item.userName} data-ai-hint="profile person" />
                  <AvatarFallback>{item.userName?.substring(0, 1) ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <Link href={`/profiles/${item.userId}`} className="font-semibold hover:underline">{item.userName}</Link>
                    {item.content && ` ${item.content} `}
                    {item.type === 'connection' && item.relatedUser && (
                       <>is now connected with <Link href={`/profiles/${item.relatedUser.id}`} className="font-semibold hover:underline">{item.relatedUser.name}</Link></>
                    )}
                  </p>
                  {item.link && item.type !== 'connection' && (
                     <Link href={item.link} className="text-xs text-primary hover:underline">View {item.type.split('_')[1] || 'item'}</Link>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                   {/* Placeholder for engagement buttons */}
                   <div className="mt-2 flex gap-4 text-muted-foreground">
                      <Button variant="ghost" size="sm" className="p-1 h-auto text-xs"><ThumbsUp className="mr-1 h-3 w-3" /> Like</Button>
                      <Button variant="ghost" size="sm" className="p-1 h-auto text-xs"><MessageCircle className="mr-1 h-3 w-3" /> Comment</Button>
                   </div>
                </div>
              </div>
            ))}
            {recentFeedItems.length === 0 && <p className="text-sm text-muted-foreground">No activity yet. Start connecting!</p>}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View all activity</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Sidebar content: Suggestions */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Suggested Connections</CardTitle>
            <CardDescription>Grow your network with these stakeholders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedConnections.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 border rounded-md hover:shadow-md transition-shadow">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile person" />
                  <AvatarFallback>{user.name.substring(0,1)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link href={`/profiles/${user.id}`} className="font-semibold text-sm hover:underline">{user.name}</Link>
                  <p className="text-xs text-muted-foreground">{user.role} - {user.location}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/profiles/${user.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="link" className="w-full" asChild>
              <Link href="/network">
                Discover More Connections <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hot Forum Topics</CardTitle>
            <CardDescription>Join these trending discussions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {forumTopicSuggestions.map(topic => (
              <Link key={topic.id} href={`/forums/${topic.id}`} className="block p-3 border rounded-md hover:bg-accent/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-sm">{topic.title}</h4>
                    <p className="text-xs text-muted-foreground">{topic.postCount} posts</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
           <CardFooter>
            <Button variant="link" className="w-full" asChild>
              <Link href="/forums">
                Explore All Forums <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
