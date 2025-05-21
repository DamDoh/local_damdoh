
"use client"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ForumTopic } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Filter, MessageSquare, PlusCircle, Search, Users, Clock, Leaf, ShieldAlert, Brain, TrendingUp, Award, Tractor, Package, Wheat, Truck, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { dummyForumTopics } from "@/lib/dummy-data"; // Import dummy data

const getIcon = (iconName?: string) => {
  const iconProps = { className: "h-8 w-8 text-primary" };
  switch (iconName) {
    case 'Leaf': return <Leaf {...iconProps} />;
    case 'ShieldAlert': return <ShieldAlert {...iconProps} />;
    case 'Brain': return <Brain {...iconProps} />;
    case 'TrendingUp': return <TrendingUp {...iconProps} />;
    case 'Award': return <Award {...iconProps} />;
    case 'Tractor': return <Tractor {...iconProps} />;
    case 'Package': return <Package {...iconProps} />;
    case 'Wheat': return <Wheat {...iconProps} />;
    case 'Truck': return <Truck {...iconProps} />;
    default: return <MessageSquare {...iconProps} />;
  }
};

export default function ForumsPage() {
  const [searchTerm, setSearchTerm] = useState(""); 
  // Use imported dummyForumTopics
  const forumTopics = dummyForumTopics;

  const filteredForumTopics = forumTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Agricultural Supply Chain Forums</CardTitle>
              <CardDescription>Discuss, share knowledge, and collaborate on all aspects of the agri-food system.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild>
                <Link href="/forums/create">
                  <PlusCircle className="mr-2 h-4 w-4" /> Start New Discussion
                </Link>
              </Button>
              <Button variant="outline">
                <Pin className="mr-2 h-4 w-4" /> Set as Homepage
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search forums by topic (e.g., 'cold chain', 'export markets')..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter by Category</Button>
          </div>

          <div className="space-y-4">
            {filteredForumTopics.map(topic => (
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
                          <span>{topic.postCount} contributions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Last activity: {new Date(topic.lastActivityAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 sm:ml-auto shrink-0">
                      <Link href={`/forums/${topic.id}`}>Join Discussion</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredForumTopics.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No forums found matching your search.</p>
              <p className="text-sm text-muted-foreground">Try a different search term or be the first to start a discussion!</p>
            </div>
          )}
           {forumTopics.length === 0 && searchTerm === "" && ( 
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No forums available yet.</p>
              <p className="text-sm text-muted-foreground">Be the first to start a discussion on an agricultural topic!</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
