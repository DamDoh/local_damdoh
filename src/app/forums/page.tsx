import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ForumTopic } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Filter, MessageSquare, PlusCircle, Search, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Dummy data for forum topics - replace with actual data fetching
const forumTopics: ForumTopic[] = [
  { id: 'ft1', title: 'Sustainable Farming Practices', description: 'Discuss eco-friendly farming methods, soil health, and water conservation techniques.', postCount: 125, lastActivityAt: new Date(Date.now() - 3600000).toISOString(), creatorId: 'user1', icon: 'Leaf' },
  { id: 'ft2', title: 'Crop Disease Management Q&A', description: 'Share tips on preventing and managing common crop diseases. Ask experts for advice.', postCount: 88, lastActivityAt: new Date(Date.now() - 7200000).toISOString(), creatorId: 'user2', icon: 'ShieldAlert' },
  { id: 'ft3', title: 'Agri-Tech Innovations Showcase', description: 'Explore new technologies in agriculture, including drones, precision farming, and IoT devices.', postCount: 210, lastActivityAt: new Date(Date.now() - 1000000).toISOString(), creatorId: 'user3', icon: 'Cpu' },
  { id: 'ft4', title: 'Market Trends & Pricing Analysis', description: 'Discuss current market trends, commodity prices, and strategies for maximizing profits.', postCount: 150, lastActivityAt: new Date(Date.now() - 86400000).toISOString(), creatorId: 'user4', icon: 'TrendingUp' },
  { id: 'ft5', title: 'Organic Certification Challenges', description: 'Share experiences and advice on navigating the organic certification process.', postCount: 60, lastActivityAt: new Date(Date.now() - 172800000).toISOString(), creatorId: 'user5', icon: 'Award' },
];

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Leaf': return <MessageSquare className="h-8 w-8 text-primary" />; // Default to MessageSquare if specific icons not available
    case 'ShieldAlert': return <MessageSquare className="h-8 w-8 text-primary" />;
    case 'Cpu': return <MessageSquare className="h-8 w-8 text-primary" />;
    case 'TrendingUp': return <MessageSquare className="h-8 w-8 text-primary" />;
    case 'Award': return <MessageSquare className="h-8 w-8 text-primary" />;
    default: return <MessageSquare className="h-8 w-8 text-primary" />;
  }
};

export default function ForumsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Community Forums</CardTitle>
              <CardDescription>Engage in discussions, share knowledge, and connect with peers on various agricultural topics.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/forums/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Forum/Topic
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search forums by title or keyword..." className="pl-10" />
            </div>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter by Category</Button>
          </div>

          <div className="space-y-4">
            {forumTopics.map(topic => (
              <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="p-2 bg-accent/20 rounded-md hidden sm:block">
                       {getIcon(topic.icon)}
                    </div>
                    <div className="flex-grow">
                      <Link href={`/forums/${topic.id}`}>
                        <CardTitle className="text-lg hover:text-primary transition-colors">{topic.title}</CardTitle>
                      </Link>
                      <CardDescription className="mt-1 text-sm line-clamp-2">{topic.description}</CardDescription>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{topic.postCount} posts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Last activity: {new Date(topic.lastActivityAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 sm:ml-auto shrink-0">
                      <Link href={`/forums/${topic.id}`}>View Forum</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {forumTopics.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No forums found.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </CardContent>
        {/* Pagination could go here */}
      </Card>
    </div>
  );
}
