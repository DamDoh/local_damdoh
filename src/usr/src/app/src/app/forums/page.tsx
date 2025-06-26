
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ForumTopic } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Filter, MessageSquare, PlusCircle, Search, Users, Clock, Leaf, ShieldAlert, Brain, TrendingUp, Award, Tractor, Package, Wheat, Truck, Pin, PinOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { dummyForumTopics } from "@/lib/dummy-data";
import { usePathname } from "next/navigation";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { useToast } from "@/hooks/use-toast";

const getIcon = (iconName?: string) => {
  const iconPropsBase = "h-6 w-6 text-primary";
  const iconPropsDesktop = "h-8 w-8 text-primary";
  switch (iconName) {
    case 'Leaf': return <Leaf className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'ShieldAlert': return <ShieldAlert className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Brain': return <Brain className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'TrendingUp': return <TrendingUp className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Award': return <Award className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Tractor': return <Tractor className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Package': return <Package className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Wheat': return <Wheat className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Truck': return <Truck className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    default: return <MessageSquare className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
  }
};

export default function ForumsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const forumTopics = dummyForumTopics;

  const pathname = usePathname();
  const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();
  const { toast } = useToast();

  const filteredForumTopics = useMemo(() => {
    return forumTopics.filter(topic =>
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm, forumTopics]);

  const isCurrentHomepage = homepagePreference === pathname;

  const handleSetHomepage = () => {
    if (isCurrentHomepage) {
      clearHomepagePreference();
      toast({
        title: "Homepage Unpinned!",
        description: "The Dashboard is now your default homepage.",
      });
    } else {
      setHomepagePreference(pathname);
      toast({
        title: "Homepage Pinned!",
        description: "Forums are now your default homepage.",
      });
    }
  };


  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl">Agricultural Supply Chain Forums</CardTitle>
              <CardDescription className="text-sm md:text-base">Discuss, share knowledge, and collaborate on all aspects of the agri-food system.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/forums/create">
                  <PlusCircle className="mr-2 h-4 w-4" /> Start New Discussion
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSetHomepage} className="w-full sm:w-auto">
                {isCurrentHomepage ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                {isCurrentHomepage ? "Unpin Homepage" : "Pin as Homepage"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forums..."
                className="pl-10 h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-10 text-sm shrink-0">
              <Filter className="mr-2 h-4 w-4" /> Filter by Category
            </Button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {filteredForumTopics.length > 0 ? (
              filteredForumTopics.map(topic => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="p-2 bg-accent/20 rounded-md hidden sm:block shrink-0">
                       {getIcon(topic.icon)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <Link href={`/forums/${topic.id}`}>
                        <CardTitle className="text-base md:text-lg hover:text-primary transition-colors truncate">{topic.title}</CardTitle>
                      </Link>
                      <CardDescription className="mt-1 text-xs md:text-sm line-clamp-2">{topic.description}</CardDescription>
                      <div className="mt-2 md:mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
                    <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 sm:ml-auto shrink-0 text-xs h-8 px-3">
                      <Link href={`/forums/${topic.id}`}>Join</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
            ) : (
                <div className="text-center py-10">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-md md:text-lg text-muted-foreground">No forums found matching your search.</p>
                    <p className="text-sm text-muted-foreground">Try a different search term or be the first to <Link href="/forums/create" className="text-primary hover:underline">start a discussion</Link>!</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    